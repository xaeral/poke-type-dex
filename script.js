const pokemonNames = [];
const pokemonDataCache = new Map();
const typeDataCache = new Map();
const abilityDataCache = new Map();
const speciesDataCache = new Map();
const evolutionChainCache = new Map();
const pokemonAvailabilityCache = new Map();
const availablePokemonCatalogCache = new Map();
const availablePokemonProgressCache = new Map();
const availablePokemonProgressState = new Map();
let searchRequestToken = 0;
let suggestionUpdateTimer = null;
let suggestionRequestToken = 0;
let coverageAnalysisToken = 0;
let availablePokemonLoadToken = 0;
let availableSearchUpdateTimer = null;
const suggestionDebounceMs = 80;
const availableSearchDebounceMs = 120;
const availableRenderBatchSize = 72;
const teamStorageKey = "teamPlannerTeamV1";
const availablePokemonState = {
    types: [],
    search: ""
};
const allTypes = [
    "normal","fire","water","electric","grass","ice",
    "fighting","poison","ground","flying","psychic",
    "bug","rock","ghost","dragon","dark","steel","fairy"
];

const FLYING_TYPE_COLOR = "#A98FF3";

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
        color: FLYING_TYPE_COLOR,
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
const gameSelect = document.getElementById("gameSelect");
const pageContent = document.getElementById("pageContent");
const team = Array.from({ length: 6 }, () => ({
    pokemon: null,
    types: [],
    sprite: "",
    game: ""
}));
const plannerGameOptions = [
    { key: "scarlet-violet", label: "Scarlet / Violet" },
    { key: "legends-arceus", label: "Legends Arceus" },
    { key: "sword-shield", label: "Sword / Shield" },
    { key: "brilliant-diamond-shining-pearl", label: "Brilliant Diamond / Shining Pearl" },
    { key: "lets-go-pikachu-eevee", label: "Let's Go Pikachu / Eevee" }
];
const plannerGameVersions = {
    "scarlet-violet": ["scarlet", "violet"],
    "legends-arceus": ["legends-arceus"],
    "sword-shield": ["sword", "shield"],
    "brilliant-diamond-shining-pearl": ["brilliant-diamond", "shining-pearl"],
    "lets-go-pikachu-eevee": ["lets-go-pikachu", "lets-go-eevee"]
};
const gamePokedexes = {
    "scarlet-violet": ["paldea", "kitakami", "blueberry"],
    "legends-arceus": ["hisui"],
    "sword-shield": ["galar", "isle-of-armor", "crown-tundra"],
    "brilliant-diamond-shining-pearl": ["sinnoh"],
    "lets-go-pikachu-eevee": ["kanto"]
};
const plannerState = {
    game: "scarlet-violet",
};
let currentPage = "reference";
let coverageHoverToken = 0;
let hoveredCoverageType = null;
let currentGame = localStorage.getItem("pokemonGame") || "scarlet-violet";

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

typeColorMap.flying = FLYING_TYPE_COLOR;

const typeStrongMap = types.reduce((map, type) => {
    map[type.name.toLowerCase()] = type.strong.map(target => String(target).toLowerCase());
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

function isTeamPlannerPage() {
    return currentPage === "team-planner";
}

function getCurrentPlannerSelectionLabel() {
    return "";
}

function getTypeColor(name) {
    return typeColorMap[String(name || "").toLowerCase()] || "#6b7280";
}

function getSuperEffectiveAgainst(types) {
    const targets = new Set();
    types.forEach(typeName => {
        (typeStrongMap[String(typeName || "").toLowerCase()] || []).forEach(target => {
            targets.add(target);
        });
    });
    return allTypes.filter(type => targets.has(type));
}

function isTypeSuperEffectiveAgainst(attackingType, defendingType) {
    return (typeStrongMap[String(attackingType || "").toLowerCase()] || []).includes(String(defendingType || "").toLowerCase());
}

function getGameVersions(gameKey) {
    return plannerGameVersions[gameKey] || [];
}

function getGamePokedexes(gameKey) {
    return gamePokedexes[gameKey] || [];
}

function getGameLabel(gameKey) {
    return plannerGameOptions.find(option => option.key === gameKey)?.label || gameKey;
}

function isScarletVioletGame(gameKey = currentGame) {
    return gameKey === "scarlet-violet";
}

function getDefaultPageForGame(gameKey = currentGame) {
    return isScarletVioletGame(gameKey) ? "adventure" : "reference";
}

function saveSelectedGame(gameKey) {
    localStorage.setItem("pokemonGame", gameKey);
}

function setGameSelectValue(gameKey) {
    if (gameSelect && gameSelect.value !== gameKey) {
        gameSelect.value = gameKey;
    }
}

function syncAdventureVisibility(gameKey = currentGame) {
    const adventureButton = document.querySelector('.main-nav .nav-item[data-page="adventure"]');
    if (adventureButton) {
        adventureButton.classList.toggle("hidden", !isScarletVioletGame(gameKey));
    }

    const teraButton = document.querySelector('.main-nav .nav-item[data-page="tera"]');
    if (teraButton) {
        teraButton.classList.toggle("hidden", !isScarletVioletGame(gameKey));
    }
}

function applyGameSelection(gameKey, options = {}) {
    const nextGame = gameKey || "scarlet-violet";
    currentGame = nextGame;
    plannerState.game = nextGame;
    saveSelectedGame(nextGame);
    setGameSelectValue(nextGame);
    syncAdventureVisibility(nextGame);
    if (options.rebuildPage !== false) {
        const desiredPage = getDefaultPageForGame(nextGame);
        if (!isScarletVioletGame(nextGame) && currentPage === "adventure") {
            setActivePage(desiredPage);
        }
    }
}

async function getPokemonData(name) {
    const key = normalize(name);
    if (pokemonDataCache.has(key)) return pokemonDataCache.get(key);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`);
    if (!response.ok) {
        throw new Error("Pokémon not found");
    }
    const data = await response.json();
    pokemonDataCache.set(key, data);
    return data;
}

function normalizeTeamMember(member) {
    if (!member || typeof member !== "object") return null;
    if (!member.pokemon) {
        return { pokemon: null, types: [], sprite: "", game: "", superEffectiveAgainst: [] };
    }

    const types = Array.isArray(member.types) ? member.types.filter(type => typeof type === "string") : [];
    const superEffectiveAgainst = Array.isArray(member.superEffectiveAgainst)
        ? member.superEffectiveAgainst.filter(type => typeof type === "string")
        : getSuperEffectiveAgainst(types);

    return {
        pokemon: typeof member.pokemon === "string" ? member.pokemon : null,
        types,
        sprite: typeof member.sprite === "string" ? member.sprite : "",
        game: typeof member.game === "string" ? member.game : "",
        superEffectiveAgainst
    };
}

function saveTeamPlannerState() {
    try {
        localStorage.setItem(teamStorageKey, JSON.stringify(team.map(normalizeTeamMember)));
        sessionStorage.setItem(teamStorageKey, JSON.stringify(team.map(normalizeTeamMember)));
    } catch {
        // Ignore storage failures and keep the planner functional.
    }
}

function loadTeamPlannerState() {
    try {
        const stored = localStorage.getItem(teamStorageKey) || sessionStorage.getItem(teamStorageKey);
        if (!stored) return;

        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed) || parsed.length !== team.length) return;

        parsed.forEach((member, index) => {
            const normalized = normalizeTeamMember(member);
            if (!normalized) return;
            team[index] = normalized;
        });
    } catch {
        // Ignore malformed storage and fall back to a blank team.
    }
}

async function getPokemonAvailability(name, gameKey) {
    const cacheKey = `${normalize(name)}::${gameKey}`;
    if (pokemonAvailabilityCache.has(cacheKey)) return pokemonAvailabilityCache.get(cacheKey);

    try {
        const pokemon = await getPokemonData(name);
        const species = await getSpeciesData(pokemon.species?.url);
        const allowedPokedexes = new Set(getGamePokedexes(gameKey));
        const available = Array.isArray(species?.pokedex_numbers) && species.pokedex_numbers.some(entry => allowedPokedexes.has(entry.pokedex?.name));
        pokemonAvailabilityCache.set(cacheKey, available);
        return available;
    } catch {
        pokemonAvailabilityCache.set(cacheKey, true);
        return true;
    }
}

async function getAvailablePokemonCatalog(gameKey) {
    const cacheKey = gameKey || currentGame;
    if (availablePokemonCatalogCache.has(cacheKey)) return availablePokemonCatalogCache.get(cacheKey);

    const promise = (async () => {
        const dexNames = getGamePokedexes(cacheKey);
        if (!dexNames.length) return [];

        const dexResponses = await Promise.all(dexNames.map(async dexName => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${dexName}`);
                if (!response.ok) return null;
                return await response.json();
            } catch {
                return null;
            }
        }));

        const orderedNames = [];
        const seen = new Set();
        dexResponses.forEach(data => {
            data?.pokemon_entries?.forEach(entry => {
                const speciesName = entry.pokemon_species?.name;
                if (!speciesName || seen.has(speciesName)) return;
                seen.add(speciesName);
                orderedNames.push(speciesName);
            });
        });

        const varietyNames = [];
        const varietySeen = new Set();
        const batchSize = 20;
        for (let index = 0; index < orderedNames.length; index += batchSize) {
            const batch = orderedNames.slice(index, index + batchSize);
            const batchResults = await Promise.all(batch.map(async name => {
                try {
                    const pokemon = await getPokemonData(name);
                    const species = await getSpeciesData(pokemon.species?.url);
                    const names = Array.isArray(species?.varieties) && species.varieties.length
                        ? species.varieties.map(variety => variety.pokemon?.name).filter(Boolean)
                        : [pokemon.name];
                    return names;
                } catch {
                    return [name];
                }
            }));

            batchResults.flat().forEach(name => {
                if (!name || varietySeen.has(name)) return;
                varietySeen.add(name);
                varietyNames.push(name);
            });
        }

        const catalog = [];
        for (let index = 0; index < varietyNames.length; index += batchSize) {
            const batch = varietyNames.slice(index, index + batchSize);
            const batchResults = await Promise.all(batch.map(async name => {
                try {
                    const pokemon = await getPokemonData(name);
                    return {
                        name: pokemon.name,
                        searchName: normalize(pokemon.name),
                        typeKeys: pokemon.types.map(entry => entry.type.name.toLowerCase()),
                        types: pokemon.types.map(entry => capitalize(entry.type.name)),
                        sprite: pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default || ""
                    };
                } catch {
                    return null;
                }
            }));

            catalog.push(...batchResults.filter(Boolean));
        }

        return catalog;
    })();

    availablePokemonCatalogCache.set(cacheKey, promise);
    return promise;
}

function getAvailablePokemonProgressState(gameKey) {
    const cacheKey = gameKey || currentGame;
    if (!availablePokemonProgressState.has(cacheKey)) {
        availablePokemonProgressState.set(cacheKey, {
            catalog: [],
            loading: false,
            promise: null,
            token: 0,
            lastRefreshAt: 0
        });
    }

    return availablePokemonProgressState.get(cacheKey);
}

async function getAvailablePokemonCatalogProgress(gameKey) {
    const cacheKey = gameKey || currentGame;
    if (availablePokemonProgressCache.has(cacheKey)) return availablePokemonProgressCache.get(cacheKey);

    const progressState = getAvailablePokemonProgressState(cacheKey);
    if (progressState.loading && progressState.promise) return progressState.promise;

    progressState.loading = true;
    progressState.lastRefreshAt = 0;
    progressState.token += 1;
    const runToken = progressState.token;

    const promise = (async () => {
        const dexNames = getGamePokedexes(cacheKey);
        if (!dexNames.length) return [];

        const dexResponses = await Promise.all(dexNames.map(async dexName => {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokedex/${dexName}`);
                if (!response.ok) return null;
                return await response.json();
            } catch {
                return null;
            }
        }));

        const orderedNames = [];
        const seen = new Set();
        dexResponses.forEach(data => {
            data?.pokemon_entries?.forEach(entry => {
                const speciesName = entry.pokemon_species?.name;
                if (!speciesName || seen.has(speciesName)) return;
                seen.add(speciesName);
                orderedNames.push(speciesName);
            });
        });

        const varietyNames = [];
        const varietySeen = new Set();
        const speciesBatchSize = 18;
        for (let index = 0; index < orderedNames.length; index += speciesBatchSize) {
            const batch = orderedNames.slice(index, index + speciesBatchSize);
            const batchResults = await Promise.all(batch.map(async name => {
                try {
                    const pokemon = await getPokemonData(name);
                    const species = await getSpeciesData(pokemon.species?.url);
                    const names = Array.isArray(species?.varieties) && species.varieties.length
                        ? species.varieties.map(variety => variety.pokemon?.name).filter(Boolean)
                        : [pokemon.name];
                    return names;
                } catch {
                    return [name];
                }
            }));

            batchResults.flat().forEach(name => {
                if (!name || varietySeen.has(name)) return;
                varietySeen.add(name);
                varietyNames.push(name);
            });
        }

        const catalog = [];
        const pokemonBatchSize = 12;
        for (let index = 0; index < varietyNames.length; index += pokemonBatchSize) {
            const batch = varietyNames.slice(index, index + pokemonBatchSize);
            const batchResults = await Promise.all(batch.map(async name => {
                try {
                    const pokemon = await getPokemonData(name);
                    return {
                        name: pokemon.name,
                        searchName: normalize(pokemon.name),
                        typeKeys: pokemon.types.map(entry => entry.type.name.toLowerCase()),
                        types: pokemon.types.map(entry => capitalize(entry.type.name)),
                        sprite: pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default || ""
                    };
                } catch {
                    return null;
                }
            }));

            const cleanBatch = batchResults.filter(Boolean);
            catalog.push(...cleanBatch);
            if (runToken === progressState.token && cleanBatch.length) {
                progressState.catalog = catalog.slice();
                const shouldRefresh = Date.now() - progressState.lastRefreshAt > 120 || index + pokemonBatchSize >= varietyNames.length;
                if (currentGame === cacheKey && shouldRefresh) {
                    progressState.lastRefreshAt = Date.now();
                    updateAvailablePokemonBrowser();
                }
            }
        }

        progressState.catalog = catalog.slice();
        progressState.loading = false;
        return catalog;
    })();

    progressState.promise = promise;
    availablePokemonProgressCache.set(cacheKey, promise);
    return promise;
}

function renderAvailablePokemonFilterChips() {
    const chips = [
        { key: "all", label: "All" },
        ...types.map(type => ({ key: type.name.toLowerCase(), label: type.name, color: type.color }))
    ];

    return chips.map(chip => {
        const active = chip.key === "all"
            ? availablePokemonState.types.length === 0
            : availablePokemonState.types.includes(chip.key);
        const style = chip.color ? `style="--chip-color:${chip.color};"` : "";
        return `<button type="button" class="available-filter-chip ${active ? "active" : ""}" data-type-filter="${chip.key}" ${style}>${chip.label}</button>`;
    }).join("");
}

function renderAvailablePokemonCard(entry) {
    const typesMarkup = entry.types.map(type => `<span class="available-pokemon-type" style="background:${getTypeColor(type)}">${type}</span>`).join("");
    return `
        <button type="button" class="available-pokemon-card" data-pokemon="${entry.name}" aria-label="Add ${formatPokemonName(entry.name)} to team">
            <div class="available-pokemon-art">
                <img src="${entry.sprite}" alt="${formatPokemonName(entry.name)} artwork" loading="lazy" decoding="async">
            </div>
            <div class="available-pokemon-name">${formatPokemonName(entry.name)}</div>
            <div class="available-pokemon-types">${typesMarkup}</div>
        </button>
    `;
}

function renderAvailablePokemonCardsInBatches(grid, entries, token) {
    grid.innerHTML = "";
    let index = 0;

    const paintNextBatch = () => {
        if (token !== availablePokemonLoadToken || !grid.isConnected) return;
        const batch = entries.slice(index, index + availableRenderBatchSize);
        if (!batch.length) return;

        grid.insertAdjacentHTML("beforeend", batch.map(renderAvailablePokemonCard).join(""));
        index += batch.length;

        if (index < entries.length) {
            window.requestAnimationFrame(paintNextBatch);
        }
    };

    paintNextBatch();
}

async function updateAvailablePokemonBrowser() {
    const grid = el("availablePokemonGrid");
    const count = el("availablePokemonCount");
    if (!grid || !count) return;

    const token = ++availablePokemonLoadToken;
    grid.innerHTML = `<div class="planner-loading">Loading available Pokémon...</div>`;
    count.textContent = "Loading...";

    const searchQuery = normalize(availablePokemonState.search);
    const selectedTypes = availablePokemonState.types;
    const progressState = getAvailablePokemonProgressState(currentGame);

    const renderCatalog = (catalog) => {
        if (token !== availablePokemonLoadToken || !grid.isConnected) return;

        const filtered = catalog.filter(entry => {
            const matchesName = !searchQuery || (entry.searchName || normalize(entry.name)).includes(searchQuery);
            const typeKeys = entry.typeKeys || entry.types.map(type => type.toLowerCase());
            const matchesTypes = selectedTypes.length === 0 || typeKeys.some(type => selectedTypes.includes(type));
            return matchesName && matchesTypes;
        });

        count.textContent = progressState.loading ? `${filtered.length}+ available` : `${filtered.length} available`;
        if (filtered.length) {
            renderAvailablePokemonCardsInBatches(grid, filtered, token);
            return;
        }

        grid.innerHTML = progressState.loading
            ? `<div class="planner-loading">Loading available Pokémon...</div>`
            : `<div class="planner-loading">No Pokémon match this type filter.</div>`;
    };

    renderCatalog(progressState.catalog);

    getAvailablePokemonCatalogProgress(currentGame).then(catalog => {
        progressState.catalog = catalog.slice();
        progressState.loading = false;
        renderCatalog(progressState.catalog);
    }).catch(() => {
        if (token === availablePokemonLoadToken && grid.isConnected) {
            progressState.loading = false;
            grid.innerHTML = `<div class="planner-loading">Failed to load available Pokémon.</div>`;
            count.textContent = "0 available";
        }
    });
}

function renderAvailablePokemonBrowser() {
    const browser = el("availablePokemonBrowser");
    if (!browser) return;

    browser.innerHTML = `
        <div class="section-header planner-section-header">
            <div>
                <h3>Available Pokémon</h3>
                <p>Browse the ${getGameLabel(currentGame)} dex and filter by type to find strong team options.</p>
            </div>
            <div id="availablePokemonCount" class="planner-active-target">Loading...</div>
        </div>
        <div class="available-pokemon-filter-note">Select one or more types to narrow the list.</div>
        <div class="available-pokemon-search-row">
            <input id="availablePokemonSearch" class="available-pokemon-search" type="search" placeholder="Search by name" value="${escapeHtml(availablePokemonState.search)}" aria-label="Search available Pokémon by name">
        </div>
        <div class="available-pokemon-filters">
            ${renderAvailablePokemonFilterChips()}
        </div>
        <div id="availablePokemonGrid" class="available-pokemon-grid"></div>
    `;

    const searchInput = el("availablePokemonSearch");
    if (searchInput) {
        searchInput.addEventListener("input", event => {
            const value = event.target.value || "";
            window.clearTimeout(availableSearchUpdateTimer);
            availableSearchUpdateTimer = window.setTimeout(() => {
                availablePokemonState.search = value;
                updateAvailablePokemonBrowser();
            }, availableSearchDebounceMs);
        });
    }

    browser.querySelectorAll(".available-filter-chip").forEach(button => {
        button.addEventListener("click", () => {
            const typeFilter = button.dataset.typeFilter || "all";
            if (typeFilter === "all") {
                availablePokemonState.types = [];
            } else if (availablePokemonState.types.includes(typeFilter)) {
                availablePokemonState.types = availablePokemonState.types.filter(type => type !== typeFilter);
            } else {
                availablePokemonState.types = [...availablePokemonState.types, typeFilter];
            }
            updateAvailablePokemonBrowser();
        });
    });

    const grid = el("availablePokemonGrid");
    if (grid) {
        grid.addEventListener("click", event => {
            const card = event.target.closest(".available-pokemon-card");
            if (!card) return;
            const name = normalize(card.dataset.pokemon);
            grid.querySelectorAll(".available-pokemon-card.selected").forEach(item => item.classList.remove("selected"));
            card.classList.add("selected");
            window.setTimeout(() => {
                card.classList.remove("selected");
            }, 260);
            addPokemon(name).catch(() => {});
        });
    }

    updateAvailablePokemonBrowser();
}

async function filterSuggestionsByGame(matches) {
    if (!currentGame) return matches.slice(0, 12);

    const candidates = matches.slice(0, 12);
    try {
        const results = await Promise.all(candidates.map(async item => ({
            item,
            available: await getPokemonAvailability(item.name, currentGame)
        })));
        const filtered = results.filter(result => result.available).map(result => result.item);
        return filtered.length ? filtered : candidates;
    } catch {
        return matches.slice(0, 12);
    }
}

function buildPokemonRecord(pokemon) {
    const types = pokemon.types.map(entry => capitalize(entry.type.name));
    return {
        pokemon: pokemon.name,
        types,
        superEffectiveAgainst: getSuperEffectiveAgainst(types),
        sprite: pokemon.sprites.other?.["official-artwork"]?.front_default || pokemon.sprites.front_default || "",
        game: plannerState.game
    };
}

function getCombinedMultiplier(lookup, types) {
    return types.reduce((total, type) => total * (lookup[String(type).toLowerCase()] || 1), 1);
}

function getMatchupSummary(multiplier, offense = true) {
    if (multiplier === 0) return offense ? "No Effect" : "Immune";
    if (multiplier > 1) return offense ? "Super Effective" : "Weak";
    if (multiplier < 1) return offense ? "Not Very Effective" : "Resists";
    return "Neutral";
}

function getMatchupVariant(multiplier) {
    if (multiplier === 0) return "immune";
    if (multiplier > 1) return "super";
    if (multiplier < 1) return "resist";
    return "neutral";
}

function renderStatBadge(label, value, variant) {
    return `<span class="planner-stat-badge planner-stat-${variant}">${label}<strong>${value}</strong></span>`;
}

function updateSuggestions(search) {
    const query = normalize(search);
    const token = ++suggestionRequestToken;

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
        .slice(0, 40);

    filterSuggestionsByGame(matches)
        .then(visibleMatches => {
            if (token !== suggestionRequestToken) return;

            suggestionBox.classList.remove("hidden");
            suggestionBox.innerHTML = visibleMatches.length
                ? visibleMatches.map(item => `<button type="button" class="suggestion-item">${capitalize(item.name)}</button>`).join("")
                : `<div class="suggestion-empty">No matches found</div>`;
            selectedSuggestionIndex = -1;
        })
        .catch(() => {
            if (token !== suggestionRequestToken) return;

            suggestionBox.classList.remove("hidden");
            suggestionBox.innerHTML = matches.slice(0, 12)
                .map(item => `<button type="button" class="suggestion-item">${capitalize(item.name)}</button>`)
                .join("");
            selectedSuggestionIndex = -1;
        });
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
    return getPokemonData(name);
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

function getSlotColors(types) {
    return {
        primary: getTypeColor(types[0] || "normal"),
        secondary: getTypeColor(types[1] || types[0] || "normal")
    };
}

function formatHoverTooltip(typeName, offenseValue, defenseValue) {
    const target = capitalize(typeName);
    if (defenseValue === 0) return `Immune to ${target}`;
    if (offenseValue > 1) return `Super Effective against ${target}`;
    if (defenseValue >= 4) return `4× Weak to ${target}`;
    if (defenseValue >= 2) return `Weak to ${target}`;
    if (defenseValue === 0.25) return `4× Resists ${target}`;
    if (defenseValue === 0.5) return `Resists ${target}`;
    return `Neutral against ${target}`;
}

function getHoverTier(offenseValue, defenseValue) {
    if (offenseValue > 1 && defenseValue <= 1) return "best";
    if (defenseValue === 0 || defenseValue === 0.25 || defenseValue === 0.5) return "best";
    if (defenseValue >= 4) return "very-poor";
    if (defenseValue >= 2 || offenseValue < 1) return "poor";
    return "neutral";
}

function getTeamSummary() {
    const weaknesses = new Map(allTypes.map(type => [type, new Set()]));
    const resistances = new Map(allTypes.map(type => [type, new Set()]));
    const immunities = new Map(allTypes.map(type => [type, new Set()]));

    return Promise.all(team.map(async member => {
        if (!member.pokemon) return null;
        const defense = await getTypeEffectiveness(member.types);
        return { name: capitalize(member.pokemon), defense };
    })).then(results => {
        results.forEach(result => {
            if (!result) return;
            Object.entries(result.defense).forEach(([type, value]) => {
                if (value === 0) {
                    immunities.get(type)?.add(result.name);
                } else if (value > 1) {
                    weaknesses.get(type)?.add(result.name);
                } else if (value < 1) {
                    resistances.get(type)?.add(result.name);
                }
            });
        });

        const toEntries = map => Array.from(map.entries())
            .filter(([, members]) => members.size >= 2)
            .map(([type, members]) => ({ type, members: Array.from(members) }));

        const toImmunityEntries = map => Array.from(map.entries())
            .filter(([, members]) => members.size > 0)
            .map(([type, members]) => ({ type, members: Array.from(members) }));

        return {
            weaknesses: toEntries(weaknesses),
            resistances: toEntries(resistances),
            immunities: toImmunityEntries(immunities)
        };
    });
}

function renderTypeBadgeList(typeEntries, emptyLabel = "None") {
    return typeEntries.length
        ? typeEntries.map(entry => {
            const tooltip = `${capitalize(entry.type)}: ${entry.members.join(", ")}`;
            return `<span class="team-summary-badge" data-tooltip="${escapeHtml(tooltip)}" aria-label="${escapeHtml(tooltip)}">${createTypeBadge(entry.type)}</span>`;
        }).join("")
        : `<span class="team-summary-empty">${emptyLabel}</span>`;
}

async function renderTeamSummary() {
    const summaryRoot = el("teamSummary");
    if (!summaryRoot) return;

    summaryRoot.innerHTML = `<div class="planner-loading">Calculating team summary...</div>`;
    const summary = await getTeamSummary();
    if (!summaryRoot.isConnected) return;

    summaryRoot.innerHTML = `
        <article class="summary-card">
            <div class="summary-card-header">
                <h4>Team Weaknesses</h4>
            </div>
            <div class="summary-badges">${renderTypeBadgeList(summary.weaknesses, "— None —")}</div>
        </article>
        <article class="summary-card">
            <div class="summary-card-header">
                <h4>Team Resistances</h4>
            </div>
            <div class="summary-badges">${renderTypeBadgeList(summary.resistances, "— None —")}</div>
        </article>
        <article class="summary-card">
            <div class="summary-card-header">
                <h4>Team Immunities</h4>
            </div>
            <div class="summary-badges">${renderTypeBadgeList(summary.immunities, "— None —")}</div>
        </article>
    `;
}

function clearCoverageHover() {
    hoveredCoverageType = null;
    document.querySelectorAll(".team-slot").forEach(card => {
        card.classList.remove("coverage-best", "coverage-poor", "coverage-very-poor");
        card.removeAttribute("data-tooltip");
    });
    syncCoverageTypeHighlights();
}

function syncCoverageTypeHighlights(typeName = hoveredCoverageType) {
    const hoveredType = String(typeName || "").toLowerCase();
    const hasHoveredType = Boolean(hoveredType);

    document.querySelectorAll(".team-slot").forEach((card, index) => {
        const member = team[index];
        const typeBadges = card.querySelectorAll(".team-slot-type[data-team-type]");
        const superEffectiveAgainst = Array.isArray(member?.superEffectiveAgainst)
            ? member.superEffectiveAgainst
            : getSuperEffectiveAgainst(member?.types || []);
        const canDefeatHoveredType = hasHoveredType && Boolean(member?.pokemon) && superEffectiveAgainst.includes(hoveredType);

        card.classList.toggle("coverage-muted", hasHoveredType && Boolean(member?.pokemon) && !canDefeatHoveredType);

        typeBadges.forEach(badge => {
            badge.classList.remove("coverage-effective", "coverage-ineffective");

            if (!canDefeatHoveredType) return;

            const badgeType = badge.dataset.teamType;
            badge.classList.add(isTypeSuperEffectiveAgainst(badgeType, hoveredType) ? "coverage-effective" : "coverage-ineffective");
        });
    });
}

async function applyCoverageHover(typeName) {
    hoveredCoverageType = typeName;
    const token = ++coverageHoverToken;
    const activeMembers = team.map(async member => {
        if (!member.pokemon) return null;
        return {
            name: member.pokemon,
            offenseValue: (Array.isArray(member.superEffectiveAgainst) ? member.superEffectiveAgainst : getSuperEffectiveAgainst(member.types || [])).includes(typeName) ? 2 : 0
        };
    });

    const results = await Promise.all(activeMembers);
    if (token !== coverageHoverToken) return;

    const cards = Array.from(document.querySelectorAll(".team-slot"));
    cards.forEach(card => {
        card.classList.remove("coverage-best", "coverage-poor", "coverage-very-poor");
        card.removeAttribute("data-tooltip");
    });

    results.forEach((result, index) => {
        const card = cards[index];
        if (!card || !result) return;

        if (result.offenseValue > 1) {
            card.classList.add("coverage-best");
        }
    });

    syncCoverageTypeHighlights(typeName);
}

async function getPlannerPokemon(name) {
    const pokemon = await getPokemonData(name);
    return buildPokemonRecord(pokemon);
}

function renderTeam() {
    const grid = el("teamGrid");
    if (!grid) return;

    grid.innerHTML = team.map((member, index) => {
        const types = member.types || [];
        const { primary, secondary } = getSlotColors(types);
        const slotClass = ["team-slot", member.pokemon ? "filled" : "empty"].join(" ");
        const typeBadges = types.length
            ? types.map(type => `<span class="team-slot-type" data-team-type="${type}" style="background:${getTypeColor(type)}">${type}</span>`).join("")
            : `<span class="team-slot-type muted">No types</span>`;
        const label = member.pokemon ? `Remove ${capitalize(member.pokemon)} from team` : `Empty slot ${index + 1}`;

        return `
            <article class="${slotClass}" data-slot-index="${index}">
                <button class="team-slot-body" type="button" data-action="choose-slot" aria-label="${label}">
                    <div class="team-slot-figure">
                        <div class="team-slot-ball-shell ${member.pokemon ? "filled" : "empty"}" style="--primary-color:${primary}; --secondary-color:${secondary};">
                            <div class="team-slot-ball-surface" aria-hidden="true">
                                <span class="team-slot-half top" style="background-color:${primary};background-image:none;"></span>
                                <span class="team-slot-half bottom" style="background-color:${secondary};background-image:none;"></span>
                                <span class="team-slot-band"></span>
                                <span class="team-slot-center-button">${member.pokemon ? "" : "+"}</span>
                            </div>
                            ${member.sprite ? `<img class="team-slot-sprite" src="${member.sprite}" alt="${capitalize(member.pokemon)} artwork">` : ""}
                        </div>
                        ${member.pokemon ? "" : `<div class="team-slot-plus">Empty Slot</div>`}
                    </div>
                    <div class="team-slot-info">
                        <div class="team-slot-name">${member.pokemon ? capitalize(member.pokemon) : "Empty Slot"}</div>
                        <div class="team-slot-types">${typeBadges}</div>
                    </div>
                </button>
                <div class="team-slot-actions">
                    <button type="button" class="team-slot-action ghost" data-action="remove-slot" ${member.pokemon ? "" : "disabled"}>Remove Pokémon</button>
                </div>
            </article>
        `;
    }).join("");

    grid.querySelectorAll("[data-action='choose-slot']").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.closest("[data-slot-index]")?.dataset.slotIndex);
            if (team[index]?.pokemon) {
                removePokemon(index);
            }
        });
    });

    grid.querySelectorAll("[data-action='remove-slot']").forEach(button => {
        button.addEventListener("click", () => {
            const index = Number(button.closest("[data-slot-index]")?.dataset.slotIndex);
            removePokemon(index);
        });
    });

    syncCoverageTypeHighlights();

}

async function calculateCoverage() {
    const coverage = Object.fromEntries(allTypes.map(type => [type, {
        superEffective: 0,
        neutral: 0,
        notVeryEffective: 0,
        noEffect: 0
    }]));

    const activeMembers = team.filter(member => member.pokemon);
    activeMembers.forEach(member => {
        const superEffectiveAgainst = Array.isArray(member.superEffectiveAgainst)
            ? member.superEffectiveAgainst
            : getSuperEffectiveAgainst(member.types || []);
        allTypes.forEach(type => {
            if (superEffectiveAgainst.includes(type)) {
                coverage[type].superEffective += 1;
            } else {
                coverage[type].neutral += 1;
            }
        });
    });

    return coverage;
}

async function renderCoverage() {
    const coverageGrid = el("coverageGrid");
    if (!coverageGrid) return;

    const token = ++coverageAnalysisToken;
    coverageGrid.innerHTML = `<div class="planner-loading">Calculating coverage...</div>`;

    const coverage = await calculateCoverage();
    if (token !== coverageAnalysisToken) return;

    coverageGrid.innerHTML = types.map(type => {
        const key = type.name.toLowerCase();
        const stats = coverage[key] || { superEffective: 0, neutral: 0, notVeryEffective: 0, noEffect: 0 };
        return `
            <article class="coverage-card" data-coverage-type="${key}">
                <div class="coverage-card-header">
                    <span class="coverage-type" style="background:${type.color}">${type.name}</span>
                    <span class="coverage-count">${stats.superEffective}</span>
                </div>
            </article>
        `;
    }).join("");

    coverageGrid.querySelectorAll(".coverage-card").forEach(card => {
        const typeName = card.dataset.coverageType;
        card.addEventListener("mouseenter", () => applyCoverageHover(typeName));
        card.addEventListener("mouseleave", () => clearCoverageHover());
    });
}

function schedulePlannerRefresh() {
    renderCoverage();
    renderTeamSummary();
}

function scrollToAvailablePokemonBrowser() {
    const browser = el("availablePokemonBrowser");
    if (!browser) return;
    browser.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function addPokemon(name, slotIndex) {
    const pokemon = await getPlannerPokemon(name);
    const index = Number.isInteger(slotIndex) ? slotIndex : team.findIndex(member => !member.pokemon);
    if (index < 0 || index >= team.length) return;
    team[index] = pokemon;
    saveTeamPlannerState();
    input.value = "";
    suggestionBox.classList.add("hidden");
    suggestionBox.innerHTML = "";
    selectedSuggestionIndex = -1;
    scheduleSuggestionUpdate("");
    renderTeam();
    schedulePlannerRefresh();
    if (isTeamPlannerPage()) {
        window.requestAnimationFrame(() => {
            scrollToAvailablePokemonBrowser();
        });
    }
}

function removePokemon(slotIndex) {
    if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= team.length) return;
    team[slotIndex] = {
        pokemon: null,
        types: [],
        sprite: "",
        game: ""
    };
    saveTeamPlannerState();
    input.value = "";
    suggestionBox.classList.add("hidden");
    suggestionBox.innerHTML = "";
    selectedSuggestionIndex = -1;
    scheduleSuggestionUpdate("");
    renderTeam();
    schedulePlannerRefresh();
}

function renderTeamPlannerPage() {
    if (!pageContent) return;

    pageContent.innerHTML = `
        <section class="team-planner-page">
            <div id="teamSummary" class="summary-grid team-summary-inline"></div>

            <section class="team-planner-section">
                <div class="section-header planner-section-header">
                    <div>
                        <h3>Team Builder</h3>
                        <p>Click a Pokémon below to add it to the first open slot.</p>
                    </div>
                </div>
                <div id="teamGrid" class="team-grid"></div>
            </section>

            <section class="team-planner-section">
                <div class="section-header planner-section-header">
                    <div>
                        <h3>Coverage Analysis</h3>
                        <p>Type coverage from the current team.</p>
                    </div>
                </div>
                <div id="coverageGrid" class="coverage-grid"></div>
            </section>

            <section class="team-planner-section available-pokemon-browser" id="availablePokemonBrowser"></section>
        </section>
    `;

    renderTeam();
    schedulePlannerRefresh();
    renderAvailablePokemonBrowser();
    scheduleSuggestionUpdate(input.value);
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
        const pokemon = await getPokemonData(name);
        const available = await getPokemonAvailability(name, currentGame);
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
        const gameAvailabilityNote = available ? "" : `<div class="search-note">This Pokémon is not listed in the selected game's dex.</div>`;

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
                        ${gameAvailabilityNote}
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

searchButton.addEventListener("click", async () => {
    await submitSearchAction();
});
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
        event.preventDefault();
        if (selectedSuggestionIndex >= 0) {
            const selected = items[selectedSuggestionIndex];
            if (selected) {
                input.value = selected.textContent;
                suggestionBox.classList.add("hidden");
                suggestionBox.innerHTML = "";
                selectedSuggestionIndex = -1;
                submitSearchAction();
            }
        } else {
            submitSearchAction();
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

async function submitSearchAction() {
    const value = normalize(input.value);
    if (!value) {
        input.focus();
        return;
    }

    searchPokemon();
}

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
    currentPage = page;
    const navButtons = Array.from(document.querySelectorAll('.main-nav .nav-item'));
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.page === page));
    switch(page){
        case 'home': renderHomePage(); break;
        case 'pokemon': renderPokemonPage(); break;
        case 'tera': renderTeraCrystalPage(); break;
        case 'adventure': renderAdventureGuidePage(); break;
        case 'matchups': renderTypeMatchupsPage(); break;
        case 'reference': renderTypeReferencePage(); break;
        case 'team-planner': renderTeamPlannerPage(); break;
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
loadTeamPlannerState();
window.addEventListener("beforeunload", saveTeamPlannerState);
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
        saveTeamPlannerState();
    }
});
applyGameSelection(currentGame, { rebuildPage: false });
if (gameSelect) {
    gameSelect.addEventListener("change", event => {
        applyGameSelection(event.target.value);
        scheduleSuggestionUpdate(input.value);
        if (currentPage === "team-planner") {
            renderTeamPlannerPage();
        } else {
            setActivePage(getDefaultPageForGame(currentGame));
        }
    });
}
loadPokemonList().catch(() => {
    // Keep core app pages usable even if remote API is unavailable.
});
setActivePage(getDefaultPageForGame(currentGame));