# MoSh — Hacker's Handbook FR | V0.5.1

Module Foundry VTT v13 pour le système **MoSh - Unofficial Mothership** (`mosh`).

## Correctif V0.5.1

- Correction de l’alignement des titres de colonnes dans le bloc Hack.
- Les lignes Appareils et Logiciels utilisent maintenant une grille interne stable pour garder les titres exactement au-dessus des valeurs.

## Changements V0.5

- Regroupement de toute la section hacking dans un conteneur vert `#c7e0c6`.
- Réduction de la largeur des bulles de noms des logiciels non installés pour les aligner visuellement sur les objets standards.
- Ajustements légers des marges et séparateurs du bloc hacking.


## Changements V0.5.2

- Le son `upload.wav` est maintenant joué aussi lors de l’éjection d’un logiciel.
- Après installation d’un logiciel, le deck cible est automatiquement déplié et la feuille est rafraîchie.
- Correction d’un conflit de clic possible entre le chevron de dépliage et le clic sur le nom de l’objet.

## Changements V0.4

- Ajout des pictogrammes personnalisés pour les **decks** et les **logiciels**.
- Le pictogramme du deck est désormais visible dans la ligne d'inventaire ; le chevron de dépliage est intégré au cartouche du nom.
- À l'installation d'un logiciel, le son `upload.wav` est joué **uniquement sur le client qui effectue l'action**.
- Les objets déjà présents dans les inventaires reçoivent automatiquement les nouveaux pictogrammes lors de la migration V0.4.

## Changements V0.3

L'interface des decks et logiciels s'aligne désormais sur la liste native des objets de la feuille de personnage :

- les sections **Appareils de piratage** et **Logiciels** sont placées en fin d'onglet **Objets** ;
- le matériel de piratage simple (Brickboy, Sac Faraday, Détecteur de Nœuds, etc.) reste dans la liste native des objets ;
- les boutons d'action n'affichent plus que des icônes avec infobulles ;
- clic gauche sur le nom d'un appareil ou logiciel : description dans le chat ;
- clic droit sur le nom : ouverture de la fiche d'édition ;
- les noms reprennent le style et la taille des objets natifs ;
- les logiciels non installés affichent leur pictogramme d'objet ;
- les appareils restent dépliables pour installer, utiliser ou éjecter leurs logiciels.

## Contenu

- **Appareils** : 5 decks et 3 wristcomms.
- **Logiciels** : CoyBoy, Icebreaker, Icebreaker IB++, Keylogger, Maze, Ripper2, Xmap.
- **Matériel** : Brickboy, Sac Faraday, Détecteur de Nœuds, Scout, Snatcher, Swiper System et améliorations.

## Installation

1. Supprimer l'ancienne version du dossier `mosh-hackers-handbook-fr` ou la remplacer entièrement.
2. Copier le dossier `mosh-hackers-handbook-fr` dans `Data/modules/`.
3. Relancer Foundry et activer le module.
4. Ouvrir le monde avec un compte MJ pour synchroniser les compendiums.

## Test rapide

1. Glisser **Fedorova-Turner « Onika » Workstation**, **Icebreaker** et **Ripper2** sur un PJ.
2. Ouvrir l'onglet **Objets** : les objets ordinaires apparaissent d'abord ; les appareils et logiciels sont à la fin.
3. Déplier l'Onika avec le chevron.
4. Survoler les icônes d'action pour vérifier les infobulles.
5. Cliquer sur le nom d'un deck ou logiciel pour publier sa description dans le chat.
6. Faire un clic droit sur son nom pour ouvrir son édition.

## Note technique

Les decks et logiciels restent des Items de type `item`, classés via `flags["mosh-hackers-handbook-fr"].subtype`. Les champs propres au hacking sont stockés dans les flags pour rester stables avec le modèle de données du système `mosh`.

## Version 0.7.5-safe

Version de secours basée sur la dernière base stable de l’inventaire hacking.

- Console de piratage temporairement désactivée.
- Aucun bouton console dans les fiches.
- Conservation des decks, logiciels, icônes, bloc Hack vert, installation/éjection et sons.
- Les compendiums d’appareils, logiciels et matériel sont à nouveau ceux de la branche stable.
- Objectif : remettre le module en état fonctionnel avant de reconstruire la console séparément.


## V0.9.1

- Correction Babele :
  - ajout des fichiers de traduction avec le nom complet du pack :
    - `mosh-hackers-handbook.hacking-devices.json`
    - `mosh-hackers-handbook.hacking-software.json`
    - `mosh-hackers-handbook.hacking-equipment.json`
  - conservation des fichiers courts en doublon par sécurité.

## V0.9.2

- Correction traduction des descriptions Babele :
  - ajout de mappings robustes pour `system.description`;
  - ajout de clés de secours dans les entrées Babele.
- Ajout d’un fallback côté fiches personnalisées deck / logiciel :
  - en langue française, la fiche affiche la description FR même si Babele ne remplace que le nom dans l’index du compendium.

## V0.9.3

- Correction critique Babele 2.7.5 :
  - suppression des mappings `system.description.value` et des entrées imbriquées qui provoquaient l’erreur Foundry `Cannot use 'in' operator to search for 'value' in system.description`.
- Babele traduit désormais les noms des entrées de compendium.
- Les descriptions françaises sont gérées par un fallback interne du module :
  - fiches personnalisées deck / logiciel ;
  - panneau de personnage ;
  - messages de chat des logiciels.

## V0.9.4

- Correction critique installation / éjection :
  - suppression des appels `setFlag("mosh-hackers-handbook-fr", ...)`, interdits si l’ancien module n’est plus actif ;
  - remplacement par un `item.update()` qui maintient les deux namespaces de flags :
    - `mosh-hackers-handbook`
    - `mosh-hackers-handbook-fr`
- Le son d’installation / éjection peut de nouveau se jouer, car l’action n’est plus interrompue par l’erreur de scope.
