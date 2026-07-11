const pokemonNames = [];
const typeDataCache = new Map();
const abilityDataCache = new Map();
const speciesDataCache = new Map();
const evolutionChainCache = new Map();
let searchRequestToken = 0;
let suggestionUpdateTimer = null;
const suggestionDebounceMs = 80;
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

const objectiveCategoryMeta = {
    Gym: { color: "#4ea1ff", icon: "G", shortLabel: "Gym" },
    Titan: { color: "#ff9f43", icon: "T", shortLabel: "Titan" },
    "Team Star": { color: "#a875ff", icon: "S", shortLabel: "Team Star" }
};

// Use direct map coordinates (0-100) for this asset.
const adventureMapBounds = {
    left: 0,
    right: 100,
    top: 0,
    bottom: 100
};

const adventureDisplayCategories = new Set(["Gym", "Titan", "Team Star"]);

const adventureMapGenieGeoBounds = {
    minLat: 0.4412095757464,
    maxLat: 0.91498839656768,
    minLng: -0.97556691147602,
    maxLng: -0.45514092457378
};

const adventureMapGenieCoordsById = {
    1: { lat: 0.5512444567072, lng: -0.82383781671632 },
    2: { lat: 0.58456002638936, lng: -0.60537665450381 },
    3: { lat: 0.566368186402, lng: -0.56563347429598 },
    4: { lat: 0.62361017586358, lng: -0.9211014962078 },
    5: { lat: 0.65013088475433, lng: -0.81378109393586 },
    6: { lat: 0.65115242750585, lng: -0.5280091241951 },
    7: { lat: 0.59076089492335, lng: -0.5728077856198 },
    8: { lat: 0.6947835701945, lng: -0.55786427996809 },
    9: { lat: 0.6799777836933, lng: -0.81236621036891 },
    10: { lat: 0.72489354968322, lng: -0.64244183517402 },
    11: { lat: 0.72975279062881, lng: -0.7611569932919 },
    12: { lat: 0.81654638492365, lng: -0.67604846565898 },
    13: { lat: 0.49038893655426, lng: -0.88042553253963 },
    14: { lat: 0.68032570615709, lng: -0.90984129344157 },
    15: { lat: 0.78400919678428, lng: -0.66156980232648 },
    16: { lat: 0.88572296166669, lng: -0.72750657372857 },
    17: { lat: 0.78588917013122, lng: -0.51590172743891 },
    18: { lat: 0.82055871266074, lng: -0.79742303931916 }
};

const adventureMapGenieOffsetById = {
    1: { x: 0, y: -1.5 },
    2: { x: -3, y: 5 },
    3: { x: -5, y: 2 },
    4: { x: 1, y: 4 },
    5: { x: 0, y: 4.5 },
    6: { x: -4, y: 4.5 },
    7: { x: -3.5, y: 3 },
    8: { x: -4, y: 5.5 },
    9: { x: -2, y: 3.5 },
    10: { x: -2, y: 5 },
    11: { x: 0, y: 5 },
    12: { x: -1, y: 6 },
    13: { x: 0, y: -1 },
    14: { x: 0, y: 4.5 },
    15: { x: -1.5, y: 5.5 },
    16: { x: -1, y: 6.5 },
    17: { x: -4, y: 7 },
    18: { x: 0, y: 8 }
};

const adventureGuide = [
    {
        id: 1,
        name: "Cortondo Gym",
        category: "Gym",
        type: "Bug",
        level: "14-15",
        location: "Cortondo",
        leader: "Katy",
        description: "Take on Katy and her Bug-type team to earn your first Gym Badge.",
        mapX: 29.5,
        mapY: 76.5,
        heroImage: "./Images/adventure/cortondo-gym.png",
        weaknesses: ["Fire", "Flying", "Rock"],
        resistances: ["Grass", "Fighting", "Ground"],
        immunities: [],
        team: [
            { pokemon: "Nymble", level: 14 },
            { pokemon: "Tarountula", level: 14 },
            { pokemon: "Teddiursa", level: 15 }
        ]
    },
    {
        id: 2,
        name: "Stony Cliff Titan",
        category: "Titan",
        type: "Rock",
        level: "16",
        location: "South Province (Area Three)",
        leader: "Klawf Titan",
        description: "Track down the giant Klawf and battle it to secure the first Herba Mystica path objective.",
        mapX: 67,
        mapY: 70,
        heroImage: "./Images/adventure/stony-cliff-titan.png",
        weaknesses: ["Water", "Grass", "Fighting", "Ground", "Steel"],
        resistances: ["Normal", "Fire", "Poison", "Flying"],
        immunities: [],
        team: [
            { pokemon: "Klawf", level: 16 }
        ]
    },
    {
        id: 3,
        name: "Artazon Gym",
        category: "Gym",
        type: "Grass",
        level: "16-18",
        location: "Artazon",
        leader: "Brassius",
        description: "Defeat Brassius and his artistic Grass-type lineup in East Province.",
        mapX: 75,
        mapY: 74.8,
        heroImage: "./Images/adventure/artazon-gym.png",
        weaknesses: ["Fire", "Ice", "Poison", "Flying", "Bug"],
        resistances: ["Water", "Electric", "Grass", "Ground"],
        immunities: [],
        team: [
            { pokemon: "Petilil", level: 16 },
            { pokemon: "Smoliv", level: 16 },
            { pokemon: "Sudowoodo", level: 17 }
        ]
    },
    {
        id: 4,
        name: "Open Sky Titan",
        category: "Titan",
        type: "Flying",
        level: "19",
        location: "West Province (Area One)",
        leader: "Bombirdier Titan",
        description: "Battle Bombirdier in the cliffs and continue the Path of Legends storyline.",
        mapX: 10,
        mapY: 54,
        heroImage: "./Images/adventure/open-sky-titan.png",
        weaknesses: ["Electric", "Ice", "Rock"],
        resistances: ["Grass", "Fighting", "Bug"],
        immunities: ["Ground"],
        team: [
            { pokemon: "Bombirdier", level: 19 }
        ]
    },
    {
        id: 5,
        name: "Team Star Dark Crew",
        category: "Team Star",
        type: "Dark",
        level: "20-21",
        location: "West Province (Area One)",
        leader: "Giacomo",
        description: "Infiltrate the Dark Crew base and challenge Giacomo's Segin Starmobile.",
        mapX: 27,
        mapY: 58,
        heroImage: "./Images/adventure/team-star-dark-crew.png",
        weaknesses: ["Fighting", "Bug", "Fairy"],
        resistances: ["Ghost", "Dark"],
        immunities: ["Psychic"],
        team: [
            { pokemon: "Pawniard", level: 21 },
            { pokemon: "Segin Starmobile", level: 20 }
        ]
    },
    {
        id: 6,
        name: "Levincia Gym",
        category: "Gym",
        type: "Electric",
        level: "23-24",
        location: "Levincia",
        leader: "Iono",
        description: "Face streamer Gym Leader Iono for your next badge in Levincia.",
        mapX: 83,
        mapY: 57,
        heroImage: "./Images/adventure/levincia-gym.png",
        weaknesses: ["Ground"],
        resistances: ["Electric", "Flying", "Steel"],
        immunities: [],
        team: [
            { pokemon: "Wattrel", level: 23 },
            { pokemon: "Bellibolt", level: 23 },
            { pokemon: "Luxio", level: 23 },
            { pokemon: "Mismagius", level: 24 }
        ]
    },
    {
        id: 7,
        name: "Team Star Fire Crew",
        category: "Team Star",
        type: "Fire",
        level: "26-27",
        location: "East Province (Area One)",
        leader: "Mela",
        description: "Defeat Mela and the Schedar Starmobile in Team Star's Fire base.",
        mapX: 74,
        mapY: 69,
        heroImage: "./Images/adventure/team-star-fire-crew.png",
        weaknesses: ["Water", "Ground", "Rock"],
        resistances: ["Fire", "Grass", "Ice", "Bug", "Steel", "Fairy"],
        immunities: [],
        team: [
            { pokemon: "Torkoal", level: 27 },
            { pokemon: "Schedar Starmobile", level: 26 }
        ]
    },
    {
        id: 8,
        name: "Lurking Steel Titan",
        category: "Titan",
        type: "Steel",
        level: "28",
        location: "East Province (Area Three)",
        leader: "Orthworm Titan",
        description: "Chase Orthworm through rocky tunnels to claim another Herba Mystica.",
        mapX: 77,
        mapY: 49,
        heroImage: "./Images/adventure/lurking-steel-titan.png",
        weaknesses: ["Fire", "Fighting", "Ground"],
        resistances: ["Normal", "Grass", "Ice", "Flying", "Psychic", "Bug", "Rock", "Dragon", "Steel", "Fairy"],
        immunities: ["Poison"],
        team: [
            { pokemon: "Orthworm", level: 28 }
        ]
    },
    {
        id: 9,
        name: "Cascarrafa Gym",
        category: "Gym",
        type: "Water",
        level: "29-30",
        location: "Cascarrafa",
        leader: "Kofu",
        description: "Take on Kofu's Water-types in the bustling market city of Cascarrafa.",
        mapX: 27,
        mapY: 52,
        heroImage: "./Images/adventure/cascarrafa-gym.png",
        weaknesses: ["Electric", "Grass"],
        resistances: ["Fire", "Water", "Ice", "Steel"],
        immunities: [],
        team: [
            { pokemon: "Veluza", level: 29 },
            { pokemon: "Wugtrio", level: 29 },
            { pokemon: "Crabominable", level: 30 }
        ]
    },
    {
        id: 10,
        name: "Team Star Poison Crew",
        category: "Team Star",
        type: "Poison",
        level: "32-33",
        location: "Tagtree Thicket",
        leader: "Atticus",
        description: "Break through the Poison Crew defenses and battle Atticus.",
        mapX: 64,
        mapY: 40,
        heroImage: "./Images/adventure/team-star-poison-crew.png",
        weaknesses: ["Ground", "Psychic"],
        resistances: ["Grass", "Fighting", "Poison", "Bug", "Fairy"],
        immunities: [],
        team: [
            { pokemon: "Skuntank", level: 32 },
            { pokemon: "Muk", level: 32 },
            { pokemon: "Navi Starmobile", level: 33 }
        ]
    },
    {
        id: 11,
        name: "Medali Gym",
        category: "Gym",
        type: "Normal",
        level: "35-36",
        location: "Medali",
        leader: "Larry",
        description: "Challenge Larry in Medali and secure your next Gym Badge.",
        mapX: 40,
        mapY: 39,
        heroImage: "./Images/adventure/medali-gym.png",
        weaknesses: ["Fighting"],
        resistances: [],
        immunities: ["Ghost"],
        team: [
            { pokemon: "Komala", level: 35 },
            { pokemon: "Dudunsparce", level: 35 },
            { pokemon: "Staraptor", level: 36 }
        ]
    },
    {
        id: 12,
        name: "Montenevera Gym",
        category: "Gym",
        type: "Ghost",
        level: "41-42",
        location: "Montenevera",
        leader: "Ryme",
        description: "Take on Ryme's Ghost-type team in a double battle format.",
        mapX: 56,
        mapY: 28,
        heroImage: "./Images/adventure/montenevera-gym.png",
        weaknesses: ["Ghost", "Dark"],
        resistances: ["Poison", "Bug"],
        immunities: ["Normal", "Fighting"],
        team: [
            { pokemon: "Banette", level: 41 },
            { pokemon: "Mimikyu", level: 41 },
            { pokemon: "Houndstone", level: 42 },
            { pokemon: "Toxtricity", level: 42 }
        ]
    },
    {
        id: 13,
        name: "Alfornada Gym",
        category: "Gym",
        type: "Psychic",
        level: "44-45",
        location: "Alfornada",
        leader: "Tulip",
        description: "Win against Tulip's Psychic team in Alfornada's Gym test finale.",
        mapX: 13,
        mapY: 86,
        heroImage: "./Images/adventure/alfornada-gym.png",
        weaknesses: ["Bug", "Ghost", "Dark"],
        resistances: ["Fighting", "Psychic"],
        immunities: [],
        team: [
            { pokemon: "Farigiraf", level: 44 },
            { pokemon: "Gardevoir", level: 44 },
            { pokemon: "Espathra", level: 44 },
            { pokemon: "Florges", level: 45 }
        ]
    },
    {
        id: 14,
        name: "Quaking Earth Titan",
        category: "Titan",
        type: "Ground",
        level: "44",
        location: "Asado Desert",
        leader: "Great Tusk / Iron Treads",
        description: "Defeat the Quaking Earth Titan roaming the Asado Desert.",
        mapX: 7,
        mapY: 63,
        heroImage: "./Images/adventure/quaking-earth-titan.png",
        weaknesses: ["Water", "Grass", "Ice"],
        resistances: ["Poison", "Rock"],
        immunities: ["Electric"],
        team: [
            { pokemon: "Great Tusk", level: 44 }
        ]
    },
    {
        id: 15,
        name: "Glaseado Gym",
        category: "Gym",
        type: "Ice",
        level: "47-48",
        location: "Glaseado Mountain",
        leader: "Grusha",
        description: "Climb the snowy mountain and battle Grusha for the Ice Badge.",
        mapX: 61,
        mapY: 35,
        heroImage: "./Images/adventure/glaseado-gym.png",
        weaknesses: ["Fire", "Fighting", "Rock", "Steel"],
        resistances: ["Ice"],
        immunities: [],
        team: [
            { pokemon: "Frosmoth", level: 47 },
            { pokemon: "Beartic", level: 47 },
            { pokemon: "Cetitan", level: 47 },
            { pokemon: "Altaria", level: 48 }
        ]
    },
    {
        id: 16,
        name: "Team Star Fairy Crew",
        category: "Team Star",
        type: "Fairy",
        level: "50-51",
        location: "North Province (Area Three)",
        leader: "Ortega",
        description: "Challenge Ortega's Fairy crew and stop the Ruchbah Starmobile.",
        mapX: 50,
        mapY: 8,
        heroImage: "./Images/adventure/team-star-fairy-crew.png",
        weaknesses: ["Poison", "Steel"],
        resistances: ["Fighting", "Bug", "Dark"],
        immunities: ["Dragon"],
        team: [
            { pokemon: "Azumarill", level: 50 },
            { pokemon: "Wigglytuff", level: 50 },
            { pokemon: "Dachsbun", level: 50 },
            { pokemon: "Ruchbah Starmobile", level: 51 }
        ]
    },
    {
        id: 17,
        name: "Team Star Fighting Crew",
        category: "Team Star",
        type: "Fighting",
        level: "55-56",
        location: "North Province (Area One)",
        leader: "Eri",
        description: "Take down Team Star's final stronghold with Eri and the Caph Starmobile.",
        mapX: 84,
        mapY: 28,
        heroImage: "./Images/adventure/team-star-fighting-crew.png",
        weaknesses: ["Flying", "Psychic", "Fairy"],
        resistances: ["Bug", "Rock", "Dark"],
        immunities: [],
        team: [
            { pokemon: "Toxicroak", level: 55 },
            { pokemon: "Passimian", level: 55 },
            { pokemon: "Lucario", level: 55 },
            { pokemon: "Caph Starmobile", level: 56 }
        ]
    },
    {
        id: 18,
        name: "False Dragon Titan",
        category: "Titan",
        type: "Dragon",
        level: "55",
        location: "Casseroya Lake",
        leader: "Dondozo & Tatsugiri",
        description: "Complete the final Titan objective at Casseroya Lake.",
        mapX: 35,
        mapY: 23,
        heroImage: "./Images/adventure/false-dragon-titan.png",
        weaknesses: ["Ice", "Dragon", "Fairy"],
        resistances: ["Fire", "Water", "Electric", "Grass"],
        immunities: [],
        team: [
            { pokemon: "Tatsugiri", level: 55 },
            { pokemon: "Dondozo", level: 55 }
        ]
    }
];

let selectedAdventureObjectiveId = adventureGuide[0]?.id || null;
let adventureResizeHandler = null;
let adventureMapPositionState = null;
let adventureDragState = null;
let adventureSuppressMarkerClick = false;
const adventureProgressStorageKey = "adventureGuideProgressV1";
let adventureMapAspectRatio = 1;
const adventureMapBaseZoom = 1.28;
const adventureMapZoomMin = 0.4;
const adventureMapZoomMax = 2.6;
const adventureMapZoomStep = 0.2;
let adventureMapZoomLevel = 1;
let adventureCompletedObjectiveIds = new Set();

function loadAdventureProgress() {
    try {
        const stored = localStorage.getItem(adventureProgressStorageKey);
        if (!stored) {
            adventureCompletedObjectiveIds = new Set();
            return;
        }

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) {
            adventureCompletedObjectiveIds = new Set();
            return;
        }

        adventureCompletedObjectiveIds = new Set(parsed.map(value => Number(value)).filter(Number.isFinite));
    } catch {
        adventureCompletedObjectiveIds = new Set();
    }
}

function saveAdventureProgress() {
    try {
        localStorage.setItem(adventureProgressStorageKey, JSON.stringify([...adventureCompletedObjectiveIds]));
    } catch {
        // Ignore storage write failures.
    }
}

function isAdventureObjectiveCompleted(id) {
    return adventureCompletedObjectiveIds.has(Number(id));
}

function setAdventureObjectiveCompleted(id, completed) {
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) return;

    if (completed) adventureCompletedObjectiveIds.add(numericId);
    else adventureCompletedObjectiveIds.delete(numericId);
    saveAdventureProgress();

    const card = document.querySelector(`.adventure-objective-card[data-objective-id="${numericId}"]`);
    if (card) card.classList.toggle("completed", completed);

    const marker = document.querySelector(`.adventure-marker[data-objective-id="${numericId}"]`);
    if (marker) marker.classList.toggle("completed", completed);
}

function getTypeIconUrl(name) {
    const key = name.toLowerCase();
    return `./Images/${typeIconMap[key] || key}.svg`;
}

function getTypeBannerUrl(name) {
    const key = name.toLowerCase();
    return `./Images/Banners/${typeBannerMap[key] || typeBannerMap.normal}`;
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

function scheduleSuggestionUpdate(value) {
    if (suggestionUpdateTimer) {
        clearTimeout(suggestionUpdateTimer);
    }

    suggestionUpdateTimer = setTimeout(() => {
        updateSuggestions(value);
    }, suggestionDebounceMs);
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

    const uniqueTypes = [...new Set(types.map(type => String(type).toLowerCase()))];
    const typeDataList = await Promise.all(uniqueTypes.map(type => getTypeData(type)));

    for (const data of typeDataList) {
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

    const uniqueTypes = [...new Set(types.map(type => String(type).toLowerCase()))];
    const typeDataList = await Promise.all(uniqueTypes.map(type => getTypeData(type)));

    for (const data of typeDataList) {
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
    const saved = localStorage.getItem("pokemonTheme") || "dark";
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

function formatLocationName(value) {
    return capitalize(String(value || "").replace(/-/g, " "));
}

function formatPokemonName(value) {
    return capitalize(String(value || "").replace(/-/g, " "));
}

async function getSpeciesData(speciesUrl) {
    if (!speciesUrl) return null;
    if (speciesDataCache.has(speciesUrl)) return speciesDataCache.get(speciesUrl);
    try {
        const response = await fetch(speciesUrl);
        if (!response.ok) {
            speciesDataCache.set(speciesUrl, null);
            return null;
        }
        const data = await response.json();
        speciesDataCache.set(speciesUrl, data);
        return data;
    } catch {
        speciesDataCache.set(speciesUrl, null);
        return null;
    }
}

async function getEvolutionChainData(chainUrl) {
    if (!chainUrl) return null;
    if (evolutionChainCache.has(chainUrl)) return evolutionChainCache.get(chainUrl);
    try {
        const response = await fetch(chainUrl);
        if (!response.ok) {
            evolutionChainCache.set(chainUrl, null);
            return null;
        }
        const data = await response.json();
        evolutionChainCache.set(chainUrl, data);
        return data;
    } catch {
        evolutionChainCache.set(chainUrl, null);
        return null;
    }
}

function findEvolutionNode(chainNode, pokemonName) {
    if (!chainNode || !pokemonName) return null;
    if (chainNode.species?.name === pokemonName) return chainNode;
    for (const child of chainNode.evolves_to || []) {
        const match = findEvolutionNode(child, pokemonName);
        if (match) return match;
    }
    return null;
}

function formatEvolutionRequirement(detail) {
    if (!detail) return "Condition unknown";

    const parts = [];
    const trigger = detail.trigger?.name || "";

    if (trigger === "level-up") {
        parts.push(detail.min_level ? `At level ${detail.min_level}` : "Level up");
    } else if (trigger === "trade") {
        parts.push("Trade");
    } else if (trigger === "use-item") {
        parts.push("Use item");
    }

    if (detail.item?.name) {
        const itemName = formatLocationName(detail.item.name);
        parts.push(trigger === "use-item" ? `Use ${itemName}` : `With ${itemName}`);
    }
    if (detail.held_item?.name) parts.push(`While holding ${formatLocationName(detail.held_item.name)}`);
    if (detail.location?.name) parts.push(`At ${formatLocationName(detail.location.name)}`);
    if (detail.time_of_day) parts.push(`During ${capitalize(detail.time_of_day)}`);
    if (detail.min_happiness) parts.push(`With friendship ${detail.min_happiness}+`);
    if (detail.min_affection) parts.push(`With affection ${detail.min_affection}+`);
    if (detail.min_beauty) parts.push(`With beauty ${detail.min_beauty}+`);
    if (detail.known_move?.name) parts.push(`Knowing ${formatLocationName(detail.known_move.name)}`);
    if (detail.known_move_type?.name) parts.push(`Knowing a ${formatLocationName(detail.known_move_type.name)}-type move`);
    if (detail.gender === 1) parts.push("Female only");
    if (detail.gender === 2) parts.push("Male only");
    if (detail.needs_overworld_rain) parts.push("During rain");
    if (detail.turn_upside_down) parts.push("Turn device upside down");
    if (detail.trade_species?.name) parts.push(`For ${formatPokemonName(detail.trade_species.name)}`);

    return parts.length ? parts.join(" • ") : "Condition unknown";
}

async function getEvolutionInfo(pokemonName, speciesUrl) {
    const speciesData = await getSpeciesData(speciesUrl);
    if (!speciesData) return null;

    const chainUrl = speciesData.evolution_chain?.url;
    const chainData = await getEvolutionChainData(chainUrl);
    const currentNode = chainData?.chain ? findEvolutionNode(chainData.chain, pokemonName) : null;

    const evolvesTo = (currentNode?.evolves_to || []).map(target => {
        const details = (target.evolution_details || []).map(formatEvolutionRequirement).filter(Boolean);
        return {
            name: target.species?.name || "Unknown",
            methods: details.length ? details : ["Condition unknown"]
        };
    });

    return {
        evolvesTo
    };
}

async function searchPokemon() {
    const name = normalize(input.value);
    if (!name) {
        input.focus();
        return;
    }

    const requestToken = ++searchRequestToken;

    resultEl.innerHTML = `<div class="loading">Loading ${capitalize(name)}...</div>`;
    suggestionBox.innerHTML = "";

    try {
        const pokemon = await fetchPokemon(name);
        if (requestToken !== searchRequestToken) return;

        const types = pokemon.types.map(t => t.type.name);
        const displayTypes = types.map(capitalize);
        const artwork = pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default;
        const defensivePromise = getTypeEffectiveness(types);
        const offensivePromise = getOffensiveMatchups(types);
        const abilityDetailsPromise = getAbilityDetails(pokemon.abilities);
        const evolutionInfoPromise = getEvolutionInfo(pokemon.name, pokemon.species?.url);

        const [defensive, offensive, abilityDetails] = await Promise.all([
            defensivePromise,
            offensivePromise,
            abilityDetailsPromise
        ]);
        if (requestToken !== searchRequestToken) return;

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

        const abilityMarkup = abilityDetails.map(({ entry, description }) => `
            <div class="badge-tag ability-badge" data-tooltip="${escapeHtml(description)}">
                ${capitalize(entry.ability.name)}
                ${entry.is_hidden ? `<span>Hidden</span>` : ""}
            </div>
        `).join("");

        resultEl.innerHTML = `
            <article class="pokemon-card" data-search-token="${requestToken}">
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
                        <div class="card-row">
                            <section class="card-panel" data-section="evolution">
                                <h3>Evolution</h3>
                                <p class="encounter-empty">Loading evolution details...</p>
                            </section>
                        </div>
                    </div>
                </div>
            </article>
        `;

        highlightTypeCards(types);

        const evolutionInfo = await evolutionInfoPromise;
        if (requestToken !== searchRequestToken) return;

        const activeCard = resultEl.querySelector(`.pokemon-card[data-search-token="${requestToken}"]`);
        if (!activeCard) return;

        const evolutionSection = activeCard.querySelector('[data-section="evolution"]');

        if (evolutionSection) {
            evolutionSection.innerHTML = `
                <h3>Evolution</h3>
                ${evolutionInfo ? `
                    <div class="encounter-list">
                        ${evolutionInfo.evolvesTo.length ? evolutionInfo.evolvesTo.map(target => `
                            <div class="encounter-item">
                                <span>${escapeHtml(target.methods.join(" or "))} → ${escapeHtml(formatPokemonName(target.name))}</span>
                            </div>
                        `).join("") : `
                            <div class="encounter-item">
                                <span>This Pokémon does not evolve further.</span>
                            </div>
                        `}
                    </div>
                ` : `<p class="encounter-empty">Evolution details are currently unavailable.</p>`}
            `;
        }
    } catch (error) {
        if (requestToken !== searchRequestToken) return;
        resultEl.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

searchButton.addEventListener("click", searchPokemon);
input.addEventListener("input", event => {
    scheduleSuggestionUpdate(event.target.value);
});

resultEl.addEventListener("click", event => {
    const closeButton = event.target.closest(".close-result");
    if (!closeButton) return;
    searchRequestToken += 1;
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
        return `./Images/tera/tera-${key}.png`;
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
                    <img class="reference-title-icon" src="./Images/pokeball.png" alt="Pokéball">
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
                            <img src="./Images/Banners/normal-banner.png" alt="Normal banner">
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

function getAdventureCategoryMeta(category) {
    return objectiveCategoryMeta[category] || objectiveCategoryMeta.Gym;
}

function getAdventureObjectives() {
    return adventureGuide.filter(objective => adventureDisplayCategories.has(objective.category));
}

function getAdventureObjectiveById(id) {
    const objectives = getAdventureObjectives();
    return objectives.find(objective => objective.id === id) || objectives[0];
}

function getAdventureRoleLabel(category) {
    if (category === "Gym") return "Gym Leader";
    if (category === "Titan") return "Titan";
    return "Boss";
}

function getAdventureMarkerPosition(objective) {
    const objectiveId = Number(objective?.id);
    const geo = adventureMapGenieCoordsById[objectiveId];
    const offset = adventureMapGenieOffsetById[objectiveId] || { x: 0, y: 0 };
    const mapX = geo
        ? (((geo.lng - adventureMapGenieGeoBounds.minLng) / (adventureMapGenieGeoBounds.maxLng - adventureMapGenieGeoBounds.minLng)) * 100) + offset.x
        : Number(objective?.mapX ?? 0);
    const mapY = geo
        ? (((adventureMapGenieGeoBounds.maxLat - geo.lat) / (adventureMapGenieGeoBounds.maxLat - adventureMapGenieGeoBounds.minLat)) * 100) + offset.y
        : Number(objective?.mapY ?? 0);
    const x = adventureMapBounds.left + ((mapX / 100) * (adventureMapBounds.right - adventureMapBounds.left));
    const y = adventureMapBounds.top + ((mapY / 100) * (adventureMapBounds.bottom - adventureMapBounds.top));
    return {
        xPercent: Math.max(0, Math.min(100, x)),
        yPercent: Math.max(0, Math.min(100, y))
    };
}

function sizeAdventureMapInner() {
    const viewport = el("adventureMapViewport");
    const inner = el("adventureMapInner");
    if (!viewport || !inner) return null;

    const viewportRect = viewport.getBoundingClientRect();
    if (!viewportRect.width || !viewportRect.height) return null;

    const ratio = Number.isFinite(adventureMapAspectRatio) && adventureMapAspectRatio > 0
        ? adventureMapAspectRatio
        : 1;
    const widthFromViewport = viewportRect.width * adventureMapBaseZoom * adventureMapZoomLevel;
    const widthFromHeight = viewportRect.height * adventureMapBaseZoom * adventureMapZoomLevel * ratio;
    const targetWidth = Math.ceil(Math.max(widthFromViewport, widthFromHeight));
    const targetHeight = Math.ceil(targetWidth / ratio);

    inner.style.width = `${targetWidth}px`;
    inner.style.height = `${targetHeight}px`;

    return {
        innerWidth: targetWidth,
        innerHeight: targetHeight
    };
}

function setAdventureMapZoom(nextZoomLevel, options = {}) {
    const viewport = el("adventureMapViewport");
    const inner = el("adventureMapInner");
    if (!viewport || !inner) return;

    const clampedZoom = Math.max(adventureMapZoomMin, Math.min(adventureMapZoomMax, nextZoomLevel));
    if (Math.abs(clampedZoom - adventureMapZoomLevel) < 0.001) return;

    const currentState = adventureMapPositionState || applyAdventureMapTransform(0, 0);
    if (!currentState) return;

    const anchorX = Number.isFinite(options.anchorX) ? options.anchorX : viewport.clientWidth / 2;
    const anchorY = Number.isFinite(options.anchorY) ? options.anchorY : viewport.clientHeight / 2;
    const worldX = (anchorX - currentState.translateX) / currentState.innerWidth;
    const worldY = (anchorY - currentState.translateY) / currentState.innerHeight;

    adventureMapZoomLevel = clampedZoom;
    const resized = sizeAdventureMapInner();
    if (!resized) return;

    const nextX = anchorX - (worldX * resized.innerWidth);
    const nextY = anchorY - (worldY * resized.innerHeight);
    const nextState = applyAdventureMapTransform(nextX, nextY, { clamp: true });

    const zoomValueEl = el("adventureMapZoomValue");
    if (zoomValueEl) {
        zoomValueEl.textContent = `${Math.round(adventureMapZoomLevel * 100)}%`;
    }

    const selectedObjective = selectedAdventureObjectiveId ? getAdventureObjectiveById(selectedAdventureObjectiveId) : null;
    renderAdventureMapPopout(selectedObjective, nextState);
}

function updateAdventureZoomUi() {
    const zoomValueEl = el("adventureMapZoomValue");
    if (zoomValueEl) {
        zoomValueEl.textContent = `${Math.round(adventureMapZoomLevel * 100)}%`;
    }

    const zoomInBtn = el("adventureZoomIn");
    const zoomOutBtn = el("adventureZoomOut");
    if (zoomInBtn) zoomInBtn.disabled = adventureMapZoomLevel >= adventureMapZoomMax;
    if (zoomOutBtn) zoomOutBtn.disabled = adventureMapZoomLevel <= adventureMapZoomMin;
}

function syncAdventureMapAspectRatio() {
    const mapImage = document.querySelector(".adventure-map-base");
    if (!mapImage) return false;

    if (!mapImage.naturalWidth || !mapImage.naturalHeight) return false;

    const nextRatio = mapImage.naturalWidth / mapImage.naturalHeight;
    if (!Number.isFinite(nextRatio) || nextRatio <= 0) return false;

    adventureMapAspectRatio = nextRatio;
    return true;
}

function renderAdventureList() {
    const listEl = el("adventureObjectiveList");
    if (!listEl) return;

    const objectives = getAdventureObjectives();

    listEl.innerHTML = objectives.map(objective => {
        const meta = getAdventureCategoryMeta(objective.category);
        const isSelected = objective.id === selectedAdventureObjectiveId;
        const isCompleted = isAdventureObjectiveCompleted(objective.id);
        return `
            <article
                class="adventure-objective-card ${isSelected ? "selected" : ""} ${isCompleted ? "completed" : ""}"
                data-objective-id="${objective.id}"
                style="--objective-accent:${meta.color}">
                <div class="adventure-objective-order">${objective.id}</div>
                <div class="adventure-objective-content">
                    <div class="adventure-objective-name">${escapeHtml(objective.name)}</div>
                    <div class="adventure-objective-subline">
                        <span class="adventure-category-icon">${meta.icon}</span>
                        <span>${escapeHtml(objective.type)} ${escapeHtml(meta.shortLabel)}</span>
                    </div>
                    <div class="adventure-objective-level">Lv.${escapeHtml(objective.level)}</div>
                </div>
                <label class="adventure-progress-toggle" title="Mark objective complete">
                    <input
                        type="checkbox"
                        class="adventure-progress-checkbox"
                        data-objective-id="${objective.id}"
                        ${isCompleted ? "checked" : ""}
                        aria-label="Mark ${escapeHtml(objective.name)} complete">
                    <span class="adventure-progress-checkmark" aria-hidden="true"></span>
                </label>
            </article>
        `;
    }).join("");
}

function panAdventureMapTo(objective) {
    const viewport = el("adventureMapViewport");
    const inner = el("adventureMapInner");
    if (!viewport || !inner || !objective) return null;

    sizeAdventureMapInner();

    const viewportRect = viewport.getBoundingClientRect();
    const innerWidth = inner.offsetWidth;
    const innerHeight = inner.offsetHeight;
    const markerPosition = getAdventureMarkerPosition(objective);
    const markerX = (markerPosition.xPercent / 100) * innerWidth;
    const markerY = (markerPosition.yPercent / 100) * innerHeight;

    const rawX = (viewportRect.width / 2) - markerX;
    const rawY = (viewportRect.height / 2) - markerY;
    // Clamp selection pans so edge objectives never throw the map outside bounds.
    return applyAdventureMapTransform(rawX, rawY, { clamp: true });
}

function applyAdventureMapTransform(translateX, translateY, options = {}) {
    const viewport = el("adventureMapViewport");
    const inner = el("adventureMapInner");
    if (!viewport || !inner) return null;

    const { clamp = true } = options;

    const viewportRect = viewport.getBoundingClientRect();
    const innerWidth = inner.offsetWidth;
    const innerHeight = inner.offsetHeight;

    let nextX = translateX;
    let nextY = translateY;

    if (clamp) {
        // Allow limited overscroll so edge objectives can still center without losing the map.
        const overflowX = Math.min(viewportRect.width * 0.35, innerWidth * 0.2);
        const overflowY = Math.min(viewportRect.height * 0.35, innerHeight * 0.2);
        const minX = (viewportRect.width - innerWidth) - overflowX;
        const minY = (viewportRect.height - innerHeight) - overflowY;
        const maxX = overflowX;
        const maxY = overflowY;
        nextX = Math.min(maxX, Math.max(minX, translateX));
        nextY = Math.min(maxY, Math.max(minY, translateY));
    }

    inner.style.transform = `translate(${nextX}px, ${nextY}px)`;

    adventureMapPositionState = {
        translateX: nextX,
        translateY: nextY,
        innerWidth,
        innerHeight
    };

    return adventureMapPositionState;
}

function centerAdventureObjective(objective) {
    if (!objective) return;

    const centeredState = panAdventureMapTo(objective);
    renderAdventureMapPopout(objective, centeredState);
}

function renderAdventureMap() {
    const mapInner = el("adventureMapInner");
    if (!mapInner) return;

    const objectives = getAdventureObjectives();

    sizeAdventureMapInner();

    mapInner.innerHTML = `
        <img class="adventure-map-base" src="./Images/adventure/paldea.png" alt="Paldea map" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='./Images/maps/paldea-map.png'">
        <div class="adventure-map-watermark">PALDEA</div>
        ${objectives.map(objective => {
            const meta = getAdventureCategoryMeta(objective.category);
            const isSelected = objective.id === selectedAdventureObjectiveId;
            const isCompleted = isAdventureObjectiveCompleted(objective.id);
            const markerPosition = getAdventureMarkerPosition(objective);
            const typeIconUrl = getTypeIconUrl(objective.type);
            return `
                <button
                    type="button"
                    class="adventure-marker ${isSelected ? "selected" : ""} ${isCompleted ? "completed" : ""}"
                    data-objective-id="${objective.id}"
                    style="left:${markerPosition.xPercent}%;top:${markerPosition.yPercent}%;--marker-color:${meta.color}"
                    title="${escapeHtml(objective.name)}">
                    <span class="adventure-marker-dot">
                        <img class="adventure-marker-icon" src="${typeIconUrl}" alt="${escapeHtml(objective.type)} type icon">
                    </span>
                </button>
            `;
        }).join("")}
    `;

    const mapImage = mapInner.querySelector(".adventure-map-base");
    if (mapImage) {
        const applyImageSizing = () => {
            if (!syncAdventureMapAspectRatio()) return;
            sizeAdventureMapInner();
            if (selectedAdventureObjectiveId) {
                const selectedObjective = getAdventureObjectiveById(selectedAdventureObjectiveId);
                centerAdventureObjective(selectedObjective);
            }
        };

        if (mapImage.complete) {
            applyImageSizing();
        } else {
            mapImage.addEventListener("load", applyImageSizing, { once: true });
        }
    }

    if (!selectedAdventureObjectiveId) {
        renderAdventureMapPopout(null, null);
        return;
    }

    const selectedObjective = getAdventureObjectiveById(selectedAdventureObjectiveId);
    centerAdventureObjective(selectedObjective);
}

function renderAdventureMapPopout(objective, mapState) {
    const overlay = el("adventureMapOverlay");
    const viewport = el("adventureMapViewport");
    if (!overlay || !viewport) return;

    if (!objective) {
        delete overlay.dataset.objectiveId;
        overlay.innerHTML = "";
        return;
    }

    const meta = getAdventureCategoryMeta(objective.category);

    if (Number(overlay.dataset.objectiveId) !== Number(objective.id)) {
        overlay.dataset.objectiveId = String(objective.id);
        overlay.innerHTML = `
            <article class="adventure-marker-popout" style="--objective-accent:${meta.color}">
                <h3 class="adventure-marker-popout-title">${escapeHtml(objective.name)}</h3>
                <div class="adventure-marker-popout-badges">
                    <span class="badge-tag">${escapeHtml(objective.category)}</span>
                    <span class="badge-tag">${escapeHtml(objective.type)}</span>
                    <span class="badge-tag">Lv.${escapeHtml(objective.level)}</span>
                </div>
                <div class="adventure-marker-popout-weaknesses">
                    <h4>Weak Against</h4>
                    <div class="adventure-type-badge-row">${renderAdventureTypeBadges(objective.weaknesses)}</div>
                </div>
            </article>
        `;
    }

    const popout = overlay.querySelector(".adventure-marker-popout");
    if (!popout) return;

    const resolvedState = mapState || adventureMapPositionState;
    if (!resolvedState) return;

    const viewportRect = viewport.getBoundingClientRect();
    const markerPosition = getAdventureMarkerPosition(objective);
    const left = resolvedState.translateX + ((markerPosition.xPercent / 100) * resolvedState.innerWidth);
    const top = resolvedState.translateY + ((markerPosition.yPercent / 100) * resolvedState.innerHeight);

    popout.style.left = `${left}px`;
    popout.style.top = `${top}px`;
    popout.classList.remove("below");

    // Flip below marker if there is not enough room above.
    const popoutRect = popout.getBoundingClientRect();
    if (popoutRect.top < viewportRect.top + 8) {
        popout.classList.add("below");
    }

    const visibilityPad = 28;
    const markerVisible =
        left >= -visibilityPad &&
        left <= viewportRect.width + visibilityPad &&
        top >= -visibilityPad &&
        top <= viewportRect.height + visibilityPad;
    popout.classList.toggle("is-hidden", !markerVisible);
}

function renderAdventureTypeBadges(typeList) {
    if (!typeList || !typeList.length) {
        return `<span class="adventure-type-badge empty">None</span>`;
    }

    return typeList.map(type => `
        <span class="adventure-type-badge">
            <img src="${getTypeIconUrl(type)}" alt="${escapeHtml(type)} icon">
            <span>${escapeHtml(type)}</span>
        </span>
    `).join("");
}

function setupAdventureMapDragging() {
    const viewport = el("adventureMapViewport");
    const inner = el("adventureMapInner");
    if (!viewport || !inner) return;

    const onPointerDown = (event) => {
        if (event.button !== undefined && event.button !== 0) return;

        const current = adventureMapPositionState || applyAdventureMapTransform(0, 0);
        if (!current) return;

        adventureDragState = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            baseX: current.translateX,
            baseY: current.translateY,
            dragged: false,
            captured: false
        };
    };

    const onPointerMove = (event) => {
        if (!adventureDragState || event.pointerId !== adventureDragState.pointerId) return;

        const deltaX = event.clientX - adventureDragState.startX;
        const deltaY = event.clientY - adventureDragState.startY;

        if (!adventureDragState.dragged && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
            adventureDragState.dragged = true;
            if (!adventureDragState.captured) {
                adventureDragState.captured = true;
                inner.style.transition = "none";
                viewport.classList.add("dragging");
                viewport.setPointerCapture(event.pointerId);
            }
        }

        if (!adventureDragState.dragged) return;

        const nextState = applyAdventureMapTransform(adventureDragState.baseX + deltaX, adventureDragState.baseY + deltaY);
        if (nextState) {
            const objective = getAdventureObjectiveById(selectedAdventureObjectiveId);
            renderAdventureMapPopout(objective, nextState);
        }
    };

    const finishDrag = (event) => {
        if (!adventureDragState || event.pointerId !== adventureDragState.pointerId) return;

        if (adventureDragState.dragged) {
            adventureSuppressMarkerClick = true;
            setTimeout(() => { adventureSuppressMarkerClick = false; }, 0);
        }

        viewport.classList.remove("dragging");
        inner.style.transition = "";
        adventureDragState = null;

        if (event.pointerId !== undefined && viewport.hasPointerCapture(event.pointerId)) {
            viewport.releasePointerCapture(event.pointerId);
        }
    };

    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);
    viewport.addEventListener("dragstart", event => event.preventDefault());
}

function updateAdventureSelection(id) {
    if (!id) {
        selectedAdventureObjectiveId = null;
        document.querySelectorAll(".adventure-objective-card").forEach(card => card.classList.remove("selected"));
        document.querySelectorAll(".adventure-marker").forEach(marker => marker.classList.remove("selected"));
        renderAdventureMapPopout(null, null);
        return;
    }

    const objective = getAdventureObjectiveById(id);
    selectedAdventureObjectiveId = objective.id;

    document.querySelectorAll(".adventure-objective-card").forEach(card => {
        const cardId = Number(card.dataset.objectiveId);
        card.classList.toggle("selected", cardId === selectedAdventureObjectiveId);
    });

    document.querySelectorAll(".adventure-marker").forEach(marker => {
        const markerId = Number(marker.dataset.objectiveId);
        marker.classList.toggle("selected", markerId === selectedAdventureObjectiveId);
    });

    centerAdventureObjective(objective);

    const selectedCard = document.querySelector(`.adventure-objective-card[data-objective-id="${objective.id}"]`);
    if (selectedCard) {
        selectedCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
}

function renderAdventureGuidePage() {
    if (!pageContent) return;

    pageContent.innerHTML = `
        <section class="adventure-page">
            <header class="adventure-header">
                <h2>Adventure Guide</h2>
                <p>Follow the recommended order for completing Pokemon Scarlet & Violet. Select any objective to view its location, recommended level and battle information.</p>
            </header>

            <div class="adventure-layout">
                <aside class="adventure-column adventure-list-column">
                    <div id="adventureObjectiveList" class="adventure-objective-list"></div>
                </aside>

                <section class="adventure-column adventure-map-column">
                    <div class="adventure-map-zoom-controls" aria-label="Map zoom controls">
                        <button id="adventureZoomOut" type="button" class="adventure-map-zoom-btn" aria-label="Zoom out">-</button>
                        <span id="adventureMapZoomValue" class="adventure-map-zoom-value">100%</span>
                        <button id="adventureZoomIn" type="button" class="adventure-map-zoom-btn" aria-label="Zoom in">+</button>
                    </div>
                    <div id="adventureMapViewport" class="adventure-map-viewport">
                        <div id="adventureMapInner" class="adventure-map-inner"></div>
                    </div>
                    <div id="adventureMapOverlay" class="adventure-map-overlay"></div>
                </section>
            </div>
        </section>
    `;

    const firstObjectiveId = getAdventureObjectives()[0]?.id || null;
    selectedAdventureObjectiveId = getAdventureObjectiveById(selectedAdventureObjectiveId)?.id || firstObjectiveId;
    renderAdventureList();
    renderAdventureMap();

    const objectiveList = el("adventureObjectiveList");
    const mapInner = el("adventureMapInner");
    const zoomInBtn = el("adventureZoomIn");
    const zoomOutBtn = el("adventureZoomOut");
    const viewport = el("adventureMapViewport");

    if (objectiveList) {
        objectiveList.addEventListener("change", event => {
            const checkbox = event.target.closest(".adventure-progress-checkbox");
            if (!checkbox) return;
            setAdventureObjectiveCompleted(Number(checkbox.dataset.objectiveId), checkbox.checked);
        });

        objectiveList.addEventListener("click", event => {
            if (event.target.closest(".adventure-progress-toggle")) return;
            const card = event.target.closest(".adventure-objective-card");
            if (!card) return;
            updateAdventureSelection(Number(card.dataset.objectiveId));
        });
    }

    if (mapInner) {
        mapInner.addEventListener("click", event => {
            if (adventureSuppressMarkerClick) return;
            const marker = event.target.closest(".adventure-marker");
            if (!marker) {
                updateAdventureSelection(null);
                return;
            }
            updateAdventureSelection(Number(marker.dataset.objectiveId));
        });
    }

    if (zoomInBtn) {
        zoomInBtn.addEventListener("click", () => {
            setAdventureMapZoom(adventureMapZoomLevel + adventureMapZoomStep);
            updateAdventureZoomUi();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener("click", () => {
            setAdventureMapZoom(adventureMapZoomLevel - adventureMapZoomStep);
            updateAdventureZoomUi();
        });
    }

    if (viewport) {
        viewport.addEventListener("wheel", event => {
            event.preventDefault();
            const rect = viewport.getBoundingClientRect();
            const anchorX = event.clientX - rect.left;
            const anchorY = event.clientY - rect.top;
            const delta = event.deltaY < 0 ? adventureMapZoomStep : -adventureMapZoomStep;
            setAdventureMapZoom(adventureMapZoomLevel + delta, { anchorX, anchorY });
            updateAdventureZoomUi();
        }, { passive: false });
    }

    setupAdventureMapDragging();

    if (adventureResizeHandler) {
        window.removeEventListener("resize", adventureResizeHandler);
    }
    adventureResizeHandler = () => {
        sizeAdventureMapInner();
        const objective = getAdventureObjectiveById(selectedAdventureObjectiveId);
        centerAdventureObjective(objective);
    };
    window.addEventListener("resize", adventureResizeHandler);

    window.requestAnimationFrame(() => {
        const objective = getAdventureObjectiveById(selectedAdventureObjectiveId);
        centerAdventureObjective(objective);
        updateAdventureZoomUi();
    });
}

function setActivePage(page){
    const navButtons = Array.from(document.querySelectorAll('.main-nav .nav-item'));
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
    switch(page){
        case 'home': renderHomePage(); break;
        case 'pokemon': renderPokemonPage(); break;
        case 'tera': renderTeraCrystalPage(); break;
        case 'adventure': renderAdventureGuidePage(); break;
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
loadAdventureProgress();
loadPokemonList().catch(() => {
    // Keep core app pages usable even if remote API is unavailable.
});
setActivePage('reference');