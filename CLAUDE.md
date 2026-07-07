# mosh-hackers-handbook — Contexte module

## Identité

| Élément | Valeur |
|---|---|
| ID technique | `mosh-hackers-handbook` |
| Ancien ID (compat conservée) | `mosh-hackers-handbook-fr` |
| Version de référence | `0.9.5` |
| Foundry VTT | V13 |
| Langue source compendiums | Anglais (traduction FR gérée par un module Babele externe — hors périmètre ici) |

## Rôle — à ne pas dépasser

```
mosh-hackers-handbook  = objets, inventaire, decks, logiciels, installation
mosh-hacking-console   = réseaux, nœuds, hacking, réactions, synchronisation
```
Ce module ne doit **jamais** gérer la logique réseau — c'est la responsabilité
exclusive de `mosh-hacking-console` (module intriqué, dépendant de celui-ci ≥0.9.5).

## Structure

```
mosh-hackers-handbook/
├── module.json
├── lang/{en,fr}.json
├── scripts/
│   ├── content.js                      # source canonique : decks, logiciels, matériel, effectKey
│   ├── main.js                         # hooks, settings, sheets, sync compendiums, migrations
│   ├── services/software-installation.js
│   ├── sheets/{hacking-device,software}-sheet.js
│   └── ui/actor-hacking-panel.js
├── templates/items/{hacking-device,software}-sheet.hbs
├── styles/hackers-handbook.css
└── assets/{icons,sounds}/
```

## Contrat de flags (API consommée par `mosh-hacking-console`)

```js
item.flags["mosh-hackers-handbook"].subtype
item.flags["mosh-hackers-handbook"].installedIn
item.flags["mosh-hackers-handbook"].activation.effectKey
// fallback ancien namespace, à conserver pour les anciens mondes :
item.flags["mosh-hackers-handbook-fr"]
```

⚠️ **Ne jamais détecter un logiciel par son nom affiché** (traduisible) —
toujours par `effectKey`, identifiant technique stable.

## `effectKey` connus

```
reduceResponse, icebreaker, icebreakerPlus, keylogger,
ignoreResponse, bruteForcePassword, mapNetwork
```

## Logiciel à usage unique

```js
singleUse: true   // suppression automatique de l'inventaire après utilisation
```

## Flux d'installation/éjection

```
Objet ajouté au personnage
  → détection par subtype/flags
  → affichage section Hacking (fond vert dédié en bas de l'inventaire)
  → installation dans un deck : vérifie compatibilité + slots dispo + non déjà installé ailleurs
    → flag installedIn mis à jour, slots recalculés, son joué, UI rafraîchie
  → éjection : lien supprimé, slot libéré, même son, UI rafraîchie
```

## Compendiums fournis

Appareils de hacking (`KOMPAN-88 Lomo PX "Burndeck"`, `Fedorova-Turner "Onika" Workstation`,
`Bao-Neumann Orion ZX "Superdeck"`, `Sato Bliss`, `Sinclair 2`, `DVK "Micro-80X"`,
`Macrogram "MX Tattler"`, `König-Seidel "Series 6"`), logiciels, matériel divers.
Anglais = langue source ; la traduction FR des compendiums est un module Babele
séparé, à ne pas dupliquer ici.

## Limites actuelles

- Compendiums directement inspirés du supplément officiel → une version publique
  pourrait nécessiter suppression/remplacement de ces compendiums
- Compatibilité `mosh-hackers-handbook-fr` maintenue temporairement, alourdit
  un peu la logique — prévoir nettoyage une fois la migration jugée terminée
- Pas de test complet multi-versions du système `mosh` encore fait
