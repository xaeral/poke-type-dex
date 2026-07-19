#!/usr/bin/env node

import fs from "node:fs/promises";

const SOURCE_BASE = "https://raw.githubusercontent.com/Xzonn/PokemonPokopiaDatabase/master/data";

const TYPE_TRANSLATIONS = {
    "一般": "Normal",
    "格斗": "Fighting",
    "飞行": "Flying",
    "毒": "Poison",
    "地面": "Ground",
    "岩石": "Rock",
    "虫": "Bug",
    "幽灵": "Ghost",
    "钢": "Steel",
    "火": "Fire",
    "水": "Water",
    "草": "Grass",
    "电": "Electric",
    "超能力": "Psychic",
    "冰": "Ice",
    "龙": "Dragon",
    "恶": "Dark",
    "妖精": "Fairy"
};

const SPECIALTY_TRANSLATIONS = {
    "不明": "Unknown",
    "变身": "Transform",
    "点火": "Ignite",
    "栽培": "Cultivate",
    "滋润": "Hydrate",
    "伐木": "Lumbering",
    "建造": "Build",
    "重踏": "Stomp",
    "找东西": "Scavenge",
    "飞翔": "Fly",
    "瞬间移动": "Teleport",
    "回收利用": "Recycle",
    "分类": "Sort",
    "发电": "Electrify",
    "碾压": "Crush",
    "乱撒": "Scatter",
    "交易": "Trade",
    "带动气氛": "Hype",
    "哈欠": "Yawn",
    "梦岛": "Dream Isle",
    "采蜜": "Honey Gather",
    "收纳": "Storage",
    "爆炸": "Explosion",
    "收藏家": "Collector",
    "稀有物": "Rare Finds",
    "鉴定": "Appraise",
    "发光": "Glow",
    "彩绘": "Paint",
    "贪吃鬼": "Glutton",
    "开派对": "Party",
    "DJ": "DJ",
    "工匠": "Artisan"
};

function normalizeSlug(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function parseTsv(text) {
    const lines = text.replace(/^\ufeff/, "").trim().split(/\r?\n/);
    const headers = lines.shift().split("\t");

    return lines.map(line => {
        const cols = line.split("\t");
        const row = {};
        headers.forEach((key, index) => {
            row[key] = cols[index] || "";
        });
        return row;
    });
}

function weatherToClimates(weatherCode) {
    switch (String(weatherCode || "")) {
        case "100": return ["Sunny"];
        case "110": return ["Sunny", "Cloudy"];
        case "001": return ["Rainy"];
        case "111": return ["Sunny", "Cloudy", "Rainy"];
        default: return [];
    }
}

function timeToAvailability(timeCode) {
    switch (String(timeCode || "")) {
        case "1110": return ["Morning", "Day", "Afternoon"];
        case "0001": return ["Night"];
        case "1111": return ["Morning", "Day", "Afternoon", "Night"];
        default: return [];
    }
}

function toTitleWords(value) {
    return String(value || "")
        .split(/[\s-]+/)
        .filter(Boolean)
        .map(token => token[0].toUpperCase() + token.slice(1).toLowerCase())
        .join(" ");
}

function translateType(value) {
    const key = String(value || "").trim();
    return TYPE_TRANSLATIONS[key] || toTitleWords(key);
}

function translateSpecialty(value) {
    const key = String(value || "").trim();
    return SPECIALTY_TRANSLATIONS[key] || toTitleWords(key);
}

function buildSnapshot(pokemonRows, habitatRows, locationRows) {
    const locations = locationRows.map(row => row["英文名"] || row["中文名"]).filter(Boolean);
    const habitatById = new Map(habitatRows.map(row => [Number(row["编号"]), row]));

    const englishNameCounts = new Map();
    pokemonRows.forEach(row => {
        const english = String(row["英文名"] || "").trim();
        englishNameCounts.set(english, (englishNameCounts.get(english) || 0) + 1);
    });

    const items = pokemonRows.map((row, idx) => {
        const indexNumber = Number(row["编号"] || 0);
        const formNumber = Number(row["形态编号"] || 0);
        const baseEnglishName = String(row["英文名"] || "").trim();
        const duplicateCount = englishNameCounts.get(baseEnglishName) || 0;
        const hasDuplicate = duplicateCount > 1;

        const suffix = hasDuplicate
            ? (formNumber > 0 ? ` Form ${formNumber}` : ` Variant ${idx + 1}`)
            : "";

        const displayName = `${baseEnglishName}${suffix}`;
        const baseSlug = normalizeSlug(baseEnglishName);
        const slug = hasDuplicate
            ? `${baseSlug}-${formNumber > 0 ? formNumber : idx + 1}`
            : baseSlug;

        const habitatIds = String(row["栖息地"] || "")
            .split("|")
            .map(value => Number(value))
            .filter(value => Number.isFinite(value) && value > 0);

        const habitats = habitatIds
            .map(id => habitatById.get(id))
            .filter(Boolean)
            .map(habitat => {
                const english = String(habitat["英文名"] || "").trim();
                const name = english || String(habitat["中文名"] || "").trim();
                return {
                    name,
                    iconUrl: `https://cdn.pokopiapi.com/images/habitats/${normalizeSlug(name)}.png`
                };
            });

        const rawSpecialties = String(row["特长"] || "")
            .split("|")
            .map(token => token.trim())
            .filter(Boolean);

        const specialties = rawSpecialties.map(name => ({ name: translateSpecialty(name) }));

        const spawnZones = [];
        const zoneSet = new Set();
        habitatIds.forEach(id => {
            const habitat = habitatById.get(id);
            if (!habitat) return;

            const records = String(habitat["宝可梦"] || "").split("|");
            records.forEach(record => {
                const [form, , location] = record.split(",");
                if (form !== baseEnglishName) return;

                const value = String(location || "").trim();
                if (!value) return;

                if (value === "全部") {
                    locations.forEach(loc => {
                        if (loc && !zoneSet.has(loc)) {
                            zoneSet.add(loc);
                            spawnZones.push(loc);
                        }
                    });
                    return;
                }

                if (!zoneSet.has(value)) {
                    zoneSet.add(value);
                    spawnZones.push(value);
                }
            });
        });

        return {
            localNumber: String(indexNumber % 10000).padStart(3, "0"),
            nationalNumber: indexNumber <= 1025 ? indexNumber : undefined,
            name: displayName,
            slug,
            lookupName: baseEnglishName.toLowerCase(),
            types: [row["属性1"], row["属性2"]]
                .map(typeName => String(typeName || "").trim())
                .filter(Boolean)
                .map(typeName => ({ name: translateType(typeName) })),
            specialties,
            habitats,
            climates: weatherToClimates(row["天气"]).map(name => ({ name })),
            timeAvailability: timeToAvailability(row["时间"]).map(name => ({ name })),
            spawnZones,
            imageUrl: `https://cdn.pokopiapi.com/images/pokemon/${baseSlug}.png`
        };
    });

    return { pokemon: items };
}

async function fetchText(url) {
    const response = await fetch(url, { headers: { Accept: "text/plain" } });
    if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return response.text();
}

async function main() {
    const outputPath = process.argv[2] || "pokopia-snapshot.json";

    const [pokemonText, habitatText, locationText] = await Promise.all([
        fetchText(`${SOURCE_BASE}/pokemon.txt`),
        fetchText(`${SOURCE_BASE}/habitat.txt`),
        fetchText(`${SOURCE_BASE}/location.txt`)
    ]);

    const snapshot = buildSnapshot(
        parseTsv(pokemonText),
        parseTsv(habitatText),
        parseTsv(locationText)
    );

    await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    console.log(`Wrote ${snapshot.pokemon.length} pokemon to ${outputPath}`);
}

main().catch(error => {
    console.error(error?.message || error);
    process.exit(1);
});
