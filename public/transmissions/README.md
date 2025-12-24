# Transmission audio drop zones

Place recorded voice lines into the folders below to match their in-game triggers:

- `health/warning` – low hull alerts (~40%).
- `health/critical` – critical hull alerts (~20%).
- `enemies/*` – enemy briefings for each type (`drifter`, `watcher`, `mass`, `phantom`, `orbiter`, `splitter`) plus `elite` callouts.
- `upgrades/weapons`, `upgrades/defense`, `upgrades/utility`, `upgrades/legendary` – upgrade screen intel.
- `bosses/sentinel-core`, `bosses/swarm-core`, `bosses/obelisk` – boss intro chatter.
- `wave/intermission` – general “new wave incoming” lines.
- `general` (existing files) – fallback chatter when a category is empty.

Naming pattern follows the bundled `manifest.json` (e.g. `drifter-01.mp3`, `upgrade-legendary-02.mp3`). Keep the names or update `manifest.json` to point at any custom filenames. Missing files are skipped automatically and fall back to general transmissions.
