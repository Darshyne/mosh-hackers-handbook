import { HackingDeviceSheet } from "./sheets/hacking-device-sheet.js";
import { SoftwareSheet } from "./sheets/software-sheet.js";
import { HACKING_DEVICES, HACKING_EQUIPMENT, HACKING_SOFTWARE, MODULE_ID, OLD_MODULE_ID, VERSION } from "./content.js";
import { isDevice, isSoftware, migrateLegacyActor } from "./services/software-installation.js";
import { renderHackingInventory } from "./ui/actor-hacking-panel.js";

const t = (key, data = {}) => game.i18n.format(key, data);

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initialisation V${VERSION}`);

  if (!Handlebars.helpers.eq) Handlebars.registerHelper("eq", (a, b) => a === b);

  Items.registerSheet(MODULE_ID, HackingDeviceSheet, {
    types: ["item"], makeDefault: false, label: t("MOSHHH.SheetDeviceLabel")
  });
  Items.registerSheet(MODULE_ID, SoftwareSheet, {
    types: ["item"], makeDefault: false, label: t("MOSHHH.SheetSoftwareLabel")
  });

  game.settings.register(MODULE_ID, "seededVersion", {
    name: t("MOSHHH.SeededVersion"), scope: "world", config: false, type: String, default: ""
  });
  game.settings.register(MODULE_ID, "autoSeedCompendiums", {
    name: t("MOSHHH.AutoSeedCompendiums"),
    hint: t("MOSHHH.AutoSeedCompendiumsHint"),
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(MODULE_ID, "migratedVersion", {
    name: t("MOSHHH.MigratedVersion"), scope: "world", config: false, type: String, default: ""
  });
});

Hooks.once("ready", async () => {
  if (game.system.id !== "mosh") {
    console.warn(`${MODULE_ID} | ${t("MOSHHH.WrongSystemWarning", { system: game.system.id })}`);
    return;
  }
  if (!game.user.isGM) return;
  if (game.settings.get(MODULE_ID, "autoSeedCompendiums")) await syncCompendiums();
  if (game.settings.get(MODULE_ID, "migratedVersion") !== VERSION) {
    for (const actor of game.actors.filter(a => a.type === "character")) await migrateLegacyActor(actor);
    await game.settings.set(MODULE_ID, "migratedVersion", VERSION);
    ui.notifications.info(t("MOSHHH.MigrationDone"));
  }
});

Hooks.on("renderActorSheet", (app, html) => renderHackingInventory(app, html));

Hooks.on("preCreateItem", item => {
  const subtype = item.flags?.[MODULE_ID]?.subtype ?? item.flags?.[OLD_MODULE_ID]?.subtype;
  if (subtype === "hacking-device") item.updateSource({ "flags.core.sheetClass": `${MODULE_ID}.HackingDeviceSheet` });
  if (subtype === "hacking-software") item.updateSource({ "flags.core.sheetClass": `${MODULE_ID}.SoftwareSheet` });
  if (subtype && !item.flags?.[MODULE_ID] && item.flags?.[OLD_MODULE_ID]) item.updateSource({ [`flags.${MODULE_ID}`]: foundry.utils.deepClone(item.flags[OLD_MODULE_ID]) });
  if (subtype && !item.flags?.[OLD_MODULE_ID] && item.flags?.[MODULE_ID]) item.updateSource({ [`flags.${OLD_MODULE_ID}`]: foundry.utils.deepClone(item.flags[MODULE_ID]) });
});

async function syncCompendiums() {
  const packs = [
    [game.packs.get(`${MODULE_ID}.hacking-devices`), HACKING_DEVICES],
    [game.packs.get(`${MODULE_ID}.hacking-software`), HACKING_SOFTWARE],
    [game.packs.get(`${MODULE_ID}.hacking-equipment`), HACKING_EQUIPMENT]
  ];
  if (packs.some(([pack]) => !pack)) return console.warn(`${MODULE_ID} | ${t("MOSHHH.MissingCompendium")}`);
  for (const [pack, documents] of packs) await syncPack(pack, documents);
  await game.settings.set(MODULE_ID, "seededVersion", VERSION);
}

async function syncPack(pack, documents) {
  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });

  // V0.9: English is the canonical source. Rebuild module packs to avoid
  // keeping old French entries when upgrading from the former -fr package.
  const index = await pack.getIndex();
  for (const entry of index) {
    const existing = await pack.getDocument(entry._id);
    await existing?.delete();
  }

  for (const data of documents) {
    const temp = await Item.create(data, { temporary: true });
    await pack.importDocument(temp);
  }

  if (wasLocked) await pack.configure({ locked: true });
}

globalThis.MoshHackersHandbook = {
  MODULE_ID, OLD_MODULE_ID, VERSION, isDevice, isSoftware, syncCompendiums
};
