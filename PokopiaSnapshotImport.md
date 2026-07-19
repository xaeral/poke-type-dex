Pokopia Snapshot Import

This project can load Pokopia data from a local snapshot file.
Use the importer script to build or refresh that file from a full API export.

Input expectations:
- A JSON file containing a Pokemon array as one of:
  - top-level array
  - pokemon
  - data
  - results
  - entries
  - items
  - pokedex
  - list

Run importer:
- node scripts/import-pokopia-snapshot.mjs path/to/full-export.json

Optional output path:
- node scripts/import-pokopia-snapshot.mjs path/to/full-export.json path/to/output.json

Default output:
- pokopia-snapshot.json

What gets normalized:
- name
- slug
- localNumber
- nationalNumber
- types
- specialties
- habitats
- climates
- timeAvailability
- spawnZones
- imageUrl

Notes:
- Duplicate Pokemon are deduplicated by slug.
- Pokemon are sorted by national number, then name.
- Empty or missing optional fields are kept as empty arrays.

Generate Full Snapshot From Xzonn Database:
- node scripts/generate-pokopia-snapshot-from-xzonn.mjs

Source used by generator:
- https://github.com/Xzonn/PokemonPokopiaDatabase

Generate Full Snapshot From Official PokopiAPI (recommended):
- node scripts/generate-pokopia-snapshot-from-api.mjs

Why use this generator:
- Includes official iconUrl values for habitats, climates, types, and specialties
- Avoids numbered duplicate display names in local snapshot
