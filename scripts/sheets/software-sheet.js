import { MODULE_ID, OLD_MODULE_ID } from "../content.js";
import { hhData } from "../services/software-installation.js";

export class SoftwareSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mosh", "sheet", "item", "mosh-hackers", "hh-edit-sheet"],
      template: `modules/${MODULE_ID}/templates/items/software-sheet.hbs`,
      width: 500,
      height: "auto"
    });
  }

  async getData(options = {}) {
    const data = await super.getData(options);
    return { ...data, hh: hhData(this.item) };
  }

  async _updateObject(event, formData) {
    const data = foundry.utils.expandObject(formData);
    return this.item.update({
      name: data.name,
      "system.description": data.system?.description ?? "",
      "system.cost": Number(data.system?.cost ?? 0),
      "system.quantity": Number(data.system?.quantity ?? 1),
      [`flags.${MODULE_ID}.slots`]: Number(data.hh?.slots ?? 1),
      [`flags.${OLD_MODULE_ID}.slots`]: Number(data.hh?.slots ?? 1),
      [`flags.${MODULE_ID}.singleUse`]: Boolean(data.hh?.singleUse),
      [`flags.${OLD_MODULE_ID}.singleUse`]: Boolean(data.hh?.singleUse),
      [`flags.${MODULE_ID}.activation.duration`]: data.hh?.activation?.duration ?? "",
      [`flags.${OLD_MODULE_ID}.activation.duration`]: data.hh?.activation?.duration ?? "",
      [`flags.${MODULE_ID}.activation.target`]: data.hh?.activation?.target ?? "Node",
      [`flags.${OLD_MODULE_ID}.activation.target`]: data.hh?.activation?.target ?? "Node",
      [`flags.${MODULE_ID}.activation.effectKey`]: data.hh?.activation?.effectKey ?? "",
      [`flags.${OLD_MODULE_ID}.activation.effectKey`]: data.hh?.activation?.effectKey ?? "",
      [`flags.${MODULE_ID}.activation.roll`]: data.hh?.activation?.roll ?? "",
      [`flags.${OLD_MODULE_ID}.activation.roll`]: data.hh?.activation?.roll ?? ""
    });
  }
}
