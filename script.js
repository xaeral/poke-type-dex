const pokemonNames = [];
const typeDataCache = new Map();
const abilityDataCache = new Map();
const allTypes = [
    "normal","fire","water","electric","grass","ice",
    "fighting","poison","ground","flying","psychic",
    "bug","rock","ghost","dragon","dark","steel","fairy"
];

const types = [
    {
        name: "Normal",
        color: "#A8A77A",
        bannerColor: "#b8b9ab",
        weak: ["Fighting"],
        resist: [],
        immune: ["Ghost"],
        strong: [],
        weakAttack: ["Rock", "Steel"],
        noEffect: ["Ghost"]
    },
    {
        name: "Fire",
        color: "#EE8130",
        weak: ["Water", "Ground", "Rock"],
        resist: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"],
        immune: [],
        strong: ["Grass", "Ice", "Bug", "Steel"],
        weakAttack: ["Fire", "Water", "Rock", "Dragon"],
        noEffect: []
    },
    {
        name: "Water",
        color: "#6390F0",
        weak: ["Electric", "Grass"],
        resist: ["Fire", "Water", "Ice", "Steel"],
        immune: [],
        strong: ["Fire", "Ground", "Rock"],
        weakAttack: ["Water", "Grass", "Dragon"],
        noEffect: []
    },
    {
        name: "Electric",
        color: "#F7D02C",
        weak: ["Ground"],
        resist: ["Electric", "Flying", "Steel"],
        immune: [],
        strong: ["Water", "Flying"],
        weakAttack: ["Electric", "Grass", "Dragon"],
        noEffect: ["Ground"]
    },
    {
        name: "Grass",
        color: "#7AC74C",
        weak: ["Fire", "Ice", "Poison", "Flying", "Bug"],
        resist: ["Water", "Electric", "Grass", "Ground"],
        immune: [],
        strong: ["Water", "Ground", "Rock"],
        weakAttack: ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"],
        noEffect: []
    },
    {
        name: "Ice",
        color: "#96D9D6",
        weak: ["Fire", "Fighting", "Rock", "Steel"],
        resist: ["Ice"],
        immune: [],
        strong: ["Grass", "Ground", "Flying", "Dragon"],
        weakAttack: ["Fire", "Water", "Ice", "Steel"],
        noEffect: []
    },
    {
        name: "Fighting",
        color: "#C22E28",
        weak: ["Flying", "Psychic", "Fairy"],
        resist: ["Bug", "Rock", "Dark"],
        immune: [],
        strong: ["Normal", "Ice", "Rock", "Dark", "Steel"],
        weakAttack: ["Poison", "Flying", "Psychic", "Bug", "Fairy"],
        noEffect: ["Ghost"]
    },
    {
        name: "Poison",
        color: "#A33EA1",
        weak: ["Ground", "Psychic"],
        resist: ["Grass", "Fighting", "Poison", "Bug", "Fairy"],
        immune: [],
        strong: ["Grass", "Fairy"],
        weakAttack: ["Poison", "Ground", "Rock", "Ghost"],
        noEffect: ["Steel"]
    },
    {
        name: "Ground",
        color: "#E2BF65",
        weak: ["Water", "Grass", "Ice"],
        resist: ["Poison", "Rock"],
        immune: ["Electric"],
        strong: ["Fire", "Electric", "Poison", "Rock", "Steel"],
        weakAttack: ["Grass", "Bug"],
        noEffect: ["Flying"]
    },
    {
        name: "Flying",
        color: "#A98FF3",
        weak: ["Electric", "Ice", "Rock"],
        resist: ["Grass", "Fighting", "Bug"],
        immune: ["Ground"],
        strong: ["Grass", "Fighting", "Bug"],
        weakAttack: ["Electric", "Rock", "Steel"],
        noEffect: []
    },
    {
        name: "Psychic",
        color: "#F95587",
        weak: ["Bug", "Ghost", "Dark"],
        resist: ["Fighting", "Psychic"],
        immune: [],
        strong: ["Fighting", "Poison"],
        weakAttack: ["Psychic", "Steel"],
        noEffect: ["Dark"]
    },
    {
        name: "Bug",
        color: "#A6B91A",
        weak: ["Fire", "Flying", "Rock"],
        resist: ["Grass", "Fighting", "Ground"],
        immune: [],
        strong: ["Grass", "Psychic", "Dark"],
        weakAttack: ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"],
        noEffect: []
    },
    {
        name: "Rock",
        color: "#B6A136",
        weak: ["Water", "Grass", "Fighting", "Ground", "Steel"],
        resist: ["Normal", "Fire", "Poison", "Flying"],
        immune: [],
        strong: ["Fire", "Ice", "Flying", "Bug"],
        weakAttack: ["Fighting", "Ground", "Steel"],
        noEffect: []
    },
    {
        name: "Ghost",
        color: "#735797",
        weak: ["Ghost", "Dark"],
        resist: ["Poison", "Bug"],
        immune: ["Normal", "Fighting"],
        strong: ["Psychic", "Ghost"],
        weakAttack: ["Dark"],
        noEffect: ["Normal"]
    },
    {
        name: "Dragon",
        color: "#6F35FC",
        weak: ["Ice", "Dragon", "Fairy"],
        resist: ["Fire", "Water", "Electric", "Grass"],
        immune: [],
        strong: ["Dragon"],
        weakAttack: ["Steel"],
        noEffect: ["Fairy"]
    },
    {
        name: "Dark",
        color: "#705746",
        weak: ["Fighting", "Bug", "Fairy"],
        resist: ["Ghost", "Dark"],
        immune: ["Psychic"],
        strong: ["Psychic", "Ghost"],
        weakAttack: ["Fighting", "Dark", "Fairy"],
        noEffect: []
    },
    {
        name: "Steel",
        color: "#B7B7CE",
        weak: ["Fire", "Fighting", "Ground"],
        resist: ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy"],
        immune: ["Poison"],
        strong: ["Ice", "Rock", "Fairy"],
        weakAttack: ["Fire", "Water", "Electric", "Steel"],
        noEffect: []
    },
    {
        name: "Fairy",
        color: "#D685AD",
        weak: ["Poison", "Steel"],
        resist: ["Fighting", "Bug", "Dark"],
        immune: ["Dragon"],
        strong: ["Fighting", "Dragon", "Dark"],
        weakAttack: ["Fire", "Poison", "Steel"],
        noEffect: []
    }
];

const suggestionBox = document.getElementById("suggestionBox");
const input = document.getElementById("pokemonInput");
const resultEl = document.getElementById("result");
const searchButton = document.getElementById("searchButton");
const themeToggle = document.getElementById("themeToggle");
const pageContent = document.getElementById("pageContent");

function el(id){ return document.getElementById(id); }
function q(selector){ return document.querySelector(selector); }
let selectedSuggestionIndex = -1;
let activeType = null;

const typeIconMap = {
    normal: "normal",
    fire: "fire",
    water: "water",
    electric: "electric",
    grass: "grass",
    ice: "ice",
    fighting: "fighting",
    poison: "poison",
    ground: "ground",
    flying: "flying",
    psychic: "psychic",
    bug: "bug",
    rock: "rock",
    ghost: "ghost",
    dragon: "dragon",
    dark: "dark",
    steel: "steel",
    fairy: "fairy"
};

const typeBannerMap = {
    normal: "normal-banner.png",
    fire: "fire-banner.png",
    water: "water-banner.png",
    electric: "electric-banner.png",
    grass: "grass-banner.png",
    ice: "ice-banner.png",
    fighting: "fighting-banner.png",
    poison: "poison-banner.png",
    ground: "ground-banner.png",
    flying: "flying-banner.png",
    psychic: "psychic-banner.png",
    bug: "bug-banner.png",
    rock: "rock-banner.png",
    ghost: "ghost-banner.png",
    dragon: "dragon-banner.png",
    dark: "dark-banner.png",
    steel: "steel-banner.png",
    fairy: "fairy-banner.png"
};

const typeColorMap = types.reduce((map, type) => {
    map[type.name.toLowerCase()] = type.color;
    return map;
}, {});

function getTypeIconUrl(name) {
    const key = name.toLowerCase();
    return `Images/${typeIconMap[key] || key}.svg`;
}

function getTypeBannerUrl(name) {
    const key = name.toLowerCase();
    return `Images/Banners/${typeBannerMap[key] || typeBannerMap.normal}`;
}

function normalize(value) {
    return value.trim().toLowerCase();
}

function capitalize(value) {
    return value.replace(/(^|\s|-)(\S)/g, (_, prefix, char) => `${prefix}${char.toUpperCase()}`);
}

function fuzzyScore(query, value) {
    if (!query) return 0;
    const normalized = value.toLowerCase();
    if (normalized === query) return 200;
    if (normalized.startsWith(query)) return 180 - normalized.indexOf(query);
    const contains = normalized.indexOf(query);
    if (contains !== -1) return 140 - contains;

    let score = 0;
    let idx = -1;
    for (const char of query) {
        idx = normalized.indexOf(char, idx + 1);
        if (idx === -1) return 0;
        score += 10 - (idx - (score ? idx : -1));
    }
    return score + 40;
}

function updateSuggestionSelection(index) {
    const items = Array.from(suggestionBox.querySelectorAll(".suggestion-item"));
    selectedSuggestionIndex = Math.max(-1, Math.min(index, items.length - 1));
    items.forEach((item, itemIndex) => {
        item.classList.toggle("active", itemIndex === selectedSuggestionIndex);
    });
}

function updateSuggestions(search) {
    const query = normalize(search);

    if (!query) {
        selectedSuggestionIndex = -1;
        suggestionBox.classList.add("hidden");
        suggestionBox.innerHTML = "";
        return;
    }

    const matches = pokemonNames
        .map(name => ({ name, score: fuzzyScore(query, name) }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 12);

    suggestionBox.classList.remove("hidden");
    suggestionBox.innerHTML = matches.length
        ? matches.map(item => `<button type="button" class="suggestion-item">${capitalize(item.name)}</button>`).join("")
        : `<div class="suggestion-empty">No matches found</div>`;
    selectedSuggestionIndex = -1;
}

async function loadPokemonList() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
    const data = await response.json();
    pokemonNames.splice(0, pokemonNames.length, ...data.results.map(p => p.name));
    updateSuggestions("");
}

async function fetchPokemon(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
        throw new Error("Pokémon not found");
    }
    return response.json();
}

async function getTypeData(type) {
    const key = type.toLowerCase();
    if (typeDataCache.has(key)) return typeDataCache.get(key);
    const response = await fetch(`https://pokeapi.co/api/v2/type/${key}`);
    const data = await response.json();
    typeDataCache.set(key, data);
    return data;
}

async function getTypeEffectiveness(types) {
    const effectiveness = {};
    allTypes.forEach(type => (effectiveness[type] = 1));

    for (const type of types) {
        const data = await getTypeData(type);
        data.damage_relations.double_damage_from.forEach(t => {
            effectiveness[t.name] *= 2;
        });
        data.damage_relations.half_damage_from.forEach(t => {
            effectiveness[t.name] *= 0.5;
        });
        data.damage_relations.no_damage_from.forEach(t => {
            effectiveness[t.name] = 0;
        });
    }

    return effectiveness;
}

async function getOffensiveMatchups(types) {
    const effectiveness = {};
    allTypes.forEach(type => (effectiveness[type] = 1));

    for (const type of types) {
        const data = await getTypeData(type);
        data.damage_relations.double_damage_to.forEach(t => {
            effectiveness[t.name] *= 2;
        });
        data.damage_relations.half_damage_to.forEach(t => {
            effectiveness[t.name] *= 0.5;
        });
        data.damage_relations.no_damage_to.forEach(t => {
            effectiveness[t.name] = 0;
        });
    }

    return effectiveness;
}

function createTypeBadge(type) {
    const lowercase = type.toLowerCase();
    return `<span class="type-badge" style="background:${typeColorMap[lowercase] || '#777'}">${capitalize(type)}</span>`;
}

function formatStatName(key) {
    const map = {
        hp: "HP",
        attack: "Attack",
        defense: "Defense",
        "special-attack": "Sp. Atk",
        "special-defense": "Sp. Def",
        speed: "Speed"
    };
    return map[key] || capitalize(key.replace(/-/g, " "));
}

function formatEfficiency(value) {
    if (value === 4) return "×4";
    if (value === 2) return "×2";
    if (value === 0.5) return "¼";
    if (value === 0.25) return "×¼";
    if (value === 0) return "0";
    return "×1";
}

function getTypeSummary(type) {
    if (type.name === "Normal") {
        return "Balanced and versatile. No special strengths, but few weaknesses.";
    }
    if (!type.strong.length) {
        return `${type.name} type is defensive and has limited offensive coverage.`;
    }
    return `${type.name} type is super effective against ${type.strong.join(", ")}.`;
}

function renderEffectivenessBlock(title, items) {
    const blockClass = title.toLowerCase().replace(/[^a-z]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return `
        <div class="effectiveness-block effectiveness-${blockClass}">
            <div class="effectiveness-title">${title}</div>
            <div class="effectiveness-list">
                ${items.length
                    ? items.map(item => `
                        <div class="effectiveness-item">
                            <img class="effectiveness-icon" src="${getTypeIconUrl(item)}" alt="${item} icon">
                            <span>${capitalize(item)}</span>
                        </div>
                    `).join("")
                    : `<div class="effectiveness-item empty">— None —</div>`}
            </div>
        </div>
    `;
}

function setActiveType(type) {
    const sameType = activeType && activeType.name === type.name;
    const referenceGrid = q('.reference-grid');
    if (sameType) {
        activeType = null;
        if (referenceGrid) referenceGrid.classList.remove("active");
        document.querySelectorAll(".type-card").forEach(card => card.classList.remove("active"));
        return;
    }

    activeType = type;
    if (referenceGrid) referenceGrid.classList.add("active");
    document.querySelectorAll(".type-card").forEach(card => {
        card.classList.toggle("active", card.dataset.type === type.name.toLowerCase());
    });

    const panelHeader = el('panelHeader');
    const panelTypeBadge = el('panelTypeBadge');
    const panelHero = el('panelHero');
    const panelTypeName = el('panelTypeName');
    const panelTypeSummary = el('panelTypeSummary');
    const panelOffensive = el('panelOffensive');
    const panelDefensive = el('panelDefensive');
    const panelOffensiveDescription = el('panelOffensiveDescription');
    const panelDefensiveDescription = el('panelDefensiveDescription');

    if (panelHeader) panelHeader.style.setProperty("--panel-banner-color", type.bannerColor || type.color);
    if (panelTypeBadge) panelTypeBadge.style.setProperty("--panel-type-color", type.color);
    if (panelTypeBadge) panelTypeBadge.style.background = "transparent";
    if (panelHero) {
        const img = panelHero.querySelector("img");
        if (img) { img.src = getTypeBannerUrl(type.name); img.alt = `${type.name} banner`; }
    }
    if (panelTypeBadge) panelTypeBadge.innerHTML = `<img src="${getTypeIconUrl(type.name)}" alt="${type.name} icon">`;
    if (panelTypeName) panelTypeName.textContent = type.name;
    if (panelTypeSummary) panelTypeSummary.textContent = getTypeSummary(type);
    if (panelDefensiveDescription) panelDefensiveDescription.textContent = `How other types' attacks affect ${type.name}.`;
    if (panelOffensiveDescription) panelOffensiveDescription.textContent = `How ${type.name} type attacks affect others.`;

    const offensiveBlocks = [
        { title: "Super Effective", items: type.strong },
        { title: "Not Very Effective", items: type.weakAttack },
        { title: "No Effect", items: type.noEffect }
    ];

    const defensiveBlocks = [
        { title: "Weak To", items: type.weak },
        { title: "Resistant", items: type.resist },
        { title: "Immune", items: type.immune }
    ];

    if (panelOffensive) panelOffensive.innerHTML = offensiveBlocks.map(block => renderEffectivenessBlock(block.title, block.items)).join("");
    if (panelDefensive) panelDefensive.innerHTML = defensiveBlocks.map(block => renderEffectivenessBlock(block.title, block.items)).join("");
}

function highlightTypeCards(typeNames) {
    const normalized = typeNames.map(t => t.toLowerCase());
    document.querySelectorAll(".type-card").forEach(card => {
        const type = card.dataset.type;
        card.classList.toggle("highlighted", normalized.includes(type));
    });
}

function renderTypeCards() {
    const gridEl = el('typeGrid');
    if (!gridEl) return;
    gridEl.innerHTML = "";
    types.forEach(type => {
        const card = document.createElement("div");
        card.className = "type-card";
        card.dataset.type = type.name.toLowerCase();
        card.innerHTML = `
            <div class="header">
                <span class="type-icon"><img src="${getTypeIconUrl(type.name)}" alt="${type.name} icon"></span>
                <span class="type-label">${type.name}</span>
            </div>
        `;

        card.addEventListener("click", () => {
            setActiveType(type);
        });

        gridEl.appendChild(card);
    });
}

function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    localStorage.setItem("pokemonTheme", theme);
}

function loadTheme() {
    const saved = localStorage.getItem("pokemonTheme") || "light";
    setTheme(saved);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

async function getAbilityDetails(abilityEntries) {
    return Promise.all(abilityEntries.map(async (entry) => {
        const url = entry.ability.url;
        if (abilityDataCache.has(url)) {
            return {
                entry,
                description: abilityDataCache.get(url)
            };
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Ability details unavailable");

            const data = await response.json();
            const effectEntry = data.effect_entries?.find(item => item.language?.name === "en");
            const flavorEntry = data.flavor_text_entries?.find(item => item.language?.name === "en");
            const description = effectEntry?.short_effect || effectEntry?.effect || flavorEntry?.flavor_text || "No description available.";
            const formattedDescription = description.replace(/\s+/g, " ").trim();

            abilityDataCache.set(url, formattedDescription);
            return {
                entry,
                description: formattedDescription
            };
        } catch {
            const fallback = "No description available.";
            abilityDataCache.set(url, fallback);
            return {
                entry,
                description: fallback
            };
        }
    }));
}

async function searchPokemon() {
    const name = normalize(input.value);
    if (!name) {
        input.focus();
        return;
    }

    resultEl.innerHTML = `<div class="loading">Loading ${capitalize(name)}...</div>`;
    suggestionBox.innerHTML = "";

    try {
        const pokemon = await fetchPokemon(name);
        const types = pokemon.types.map(t => t.type.name);
        const displayTypes = types.map(capitalize);
        const artwork = pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default;
        const defensive = await getTypeEffectiveness(types);
        const offensive = await getOffensiveMatchups(types);

        const defense4x = [];
        const defense2x = [];
        const resist25x = [];
        const resist2x = [];
        const immunities = [];

        Object.entries(defensive).forEach(([type, value]) => {
            if (value === 4) defense4x.push(type);
            else if (value === 2) defense2x.push(type);
            else if (value === 0.25) resist25x.push(type);
            else if (value === 0.5) resist2x.push(type);
            else if (value === 0) immunities.push(type);
        });

        const offense4x = [];
        const offense2x = [];
        const offense25x = [];
        const offense2res = [];
        const noEffect = [];

        Object.entries(offensive).forEach(([type, value]) => {
            if (value === 4) offense4x.push(type);
            else if (value === 2) offense2x.push(type);
            else if (value === 0.25) offense25x.push(type);
            else if (value === 0.5) offense2res.push(type);
            else if (value === 0) noEffect.push(type);
        });

        const abilityDetails = await getAbilityDetails(pokemon.abilities);
        const abilityMarkup = abilityDetails.map(({ entry, description }) => `
            <div class="badge-tag ability-badge" data-tooltip="${escapeHtml(description)}">
                ${capitalize(entry.ability.name)}
                ${entry.is_hidden ? `<span>Hidden</span>` : ""}
            </div>
        `).join("");

        resultEl.innerHTML = `
            <article class="pokemon-card">
                <button class="close-result" type="button" aria-label="Close Pokémon details">×</button>
                <div class="pokemon-card-inner">
                    <div class="pokemon-art">
                        <img src="${artwork}" alt="${capitalize(pokemon.name)} official artwork">
                    </div>
                    <div class="card-content">
                        <div class="card-header">
                            <h2>${capitalize(pokemon.name)}</h2>
                            ${displayTypes.map(createTypeBadge).join("")}
                        </div>
                        <div class="card-row">
                            <section class="card-panel">
                                <h3>Abilities</h3>
                                <div class="badge-group">${abilityMarkup}</div>
                            </section>
                        </div>
                        <div class="card-row">
                            <section class="card-panel">
                                <h3>Weak Against</h3>
                                <div class="badge-group">
                                    ${defense4x.length ? `<div class="badge-tag">×4: ${defense4x.map(capitalize).join(", ")}</div>` : ""}
                                    ${defense2x.length ? `<div class="badge-tag">×2: ${defense2x.map(capitalize).join(", ")}</div>` : ""}
                                    ${resist2x.length ? `<div class="badge-tag">×½: ${resist2x.map(capitalize).join(", ")}</div>` : ""}
                                    ${resist25x.length ? `<div class="badge-tag">×¼: ${resist25x.map(capitalize).join(", ")}</div>` : ""}
                                    ${immunities.length ? `<div class="badge-tag">0: ${immunities.map(capitalize).join(", ")}</div>` : ""}
                                </div>
                            </section>
                            <section class="card-panel">
                                <h3>Strong Against</h3>
                                <div class="badge-group">
                                    ${offense4x.length ? `<div class="badge-tag">×4: ${offense4x.map(capitalize).join(", ")}</div>` : ""}
                                    ${offense2x.length ? `<div class="badge-tag">×2: ${offense2x.map(capitalize).join(", ")}</div>` : ""}
                                    ${offense2res.length ? `<div class="badge-tag">×½: ${offense2res.map(capitalize).join(", ")}</div>` : ""}
                                    ${offense25x.length ? `<div class="badge-tag">×¼: ${offense25x.map(capitalize).join(", ")}</div>` : ""}
                                    ${noEffect.length ? `<div class="badge-tag">0: ${noEffect.map(capitalize).join(", ")}</div>` : ""}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </article>
        `;

        highlightTypeCards(types);
    } catch (error) {
        resultEl.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

searchButton.addEventListener("click", searchPokemon);
input.addEventListener("input", event => {
    updateSuggestions(event.target.value);
});

resultEl.addEventListener("click", event => {
    const closeButton = event.target.closest(".close-result");
    if (!closeButton) return;
    input.value = "";
    suggestionBox.classList.add("hidden");
    suggestionBox.innerHTML = "";
    selectedSuggestionIndex = -1;
    resultEl.innerHTML = "";
});

input.addEventListener("keydown", event => {
    const items = Array.from(suggestionBox.querySelectorAll(".suggestion-item"));
    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (items.length) {
            updateSuggestionSelection(selectedSuggestionIndex + 1);
        }
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (items.length) {
            updateSuggestionSelection(selectedSuggestionIndex - 1);
        }
    } else if (event.key === "Enter") {
        if (selectedSuggestionIndex >= 0) {
            event.preventDefault();
            const selected = items[selectedSuggestionIndex];
            if (selected) {
                input.value = selected.textContent;
                suggestionBox.classList.add("hidden");
                suggestionBox.innerHTML = "";
                searchPokemon();
            }
        } else {
            event.preventDefault();
            searchPokemon();
        }
    } else if (event.key === "Escape") {
        suggestionBox.classList.add("hidden");
        suggestionBox.innerHTML = "";
        selectedSuggestionIndex = -1;
    }
});

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    localStorage.setItem("pokemonTheme", isDark ? "dark" : "light");
});

document.addEventListener("click", event => {
    if (!event.target.closest(".search-field")) {
        suggestionBox.classList.add("hidden");
        suggestionBox.innerHTML = "";
        selectedSuggestionIndex = -1;
    }
});

suggestionBox.addEventListener("click", event => {
    const button = event.target.closest(".suggestion-item");
    if (!button) return;
    input.value = button.textContent;
    suggestionBox.classList.add("hidden");
    suggestionBox.innerHTML = "";
    selectedSuggestionIndex = -1;
    searchPokemon();
});

// --- SPA renderer & router -------------------------------------------------
function renderHomePage(){
    if (!pageContent) return;
    pageContent.innerHTML = `
        <section class="home-page">
            <h2>Welcome</h2>
            <p style="color:var(--muted);">Use the search above to look up Pokémon, or navigate to the other tools.</p>
        </section>
    `;
}

function renderPokemonPage(){
    if (!pageContent) return;
    pageContent.innerHTML = `
        <section class="pokemon-page">
            <h2>Pokémon</h2>
            <p style="color:var(--muted);">Search for a Pokémon using the search bar above. Results will appear in the Pokémon panel.</p>
        </section>
    `;
}

function renderTeraCrystalPage(){
    if (!pageContent) return;
    pageContent.innerHTML = `
        <section class="tera-page">
            <div class="tera-intro"><h2>Tera Crystals</h2><p style="color:var(--muted)">Tera Crystals allow Pokémon to change their type when Terastallized. Click any card to view the type reference.</p></div>
            <div id="teraGrid" class="tera-grid"></div>
        </section>
    `;
    const gridEl = el('teraGrid');
    // Build tera crystals array dynamically from `types` (name, color, icon, image)
    function getTeraImageUrl(name){
        const key = name.toLowerCase();
        return `Images/tera/tera-${key}.png`;
    }

    const teraCrystals = types.map(t => ({
        name: t.name,
        color: t.color || '#777',
        icon: getTypeIconUrl(t.name),
        image: getTeraImageUrl(t.name)
    }));

    gridEl.innerHTML = '';
    teraCrystals.forEach(entry => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tera-card';
        btn.dataset.type = entry.name.toLowerCase();

        const header = document.createElement('div');
        header.className = 'tera-card-header';
        btn.style.setProperty('--accent', entry.color);
        const iconWrap = document.createElement('div');
        iconWrap.className = 'tera-icon-wrap';
        const icon = document.createElement('img');
        icon.className = 'tera-card-icon';
        icon.src = entry.icon;
        icon.alt = `${entry.name} icon`;
        iconWrap.appendChild(icon);
        header.appendChild(iconWrap);

        const artWrap = document.createElement('div');
        artWrap.className = 'tera-card-art';
        const art = document.createElement('img');
        art.src = entry.image;
        art.alt = `${entry.name} Tera Crystal`;
        art.loading = 'lazy';
        art.onerror = () => { art.src = getTypeBannerUrl(entry.name); art.style.opacity = '0.35'; };
        artWrap.appendChild(art);

        const footer = document.createElement('div');
        footer.className = 'tera-card-footer';
        // footer/header backgrounds are driven by CSS var --accent
        const label = document.createElement('div');
        label.className = 'tera-card-label';
        label.textContent = entry.name.toUpperCase();
        footer.appendChild(label);

        btn.appendChild(header);
        btn.appendChild(artWrap);
        btn.appendChild(footer);

        btn.addEventListener('click', () => {
            const targetType = types.find(t => t.name.toLowerCase() === entry.name.toLowerCase());
            if (targetType) { setActivePage('reference'); setActiveType(targetType); }
        });

        gridEl.appendChild(btn);
    });
}

function renderTypeReferencePage(){
    if (!pageContent) return;
    pageContent.innerHTML = `
        <section class="reference-section">
            <div class="section-header">
                <div class="reference-heading">
                    <img class="reference-title-icon" src="Images/pokeball.png" alt="Pokéball">
                    <div>
                        <h2>Type Reference</h2>
                        <p>Explore strengths, weaknesses, and interactions for every type.</p>
                    </div>
                </div>
                <div class="reference-meta">Click any type to view details</div>
            </div>
            <div class="reference-grid">
                <div class="type-list">
                    <div class="type-list-title">All Types</div>
                    <div id="typeGrid" class="type-grid"></div>
                    <div class="type-tip">Tip: Damage multipliers are shown from the attacker’s type vs. the defender’s type.</div>
                </div>
                <div class="type-panel" id="typePanel">
                    <div class="type-panel-header" id="panelHeader">
                        <div class="panel-badge" id="panelTypeBadge"></div>
                        <div class="panel-info" id="panelInfo">
                            <div class="panel-info-inner">
                                <h3 id="panelTypeName">Normal</h3>
                                <p id="panelTypeSummary">Balanced and versatile. No special strengths, but few weaknesses.</p>
                            </div>
                        </div>
                        <div class="panel-hero" id="panelHero">
                            <img src="Images/Banners/normal-banner.png" alt="Normal banner">
                        </div>
                    </div>
                    <div class="type-panel-grid">
                        <div class="panel-card">
                            <h4>Defensive Effectiveness</h4>
                            <p id="panelDefensiveDescription" class="panel-description">How other types attack affect a type.</p>
                            <div id="panelDefensive" class="effectiveness-grid"></div>
                        </div>
                        <div class="panel-card">
                            <h4>Offensive Effectiveness</h4>
                            <p id="panelOffensiveDescription" class="panel-description">How a type's attacks affect others.</p>
                            <div id="panelOffensive" class="effectiveness-grid"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    renderTypeCards();
}

function renderTypeMatchupsPage(){
    if (!pageContent) return;
    pageContent.innerHTML = `
        <section class="matchups-page">
            <h2>Type Matchups</h2>
            <p style="color:var(--muted);">Visual matchups and charts coming here.</p>
        </section>
    `;
}

function renderGuidePage(){
    if (!pageContent) return;
    pageContent.innerHTML = `
        <section class="guides-page">
            <h2>Guides</h2>
            <p style="color:var(--muted);">Guides and resources will appear here.</p>
        </section>
    `;
}

function setActivePage(page){
    const navButtons = Array.from(document.querySelectorAll('.main-nav .nav-item'));
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
    switch(page){
        case 'home': renderHomePage(); break;
        case 'pokemon': renderPokemonPage(); break;
        case 'tera': renderTeraCrystalPage(); break;
        case 'matchups': renderTypeMatchupsPage(); break;
        case 'reference': renderTypeReferencePage(); break;
        case 'guides': renderGuidePage(); break;
        default: renderHomePage();
    }
}

// hook up nav
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.main-nav .nav-item');
    if (!btn) return;
    const page = btn.dataset.page;
    if (page) setActivePage(page);
});

// initialize app
loadTheme();
loadPokemonList();
setActivePage('reference');