# Carnet Muscu — app autonome

Suivi d'entraînement 100 % local : séances (2 groupes musculaires, jour de repos obligatoire),
ateliers avec photos, charges/réps/séries, courbes de progression et alerte d'augmentation
après 2 séances au même poids.

**Aucune donnée ne quitte le téléphone.** Tout est stocké en local (localStorage) et
sauvegardable/restaurable en un clic via un fichier JSON (onglet Historique → Exporter / Importer).

## Installation sur le téléphone (une seule fois)

L'hébergement ne sert qu'à installer l'app. Une fois installée, elle fonctionne
entièrement hors-ligne grâce au service worker — même si l'hébergement disparaît.

1. Créer un dépôt GitHub public (ex. `carnet-muscu`) et y déposer les 5 fichiers
   de ce dossier à la racine : `index.html`, `manifest.webmanifest`, `sw.js`,
   `icon-192.png`, `icon-512.png`.
2. Dans le dépôt : Settings → Pages → Source : « Deploy from a branch » →
   branche `main`, dossier `/ (root)` → Save.
3. Attendre ~1 minute, puis ouvrir sur le téléphone :
   `https://TON-PSEUDO.github.io/carnet-muscu/`
4. Android (Chrome) : menu ⋮ → « Installer l'application » (ou « Ajouter à
   l'écran d'accueil »). iPhone (Safari) : Partager → « Sur l'écran d'accueil ».

L'icône apparaît comme une app native : plein écran, hors-ligne, données locales.

Alternatives d'hébergement : Cloudflare Pages, Netlify, ou n'importe quel
hébergement statique HTTPS. (Un simple `python3 -m http.server` en réseau local
ne suffit pas pour le mode hors-ligne : le service worker exige HTTPS.)

## Option zéro hébergement (Android)

Copier `index.html` seul sur le téléphone et l'ouvrir avec Chrome ou Firefox :
l'app fonctionne aussi (données en localStorage), mais sans icône d'app installée
ni garantie hors-ligne du service worker. Dans ce cas, exporter le JSON régulièrement.

## Sauvegarde et transfert

- Historique → **Exporter JSON** : télécharge `carnet-muscu-AAAA-MM-JJ.json`
  (séances, ateliers, photos comprises).
- **Importer** restaure ce fichier à l'identique — changement de téléphone,
  réinstallation, ou édition manuelle (JSON lisible).

## Mise à jour de l'app

Remplacer les fichiers sur l'hébergement, puis incrémenter `SHELL` dans `sw.js`
(`cm-shell-v1` → `cm-shell-v2`). Le téléphone récupère la nouvelle version au
prochain lancement en ligne. Les données ne sont jamais touchées par une mise à jour.
