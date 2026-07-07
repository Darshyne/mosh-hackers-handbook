export const MODULE_ID = "mosh-hackers-handbook";
export const OLD_MODULE_ID = "mosh-hackers-handbook-fr";
export const VERSION = "0.9.5";

export const ICON_DEVICE = `modules/${MODULE_ID}/assets/icons/hackicondeck.png`;
export const ICON_SOFTWARE = `modules/${MODULE_ID}/assets/icons/hackiconsoft.png`;
export const SOUND_UPLOAD = `modules/${MODULE_ID}/assets/sounds/upload.wav`;
const ICON_EQUIPMENT = "icons/svg/item-bag.svg";

function html(text) {
  return `<p>${text}</p>`;
}

function baseItem(name, cost, description, subtype, extra = {}, img = ICON_EQUIPMENT) {
  const sheetClass = subtype === "hacking-device"
    ? `${MODULE_ID}.HackingDeviceSheet`
    : subtype === "hacking-software"
      ? `${MODULE_ID}.SoftwareSheet`
      : undefined;

  const hhFlags = { subtype, ...extra };
  const flags = {
    [MODULE_ID]: foundry.utils.deepClone(hhFlags),
    // Compatibility namespace for worlds / modules still reading the old module id.
    [OLD_MODULE_ID]: foundry.utils.deepClone(hhFlags)
  };
  if (sheetClass) flags.core = { sheetClass };

  return {
    name,
    type: "item",
    img,
    system: {
      description: html(description),
      quantity: 1,
      weight: 0,
      cost
    },
    flags
  };
}

export const HACKING_DEVICES = [
  baseItem("KOMPAN-88 Lomo PX “Burndeck”", 450, "Compact deck. 1 software slot. All Nodes have their Reaction increased by +1.", "hacking-device", {
    category: "deck", softwareSlots: 1,
    restrictions: { doorsAndAirlocksOnly: false },
    modifiers: { response: 1, hardenedAsSecure: false, hackingAsMasterSkill: false }
  }, ICON_DEVICE),
  baseItem("Fedorova-Turner “Onika” Workstation", 1500, "Hacking workstation. 2 software slots.", "hacking-device", {
    category: "deck", softwareSlots: 2,
    restrictions: { doorsAndAirlocksOnly: false },
    modifiers: { response: 0, hardenedAsSecure: false, hackingAsMasterSkill: false }
  }, ICON_DEVICE),
  baseItem("Bao-Neumann Orion ZX “Superdeck”", 3500, "High-end deck. 5 software slots.", "hacking-device", {
    category: "deck", softwareSlots: 5,
    restrictions: { doorsAndAirlocksOnly: false },
    modifiers: { response: 0, hardenedAsSecure: false, hackingAsMasterSkill: false }
  }, ICON_DEVICE),
  baseItem("Sato Bliss", 12000, "Luxury deck. 3 software slots. Treats Hardened Nodes as Secure Nodes.", "hacking-device", {
    category: "deck", softwareSlots: 3,
    restrictions: { doorsAndAirlocksOnly: false },
    modifiers: { response: 0, hardenedAsSecure: true, hackingAsMasterSkill: false }
  }, ICON_DEVICE),
  baseItem("Sinclair 2", 50000, "Elite deck. 3 software slots. Treats Hacking as a Master Skill.", "hacking-device", {
    category: "deck", softwareSlots: 3,
    restrictions: { doorsAndAirlocksOnly: false },
    modifiers: { response: 0, hardenedAsSecure: false, hackingAsMasterSkill: true }
  }, ICON_DEVICE),
  baseItem("DVK “Micro-80X” Printable Timepiece", 25, "Minimal wristcomm. Can only hack doors and airlocks.", "hacking-device", {
    category: "wristcomm", softwareSlots: 0,
    restrictions: { doorsAndAirlocksOnly: true },
    modifiers: { response: 0, hardenedAsSecure: false, hackingAsMasterSkill: false }
  }, ICON_DEVICE),
  baseItem("Macrogram “MX Tattler”", 1500, "Hacking wristcomm. 1 software slot.", "hacking-device", {
    category: "wristcomm", softwareSlots: 1,
    restrictions: { doorsAndAirlocksOnly: false },
    modifiers: { response: 0, hardenedAsSecure: false, hackingAsMasterSkill: false }
  }, ICON_DEVICE),
  baseItem("König-Seidel “Series 6”", 22000, "Advanced wristcomm. 2 software slots.", "hacking-device", {
    category: "wristcomm", softwareSlots: 2,
    restrictions: { doorsAndAirlocksOnly: false },
    modifiers: { response: 0, hardenedAsSecure: false, hackingAsMasterSkill: false }
  }, ICON_DEVICE)
];

export const HACKING_SOFTWARE = [
  baseItem("CoyBoy", 2000, "Single-use software. Reduces a Node’s Reaction by [[/r 1d5]].", "hacking-software", {
    slots: 1, singleUse: true, installedIn: null,
    activation: { duration: "Instant", target: "Node", effectKey: "reduceResponse", roll: "1d5" }
  }, ICON_SOFTWARE),
  baseItem("Icebreaker", 500, "Single-use software. Converts a Secure Node into an Unsecured Node.", "hacking-software", {
    slots: 1, singleUse: true, installedIn: null,
    activation: { duration: "Instant", target: "Node", effectKey: "icebreaker", roll: "" }
  }, ICON_SOFTWARE),
  baseItem("Icebreaker IB++", 2500, "Single-use software. Converts a Hardened Node into an Unsecured Node.", "hacking-software", {
    slots: 1, singleUse: true, installedIn: null,
    activation: { duration: "Instant", target: "Node", effectKey: "icebreakerPlus", roll: "" },
    upgradeOf: "Icebreaker"
  }, ICON_SOFTWARE),
  baseItem("Keylogger", 1000, "Single-use software. Records every keystroke, input, or button press on a Node. Installation: [[/r 1d5]] rounds.", "hacking-software", {
    slots: 1, singleUse: true, installedIn: null,
    activation: { duration: "1d5 rounds", target: "Node", effectKey: "keylogger", roll: "1d5" }
  }, ICON_SOFTWARE),
  baseItem("Maze", 500, "Single-use software. Ignores one NetSec Reaction roll.", "hacking-software", {
    slots: 1, singleUse: true, installedIn: null,
    activation: { duration: "Instant", target: "NetSec Reaction", effectKey: "ignoreResponse", roll: "" }
  }, ICON_SOFTWARE),
  baseItem("Ripper2", 1000, "Single-use software. Brute-force password cracker. Takes [[/r 3d10]] rounds.", "hacking-software", {
    slots: 1, singleUse: true, installedIn: null,
    activation: { duration: "3d10 rounds", target: "Encrypted Node / Password", effectKey: "bruteForcePassword", roll: "3d10" }
  }, ICON_SOFTWARE),
  baseItem("Xmap", 2000, "Single-use software. Retrieves a map of all Nodes in a Network.", "hacking-software", {
    slots: 1, singleUse: true, installedIn: null,
    activation: { duration: "Instant", target: "Network", effectKey: "mapNetwork", roll: "" }
  }, ICON_SOFTWARE)
];

export const HACKING_EQUIPMENT = [
  baseItem("Brickboy", 300, "Portable dongle that fries hardware when a trigger event occurs: a door opening, a PDA receiving a message, a user logging into a terminal, etc.", "hacking-equipment"),
  baseItem("Faraday Bag", 75, "Small bag that blocks all incoming and outgoing signals from its contents.", "hacking-equipment"),
  baseItem("Node Detector", 750, "Detects all Nodes within 50 m.", "hacking-equipment"),
  baseItem("Scout Upgrade", 500, "Node Detector upgrade. Also detects Node Security and Reaction.", "hacking-equipment"),
  baseItem("Snatcher", 150, "Copies an entire databank while deleting the original. Takes [[/r 1d10]] rounds.", "hacking-equipment"),
  baseItem("Swiper System", 200, "Printer that duplicates any scanned access card.", "hacking-equipment"),
  baseItem("Blank Access Cards, pack of 10", 50, "Consumables for the Swiper System.", "hacking-equipment"),
  baseItem("Credstick Upgrade", 2000, "Swiper System upgrade. Allows credit theft.", "hacking-equipment"),
  baseItem("Remote Upgrade", 4000, "Swiper System upgrade. Allows use up to 20 m.", "hacking-equipment")
];
