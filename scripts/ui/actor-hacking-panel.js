import { MODULE_ID, localizedSourceDescription } from "../content.js";
import {
  availableSlots, ejectSoftware, hhData, installedSoftware, isDevice,
  isSoftware, maxSlots, openInstallOnDeviceDialog,
  openInstallSoftwareDialog, useSoftware, usedSlots
} from "../services/software-installation.js";

const expandedDevices = new Map();
const t = (key, data = {}) => game.i18n.format(key, data);

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function textDescription(item) {
  const html = String(localizedSourceDescription(item));
  const node = document.createElement("div");
  node.innerHTML = html;
  return node.textContent?.trim() ?? "";
}

function money(item) {
  return Number(item.system?.cost ?? 0).toLocaleString(game.i18n.lang === "fr" ? "fr-FR" : "en-US");
}

function stateFor(actor) {
  if (!expandedDevices.has(actor.id)) expandedDevices.set(actor.id, new Set());
  return expandedDevices.get(actor.id);
}

function softwareEffect(item) {
  const data = hhData(item);
  const description = textDescription(item).replace(/^Logiciel à usage unique\.\s*/i, "");
  return description || data.activation?.effectKey || t("MOSHHH.SoftwareEffectFallback");
}

function iconButton(action, itemId, icon, title) {
  return `<button type="button" class="hh-icon-button" data-hh-action="${action}" data-item-id="${itemId}" title="${esc(title)}" aria-label="${esc(title)}"><i class="fas fa-${icon}"></i></button>`;
}

function objectName(item, extraClass = "", prefix = "") {
  return `<h4 class="skill-name list-roll hh-clickable-name ${extraClass}" data-item-id="${item.id}" title="${esc(t("MOSHHH.ClickNameTooltip"))}">${prefix}${esc(item.name)}</h4>`;
}

function installedRow(program) {
  return `<div class="hh-installed-row" data-item-id="${program.id}">
    <div class="item-image"><img src="${esc(program.img)}" title="${esc(program.name)}" width="24" height="24" /></div>
    ${objectName(program, "hh-installed-name")}
    <span class="hh-program-effect">${esc(softwareEffect(program))}</span>
    <div class="hh-actions">
      ${iconButton("use", program.id, "bolt", t("MOSHHH.Use"))}
      ${iconButton("eject", program.id, "eject", t("MOSHHH.Eject"))}
    </div>
  </div>`;
}

function emptySlot(device) {
  return `<div class="hh-installed-row hh-empty-slot">
    <div class="item-image"><i class="far fa-square"></i></div>
    <span class="hh-empty-label">${esc(t("MOSHHH.FreeSlot"))}</span>
    <span></span>
    <div class="hh-actions">${iconButton("install-device", device.id, "download", t("MOSHHH.InstallSoftware"))}</div>
  </div>`;
}

function deviceRow(actor, device) {
  const expanded = stateFor(actor).has(device.id);
  const max = maxSlots(device);
  const used = usedSlots(device);
  const programs = installedSoftware(device);
  const category = hhData(device).category === "wristcomm" ? "Wristcomm" : "Deck";
  const slots = max > 0 ? `${used} / ${max}` : "—";
  const canInstall = max > 0 && availableSlots(device) > 0;
  const detail = expanded ? `<li class="hh-device-detail" data-device-id="${device.id}">
      <div class="hh-device-summary">${esc(textDescription(device))}</div>
      <div class="hh-detail-head">
        <strong>${esc(t("MOSHHH.InstalledSoftware"))}</strong>
        <span>${slots}</span>
        ${canInstall ? iconButton("install-device", device.id, "download", t("MOSHHH.InstallSoftware")) : ""}
      </div>
      ${max === 0 ? `<p class="hh-no-slot">${esc(t("MOSHHH.NoSoftwareSlots"))}</p>` : programs.map(installedRow).join("") + Array.from({ length: Math.max(0, max - used) }, () => emptySlot(device)).join("")}
    </li>` : "";

  const toggle = `<button type="button" class="hh-expand hh-expand-inline" data-hh-action="toggle-device" data-item-id="${device.id}" title="${expanded ? t("MOSHHH.Collapse") : t("MOSHHH.Expand")}" aria-label="${expanded ? t("MOSHHH.Collapse") : t("MOSHHH.Expand")}"><i class="fas fa-chevron-${expanded ? "down" : "right"}"></i></button>`;
  return `<li class="item flexrow dropitem hh-device-row" data-item-id="${device.id}">
      <div class="item-image"><img src="${esc(device.img)}" title="${esc(device.name)}" width="24" height="24" /></div>
      ${objectName(device, "", toggle)}
      <div class="skill-stat hh-device-type">${category}</div>
      <div class="skill-stat hh-device-slots">${slots}</div>
      <div class="skill-stat">${money(device)}</div>
      <div class="item-controls">
        ${iconButton("edit", device.id, "edit", t("MOSHHH.Edit"))}
        ${iconButton("delete", device.id, "trash", t("MOSHHH.Delete"))}
      </div>
    </li>${detail}`;
}

function softwareRow(item) {
  return `<li class="item flexrow dropitem hh-software-row" data-item-id="${item.id}">
    <div class="item-image"><img src="${esc(item.img)}" title="${esc(item.name)}" width="24" height="24" /></div>
    ${objectName(item)}
    <div class="skill-stat">${money(item)}</div>
    <div class="item-controls hh-wide-controls">
      ${iconButton("install-software", item.id, "download", t("MOSHHH.InstallInDevice"))}
      ${iconButton("edit", item.id, "edit", t("MOSHHH.Edit"))}
      ${iconButton("delete", item.id, "trash", t("MOSHHH.Delete"))}
    </div>
  </li>`;
}

function panelHtml(actor) {
  const devices = actor.items.filter(isDevice);
  const software = actor.items.filter(item => isSoftware(item) && !hhData(item).installedIn);
  return `<section class="hh-character-panel">
    ${devices.length ? `<ol class="items-list hh-device-list">
      <li class="item flexrow item-header">
        <div class="item-image"></div>
        <div class="skill-stat hh-main-header">${esc(t("MOSHHH.HackingDevicesHeader"))}</div>
        <div class="skill-stat hh-col-type">${esc(t("MOSHHH.Type"))}</div>
        <div class="skill-stat hh-col-slot">${esc(t("MOSHHH.SoftwareHeader"))}</div>
        <div class="skill-stat hh-col-value">${esc(t("MOSHHH.Value"))}</div>
        <div class="item-controls"></div>
      </li>
      ${devices.map(item => deviceRow(actor, item)).join("")}
    </ol>` : ""}
    ${software.length ? `<ol class="items-list hh-software-list">
      <li class="item flexrow item-header">
        <div class="item-image"></div>
        <div class="skill-stat hh-main-header">${esc(t("MOSHHH.SoftwareHeader"))}</div>
        <div class="skill-stat hh-col-value">${esc(t("MOSHHH.Value"))}</div>
        <div class="item-controls hh-wide-controls"></div>
      </li>
      ${software.map(softwareRow).join("")}
    </ol>` : ""}
  </section>`;
}

function nativeRow(root, itemId) {
  const idNode = root.find(`[data-item-id="${itemId}"], [data-document-id="${itemId}"], [data-id="${itemId}"]`).first();
  if (!idNode.length) return $();
  const row = idNode.closest("tr, li.item, .item, .item-row").first();
  return row.length ? row : idNode;
}


function expandAndRender(app, device) {
  if (!device) return;
  stateFor(app.actor).add(device.id);
  app.render(false);
}

export function renderHackingInventory(app, html) {
  const actor = app.actor;
  if (!actor || actor.type !== "character") return;
  const root = html instanceof jQuery ? html : $(html);
  root.find(".hh-character-panel").remove();

  const visiblePanelItems = actor.items.filter(item => isDevice(item) || isSoftware(item));
  if (!visiblePanelItems.length) return;

  const itemsTab = root.find('.tab[data-tab="items"]').first();
  if (!itemsTab.length) {
    console.warn(`${MODULE_ID} | ${t("MOSHHH.MissingItemsTab", { actor: actor.name })}`);
    return;
  }

  // Les appareils et logiciels disposent de leur interface spécialisée.
  // Le matériel de piratage reste dans la liste native des objets ordinaires.
  for (const item of visiblePanelItems) nativeRow(root, item.id).addClass("hh-native-hidden").hide();
  itemsTab.append(panelHtml(actor));
  bindPanel(app, itemsTab.find(".hh-character-panel").last());
}

function bindPanel(app, panel) {
  panel.off(`click.${MODULE_ID}`).on(`click.${MODULE_ID}`, "[data-hh-action]", async event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const button = event.currentTarget;
    const action = button.dataset.hhAction;
    const item = app.actor.items.get(button.dataset.itemId);
    if (!item) return;

    if (action === "toggle-device") {
      const state = stateFor(app.actor);
      state.has(item.id) ? state.delete(item.id) : state.add(item.id);
      app.render(false);
    }
    if (action === "edit") item.sheet.render(true);
    if (action === "install-device") await openInstallOnDeviceDialog(item, { afterInstall: device => expandAndRender(app, device) });
    if (action === "install-software") await openInstallSoftwareDialog(item, { afterInstall: device => expandAndRender(app, device) });
    if (action === "eject") {
      const ok = await ejectSoftware(item);
      if (ok) app.render(false);
    }
    if (action === "use") await useSoftware(item);
    if (action === "delete") {
      const installed = isDevice(item) ? installedSoftware(item) : [];
      const warning = installed.length ? `<p>${esc(t("MOSHHH.InstalledSoftwareWillBeEjected"))}</p>` : "";
      Dialog.confirm({
        title: t("MOSHHH.DeleteTitle", { name: item.name }),
        content: `<p>${t("MOSHHH.DeleteConfirm", { name: esc(item.name) })}</p>${warning}`,
        yes: async () => {
          for (const software of installed) await ejectSoftware(software);
          await item.delete();
        }
      });
    }
  });

  panel.off(`click.${MODULE_ID}.name`).on(`click.${MODULE_ID}.name`, ".hh-clickable-name", event => {
    event.preventDefault();
    event.stopPropagation();
    app.actor.printDescription(event.currentTarget.dataset.itemId, { event });
  });

  panel.off(`contextmenu.${MODULE_ID}`).on(`contextmenu.${MODULE_ID}`, ".hh-clickable-name", event => {
    event.preventDefault();
    event.stopPropagation();
    const item = app.actor.items.get(event.currentTarget.dataset.itemId);
    item?.sheet.render(true);
  });
}
