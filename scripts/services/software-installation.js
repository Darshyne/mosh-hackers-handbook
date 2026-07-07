import { ICON_DEVICE, ICON_SOFTWARE, MODULE_ID, OLD_MODULE_ID, SOUND_UPLOAD } from "../content.js";

const t = (key, data = {}) => game.i18n.format(key, data);

export function hhData(item) {
  return foundry.utils.deepClone(item?.flags?.[MODULE_ID] ?? item?.flags?.[OLD_MODULE_ID] ?? {});
}

export function isDevice(item) {
  return item?.type === "item" && hhData(item).subtype === "hacking-device";
}

export function isSoftware(item) {
  return item?.type === "item" && hhData(item).subtype === "hacking-software";
}

export function isEquipment(item) {
  return item?.type === "item" && hhData(item).subtype === "hacking-equipment";
}

export function isHackingItem(item) {
  return isDevice(item) || isSoftware(item) || isEquipment(item);
}

export function maxSlots(device) {
  const value = hhData(device).softwareSlots;
  if (typeof value === "object") return Number(value?.max ?? 0); // Migration V0.1.
  return Number(value ?? 0);
}

export function installedSoftware(device) {
  const actor = device?.parent;
  if (!actor) return [];
  return actor.items.filter(item => isSoftware(item) && hhData(item).installedIn === device.id);
}

export function usedSlots(device) {
  return installedSoftware(device).reduce((total, software) => total + Number(hhData(software).slots ?? 1), 0);
}

export function availableSlots(device) {
  return Math.max(0, maxSlots(device) - usedSlots(device));
}

export function uninstalledSoftware(actor) {
  return actor.items.filter(item => isSoftware(item) && !hhData(item).installedIn);
}

function playUploadSound() {
  try {
    // false = lecture locale uniquement : aucun autre client ne reçoit le son.
    AudioHelper.play({
      src: SOUND_UPLOAD,
      volume: 0.72,
      autoplay: true,
      loop: false
    }, false);
  } catch (error) {
    console.warn(`${MODULE_ID} | ${t("MOSHHH.UploadSoundFailed")}`, error);
  }
}

export async function installSoftware(device, software) {
  if (!isDevice(device)) { ui.notifications.warn(t("MOSHHH.ItemNotDevice")); return null; }
  if (!isSoftware(software)) { ui.notifications.warn(t("MOSHHH.ItemNotSoftware")); return null; }
  if (!device.parent || software.parent?.id !== device.parent.id) {
    ui.notifications.warn(t("MOSHHH.SameActorRequired"));
    return null;
  }

  const needed = Number(hhData(software).slots ?? 1);
  if (availableSlots(device) < needed) {
    ui.notifications.warn(t("MOSHHH.NotEnoughSlots", { device: device.name }));
    return null;
  }

  const quantity = Number(software.system?.quantity ?? 1);
  if (quantity > 1) {
    const clone = software.toObject();
    delete clone._id;
    foundry.utils.setProperty(clone, "system.quantity", 1);
    foundry.utils.setProperty(clone, `flags.${MODULE_ID}.installedIn`, device.id);
    foundry.utils.setProperty(clone, `flags.${OLD_MODULE_ID}.installedIn`, device.id);
    await software.update({ "system.quantity": quantity - 1 });
    await device.parent.createEmbeddedDocuments("Item", [clone]);
  } else {
    await software.update({
      [`flags.${MODULE_ID}.installedIn`]: device.id,
      [`flags.${OLD_MODULE_ID}.installedIn`]: device.id
    });
  }
  playUploadSound();
  ui.notifications.info(t("MOSHHH.SoftwareInstalled", { software: software.name, device: device.name }));
  return device;
}

export async function ejectSoftware(software) {
  if (!isSoftware(software)) return false;
  await software.update({
    [`flags.${MODULE_ID}.installedIn`]: null,
    [`flags.${OLD_MODULE_ID}.installedIn`]: null
  });
  playUploadSound();
  ui.notifications.info(t("MOSHHH.SoftwareEjected", { software: software.name }));
  return true;
}

export async function useSoftware(software) {
  if (!isSoftware(software)) return;
  const data = hhData(software);
  const activation = data.activation ?? {};
  const description = software.system?.description ?? "";
  const rollText = activation.roll ? `<p><strong>${t("MOSHHH.AssociatedRollLabel")} :</strong> [[/r ${activation.roll}]]</p>` : "";

  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: software.parent ?? null }),
    content: `<h2>${software.name}</h2>${description}<p><strong>${t("MOSHHH.TargetLabel")} :</strong> ${activation.target ?? "—"}</p><p><strong>${t("MOSHHH.DurationLabel")} :</strong> ${activation.duration ?? "—"}</p>${rollText}`
  });

  if (data.singleUse !== false) {
    await software.delete();
    ui.notifications.info(t("MOSHHH.SoftwareConsumed", { software: software.name }));
  }
}

function selectOptions(items, labelFn) {
  return items.map(item => `<option value="${item.id}">${labelFn(item)}</option>`).join("");
}

export async function openInstallOnDeviceDialog(device, { afterInstall } = {}) {
  const actor = device.parent;
  if (!actor) return ui.notifications.warn(t("MOSHHH.DeviceInActorInventoryRequired"));
  const software = uninstalledSoftware(actor).filter(item => Number(hhData(item).slots ?? 1) <= availableSlots(device));
  if (!software.length) return ui.notifications.warn(t("MOSHHH.NoSoftwareAvailable"));

  const options = selectOptions(software, item => `${item.name} — ${Number(hhData(item).slots ?? 1)} emplacement(s)`);
  return dialogInstall({
    title: t("MOSHHH.InstallInTitle", { name: device.name }),
    label: t("MOSHHH.SoftwareDialogLabel"),
    options,
    callback: async id => {
      const installedDevice = await installSoftware(device, actor.items.get(id));
      if (installedDevice) await afterInstall?.(installedDevice);
      return installedDevice;
    }
  });
}

export async function openInstallSoftwareDialog(software, { afterInstall } = {}) {
  const actor = software.parent;
  if (!actor) return ui.notifications.warn(t("MOSHHH.SoftwareInActorInventoryRequired"));
  const needed = Number(hhData(software).slots ?? 1);
  const devices = actor.items.filter(item => isDevice(item) && availableSlots(item) >= needed);
  if (!devices.length) return ui.notifications.warn(t("MOSHHH.NoDeviceAvailable"));

  const options = selectOptions(devices, item => `${item.name} — ${usedSlots(item)} / ${maxSlots(item)}`);
  return dialogInstall({
    title: t("MOSHHH.InstallSoftwareTitle", { name: software.name }),
    label: t("MOSHHH.DeviceDialogLabel"),
    options,
    callback: async id => {
      const installedDevice = await installSoftware(actor.items.get(id), software);
      if (installedDevice) await afterInstall?.(installedDevice);
      return installedDevice;
    }
  });
}

function dialogInstall({ title, label, options, callback }) {
  const content = `<form class="hh-dialog"><div class="form-group"><label>${label}</label><select name="targetId">${options}</select></div></form>`;
  return new Dialog({
    title,
    content,
    buttons: {
      install: {
        icon: '<i class="fas fa-download"></i>',
        label: t("MOSHHH.InstallButton"),
        callback: html => callback(html.find("[name=targetId]").val())
      },
      cancel: { label: t("MOSHHH.Cancel") }
    },
    default: "install"
  }).render(true);
}

/** Conversion des installations V0.1 stockées comme copies dans les flags du deck. */
export async function migrateLegacyActor(actor) {
  const creates = [];
  const deviceUpdates = [];
  for (const device of actor.items.filter(isDevice)) {
    const data = hhData(device);
    const updates = {};
    if (typeof data.softwareSlots === "object") { updates[`flags.${MODULE_ID}.softwareSlots`] = Number(data.softwareSlots.max ?? 0); updates[`flags.${OLD_MODULE_ID}.softwareSlots`] = Number(data.softwareSlots.max ?? 0); }
    if (!device.flags?.[MODULE_ID] && device.flags?.[OLD_MODULE_ID]) updates[`flags.${MODULE_ID}`] = foundry.utils.deepClone(device.flags[OLD_MODULE_ID]);
    if (!device.flags?.[OLD_MODULE_ID] && device.flags?.[MODULE_ID]) updates[`flags.${OLD_MODULE_ID}`] = foundry.utils.deepClone(device.flags[MODULE_ID]);
    if (device.flags?.core?.sheetClass === `${OLD_MODULE_ID}.HackingDeviceSheet`) updates["flags.core.sheetClass"] = `${MODULE_ID}.HackingDeviceSheet`;
    if (Array.isArray(data.installedSoftware) && data.installedSoftware.length) {
      for (const stored of data.installedSoftware) {
        const clone = foundry.utils.deepClone(stored);
        delete clone._id;
        foundry.utils.setProperty(clone, `flags.${MODULE_ID}.installedIn`, device.id);
    foundry.utils.setProperty(clone, `flags.${OLD_MODULE_ID}.installedIn`, device.id);
        creates.push(clone);
      }
      updates[`flags.${MODULE_ID}.-=installedSoftware`] = null;
      updates[`flags.${OLD_MODULE_ID}.-=installedSoftware`] = null;
    }
    if (Object.keys(updates).length) deviceUpdates.push({ _id: device.id, ...updates });
  }
  if (deviceUpdates.length) await actor.updateEmbeddedDocuments("Item", deviceUpdates);
  if (creates.length) await actor.createEmbeddedDocuments("Item", creates);

  const softwareUpdates = actor.items.filter(isSoftware)
    .filter(item => hhData(item).installedIn === undefined)
    .map(item => ({ _id: item.id, [`flags.${MODULE_ID}.installedIn`]: null, [`flags.${OLD_MODULE_ID}.installedIn`]: null }));
  for (const item of actor.items.filter(isSoftware)) {
    const updates = {};
    if (!item.flags?.[MODULE_ID] && item.flags?.[OLD_MODULE_ID]) updates[`flags.${MODULE_ID}`] = foundry.utils.deepClone(item.flags[OLD_MODULE_ID]);
    if (!item.flags?.[OLD_MODULE_ID] && item.flags?.[MODULE_ID]) updates[`flags.${OLD_MODULE_ID}`] = foundry.utils.deepClone(item.flags[MODULE_ID]);
    if (item.flags?.core?.sheetClass === `${OLD_MODULE_ID}.SoftwareSheet`) updates["flags.core.sheetClass"] = `${MODULE_ID}.SoftwareSheet`;
    if (Object.keys(updates).length) softwareUpdates.push({ _id: item.id, ...updates });
  }
  if (softwareUpdates.length) await actor.updateEmbeddedDocuments("Item", softwareUpdates);

  // V0.4 : applique les pictogrammes fournis aux items déjà présents dans les inventaires.
  const iconUpdates = actor.items
    .filter(item => isDevice(item) || isSoftware(item))
    .map(item => {
      const img = isDevice(item) ? ICON_DEVICE : ICON_SOFTWARE;
      return item.img === img ? null : { _id: item.id, img };
    })
    .filter(Boolean);
  if (iconUpdates.length) await actor.updateEmbeddedDocuments("Item", iconUpdates);
}
