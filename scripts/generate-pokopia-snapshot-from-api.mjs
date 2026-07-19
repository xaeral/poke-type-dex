#!/usr/bin/env node

import fs from "node:fs/promises";

const API_BASE = "https://pokopiapi.com/api/v1/pokemon";

async function fetchPage(page, limit = 100) {
    const url = new URL(API_BASE);
    url.searchParams.set("lang", "en");
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
        throw new Error(`Failed API request ${url}: ${response.status}`);
    }

    return response.json();
}

function normalizePokemonRow(row) {
    return {
        localNumber: String(row.localNumber || ""),
        nationalNumber: Number(row.nationalNumber),
        name: String(row.name || ""),
        slug: String(row.slug || ""),
        types: Array.isArray(row.types) ? row.types : [],
        specialties: Array.isArray(row.specialties) ? row.specialties : [],
        habitats: Array.isArray(row.habitats) ? row.habitats : [],
        climates: Array.isArray(row.climates) ? row.climates : [],
        timeAvailability: Array.isArray(row.timeAvailability) ? row.timeAvailability : [],
        spawnZones: Array.isArray(row.spawnZones) ? row.spawnZones : [],
        imageUrl: String(row.imageUrl || "")
    };
}

async function main() {
    const outputPath = process.argv[2] || "pokopia-snapshot.json";

    const allPokemon = [];
    let page = 1;
    const limit = 100;

    while (true) {
        const payload = await fetchPage(page, limit);
        const data = Array.isArray(payload?.data) ? payload.data : [];

        allPokemon.push(...data.map(normalizePokemonRow));

        if (data.length < limit) break;
        page += 1;
    }

    const dedupe = new Map();
    allPokemon.forEach(row => {
        if (row.slug && !dedupe.has(row.slug)) {
            dedupe.set(row.slug, row);
        }
    });

    const pokemon = Array.from(dedupe.values()).sort((a, b) => {
        if (a.nationalNumber !== b.nationalNumber) return a.nationalNumber - b.nationalNumber;
        return a.name.localeCompare(b.name);
    });

    await fs.writeFile(outputPath, `${JSON.stringify({ pokemon }, null, 2)}\n`, "utf8");
    console.log(`Wrote ${pokemon.length} pokemon to ${outputPath}`);
}

main().catch(error => {
    console.error(error?.message || error);
    process.exit(1);
});
