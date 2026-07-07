import { MODULE_ID, OLD_MODULE_ID } from "../content.js";
import { hhData, maxSlots } from "../services/software-installation.js";

export class HackingDeviceSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mosh", "sheet", "item", "mosh-hackers", "hh-edit-sheet"],
      template: `modules/${MODULE_ID}/templates/items/hacking-device-sheet.hbs`,
      width: 500,
      height: "auto"
    });
  }

  async getData(options = {}) {
    const data = await super.getData(options);
    const hh = hhData(this.item);
    hh.softwareSlots = maxSlots(this.item);
    return { ...data, hh };
  }

  async _updateObject(event, formData) {
    const data = foundry.utils.expandObject(formData);
    return this.item.update({
      name: data.name,
      "system.description": data.system?.description ?? "",
      "system.cost": Number(data.system?.cost ?? 0),
      "system.quantity": Number(data.system?.quantity ?? 1),
      [`flags.${MODULE_ID}.category`]: data.hh?.category ?? "deck",
      [`flags.${OLD_MODULE_ID}.category`]: data.hh?.category ?? "deck",
      [`flags.${MODULE_ID}.softwareSlots`]: Number(data.hh?.softwareSlots ?? 0),
      [`flags.${OLD_MODULE_ID}.softwareSlots`]: Number(data.hh?.softwareSlots ?? 0),
      [`flags.${MODULE_ID}.restrictions.doorsAndAirlocksOnly`]: Boolean(data.hh?.restrictions?.doorsAndAirlocksOnly),
      [`flags.${OLD_MODULE_ID}.restrictions.doorsAndAirlocksOnly`]: Boolean(data.hh?.restrictions?.doorsAndAirlocksOnly),
      [`flags.${MODULE_ID}.modifiers.response`]: Number(data.hh?.modifiers?.response ?? 0),
      [`flags.${OLD_MODULE_ID}.modifiers.response`]: Number(data.hh?.modifiers?.response ?? 0),
      [`flags.${MODULE_ID}.modifiers.hardenedAsSecure`]: Boolean(data.hh?.modifiers?.hardenedAsSecure),
      [`flags.${OLD_MODULE_ID}.modifiers.hardenedAsSecure`]: Boolean(data.hh?.modifiers?.hardenedAsSecure),
      [`flags.${MODULE_ID}.modifiers.hackingAsMasterSkill`]: Boolean(data.hh?.modifiers?.hackingAsMasterSkill),
      [`flags.${OLD_MODULE_ID}.modifiers.hackingAsMasterSkill`]: Boolean(data.hh?.modifiers?.hackingAsMasterSkill)
    });
  }
}
