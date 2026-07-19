#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

function asArray(value) {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];

    const candidates = [
        value.pokemon,
        value.data,
        value.results,
        value.entries,
        value.items,
        value.pokedex,
        value.list
    ];

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate;
    }

    return [];
}

function asString(value) {
    if (typeof value === "string") return value.trim();
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function normalizeSlug(value) {
    return asString(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getNameFromNode(node) {
    if (typeof node === "string") return asString(node);
    if (!node || typeof node !== "object") return "";

    return asString(
        node.name
        || node.label
        || node.value
        || node.title
        || node.key
    );
}

function getIconFromNode(node) {
    if (!node || typeof node !== "object") return "";
    return asString(node.iconUrl || node.iconurl || node.imageUrl || node.image || node.img);
}

function toNameObjectList(value, options = {}) {
    const keepRarity = Boolean(options.keepRarity);

    const rawList = Array.isArray(value)
        ? value
        : (value ? [value] : []);

    const seen = new Set();
    const normalized = [];

    for (const item of rawList) {
        const name = getNameFromNode(item);
        if (!name) continue;

        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const iconUrl = getIconFromNode(item);
        const row = { name };

        if (iconUrl) {
            row.iconUrl = iconUrl;
        }

        if (keepRarity && item && typeof item === "object" && Number.isFinite(Number(item.rarity))) {
            row.rarity = Number(item.rarity);
        }

        normalized.push(row);
    }

    return normalized;
}

function toStringList(value) {
    const rawList = Array.isArray(value)
        ? value
        : (value ? [value] : []);

    const seen = new Set();
    const list = [];

    for (const item of rawList) {
        const label = getNameFromNode(item);
        if (!label) continue;

        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        list.push(label);
    }

    return list;
}

function normalizePokemonEntry(entry) {
    const name = asString(entry?.name || entry?.pokemon || entry?.species || entry?.displayName);
    const slug = normalizeSlug(entry?.slug || entry?.id || entry?.key || name);

    if (!name || !slug) return null;

    const localNumber = asString(entry?.localNumber || entry?.local_number);
    const nationalNumber = Number.isFinite(Number(entry?.nationalNumber))
        ? Number(entry.nationalNumber)
        : (Number.isFinite(Number(entry?.national_number)) ? Number(entry.national_number) : undefined);

    const types = toNameObjectList(entry?.types || entry?.pokemonTypes || entry?.type);
    const specialties = toNameObjectList(entry?.specialties || entry?.specialty);
    const habitats = toNameObjectList(entry?.habitats || entry?.habitat, { keepRarity: true });
    const climates = toNameObjectList(entry?.climates || entry?.climate);
    const timeAvailability = toNameObjectList(
        entry?.timeAvailability
        || entry?.timesAvailability
        || entry?.times
        || entry?.availability
        || entry?.time
    );
    const spawnZones = toStringList(entry?.spawnZones || entry?.spawnZone || entry?.zones);

    const row = {
        name,
        slug,
        specialties,
        habitats,
        climates,
        timeAvailability,
        spawnZones
    };

    if (localNumber) {
        row.localNumber = localNumber;
    }

    if (nationalNumber !== undefined) {
        row.nationalNumber = nationalNumber;
    }

    if (types.length) {
        row.types = types;
    }

    const imageUrl = asString(entry?.imageUrl || entry?.image || entry?.artwork);
    if (imageUrl) {
        row.imageUrl = imageUrl;
    }

    return row;
}

function sortPokemonRows(rows) {
    return rows.sort((a, b) => {
        const aHasNum = Number.isFinite(a.nationalNumber);
        const bHasNum = Number.isFinite(b.nationalNumber);

        if (aHasNum && bHasNum && a.nationalNumber !== b.nationalNumber) {
            return a.nationalNumber - b.nationalNumber;
        }

        if (aHasNum && !bHasNum) return -1;
        if (!aHasNum && bHasNum) return 1;

        return a.name.localeCompare(b.name);
    });
}

async function main() {
    const [, , inputArg, outputArg] = process.argv;

    if (!inputArg) {
        console.error("Usage: node scripts/import-pokopia-snapshot.mjs <input-json> [output-json]");
        process.exit(1);
    }

    const cwd = process.cwd();
    const inputPath = path.resolve(cwd, inputArg);
    const outputPath = path.resolve(cwd, outputArg || "pokopia-snapshot.json");

    const rawText = await fs.readFile(inputPath, "utf8");
    const rawJson = JSON.parse(rawText);
    const rows = asArray(rawJson).map(normalizePokemonEntry).filter(Boolean);

    if (!rows.length) {
        throw new Error("No Pokemon rows found. Check input JSON shape.");
    }

    const deduped = [];
    const seen = new Set();

    for (const row of sortPokemonRows(rows)) {
        const key = row.slug.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        deduped.push(row);
    }

    const output = {
        pokemon: deduped
    };

    await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

    console.log(`Imported ${deduped.length} Pokemon to ${path.relative(cwd, outputPath)}`);
}

main().catch(error => {
    console.error(error?.message || error);
    process.exit(1);
});
