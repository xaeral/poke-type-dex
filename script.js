let pokemonNames = [];

async function loadPokemonList() {

    const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=2000"
    );

    const data = await response.json();

    pokemonNames = data.results.map(p => p.name);

    updateSuggestions("");
}

loadPokemonList();

function updateSuggestions(search) {

    const list = document.getElementById("pokemonList");

    list.innerHTML = "";

    pokemonNames
        .filter(name => name.includes(search))
        .slice(0,20)
        .forEach(name => {

            const option = document.createElement("option");

            option.value = name;

            list.appendChild(option);

        });

}

document
.getElementById("pokemonInput")
.addEventListener("input", e => {

    updateSuggestions(
        e.target.value.toLowerCase()
    );

});

const types = [

const pokemonTypes = pokemon.types.map(t => t.type.name);

const effectiveness = await getTypeEffectiveness(pokemonTypes);

const weak = [];
const resist = [];
const immune = [];

for (const [type, value] of Object.entries(effectiveness)) {

    if (value === 4)
        weak.push(`${type} ×4`);

    else if (value === 2)
        weak.push(`${type} ×2`);

    else if (value === 0.25)
        resist.push(`${type} ×¼`);

    else if (value === 0.5)
        resist.push(`${type} ×½`);

    else if (value === 0)
        immune.push(type);

}

{
name:"Normal",
color:"#A8A77A",
weak:["Fighting"],
resist:[],
immune:["Ghost"],
strong:[],
weakAttack:["Rock","Steel"],
noEffect:["Ghost"]
},

{
name:"Fire",
color:"#EE8130",
weak:["Water","Ground","Rock"],
resist:["Fire","Grass","Ice","Bug","Steel","Fairy"],
immune:[],
strong:["Grass","Ice","Bug","Steel"],
weakAttack:["Fire","Water","Rock","Dragon"],
noEffect:[]
},

{
name:"Water",
color:"#6390F0",
weak:["Electric","Grass"],
resist:["Fire","Water","Ice","Steel"],
immune:[],
strong:["Fire","Ground","Rock"],
weakAttack:["Water","Grass","Dragon"],
noEffect:[]
},

{
name:"Electric",
color:"#F7D02C",
weak:["Ground"],
resist:["Electric","Flying","Steel"],
immune:[],
strong:["Water","Flying"],
weakAttack:["Electric","Grass","Dragon"],
noEffect:["Ground"]
},

{
name:"Grass",
color:"#7AC74C",
weak:["Fire","Ice","Poison","Flying","Bug"],
resist:["Water","Electric","Grass","Ground"],
immune:[],
strong:["Water","Ground","Rock"],
weakAttack:["Fire","Grass","Poison","Flying","Bug","Dragon","Steel"],
noEffect:[]
},

{
name:"Ice",
color:"#96D9D6",
weak:["Fire","Fighting","Rock","Steel"],
resist:["Ice"],
immune:[],
strong:["Grass","Ground","Flying","Dragon"],
weakAttack:["Fire","Water","Ice","Steel"],
noEffect:[]
},

{
name:"Fighting",
color:"#C22E28",
weak:["Flying","Psychic","Fairy"],
resist:["Bug","Rock","Dark"],
immune:[],
strong:["Normal","Ice","Rock","Dark","Steel"],
weakAttack:["Poison","Flying","Psychic","Bug","Fairy"],
noEffect:["Ghost"]
},

{
name:"Poison",
color:"#A33EA1",
weak:["Ground","Psychic"],
resist:["Grass","Fighting","Poison","Bug","Fairy"],
immune:[],
strong:["Grass","Fairy"],
weakAttack:["Poison","Ground","Rock","Ghost"],
noEffect:["Steel"]
},

{
name:"Ground",
color:"#E2BF65",
weak:["Water","Grass","Ice"],
resist:["Poison","Rock"],
immune:["Electric"],
strong:["Fire","Electric","Poison","Rock","Steel"],
weakAttack:["Grass","Bug"],
noEffect:["Flying"]
},

{
name:"Flying",
color:"#A98FF3",
weak:["Electric","Ice","Rock"],
resist:["Grass","Fighting","Bug"],
immune:["Ground"],
strong:["Grass","Fighting","Bug"],
weakAttack:["Electric","Rock","Steel"],
noEffect:[]
},

{
name:"Psychic",
color:"#F95587",
weak:["Bug","Ghost","Dark"],
resist:["Fighting","Psychic"],
immune:[],
strong:["Fighting","Poison"],
weakAttack:["Psychic","Steel"],
noEffect:["Dark"]
},

{
name:"Bug",
color:"#A6B91A",
weak:["Fire","Flying","Rock"],
resist:["Grass","Fighting","Ground"],
immune:[],
strong:["Grass","Psychic","Dark"],
weakAttack:["Fire","Fighting","Poison","Flying","Ghost","Steel","Fairy"],
noEffect:[]
},

{
name:"Rock",
color:"#B6A136",
weak:["Water","Grass","Fighting","Ground","Steel"],
resist:["Normal","Fire","Poison","Flying"],
immune:[],
strong:["Fire","Ice","Flying","Bug"],
weakAttack:["Fighting","Ground","Steel"],
noEffect:[]
},

{
name:"Ghost",
color:"#735797",
weak:["Ghost","Dark"],
resist:["Poison","Bug"],
immune:["Normal","Fighting"],
strong:["Psychic","Ghost"],
weakAttack:["Dark"],
noEffect:["Normal"]
},

{
name:"Dragon",
color:"#6F35FC",
weak:["Ice","Dragon","Fairy"],
resist:["Fire","Water","Electric","Grass"],
immune:[],
strong:["Dragon"],
weakAttack:["Steel"],
noEffect:["Fairy"]
},

{
name:"Dark",
color:"#705746",
weak:["Fighting","Bug","Fairy"],
resist:["Ghost","Dark"],
immune:["Psychic"],
strong:["Psychic","Ghost"],
weakAttack:["Fighting","Dark","Fairy"],
noEffect:[]
},

{
name:"Steel",
color:"#B7B7CE",
weak:["Fire","Fighting","Ground"],
resist:["Normal","Grass","Ice","Flying","Psychic","Bug","Rock","Dragon","Steel","Fairy"],
immune:["Poison"],
strong:["Ice","Rock","Fairy"],
weakAttack:["Fire","Water","Electric","Steel"],
noEffect:[]
},

{
name:"Fairy",
color:"#D685AD",
weak:["Poison","Steel"],
resist:["Fighting","Bug","Dark"],
immune:["Dragon"],
strong:["Fighting","Dragon","Dark"],
weakAttack:["Fire","Poison","Steel"],
noEffect:[]
}

];

const grid=document.getElementById("typeGrid");

function createCard(type){

const card=document.createElement("div");

card.className="type-card";

card.innerHTML=`

<div class="header" style="background:${type.color}">
${type.name}
</div>

<div class="content">

<h4>Weak Against</h4>

<div class="badges">

${type.weak.map(x=>`<div class="badge">${x}</div>`).join("")}

</div>

<h4>Resists</h4>

<div class="badges">

${type.resist.map(x=>`<div class="badge">${x}</div>`).join("")}

</div>

<h4>Immune To</h4>

<div class="badges">

${type.immune.length?type.immune.map(x=>`<div class="badge">${x}</div>`).join(""):"None"}

</div>

<h4>Super Effective Against</h4>

<div class="badges">

${type.strong.map(x=>`<div class="badge">${x}</div>`).join("")}

</div>

<h4>Not Very Effective Against</h4>

<div class="badges">

${type.weakAttack.map(x=>`<div class="badge">${x}</div>`).join("")}

</div>

<h4>No Effect Against</h4>

<div class="badges">

${type.noEffect.length?type.noEffect.map(x=>`<div class="badge">${x}</div>`).join(""):"None"}

</div>

</div>

`;

card.onclick=()=>{

document.querySelectorAll(".type-card").forEach(c=>{

if(c!==card)
c.classList.remove("active");

});

card.classList.toggle("active");

};

grid.appendChild(card);

}

types.forEach(createCard);

async function searchPokemon() {

    const name = document
        .getElementById("pokemonInput")
        .value
        .trim()
        .toLowerCase();

    if (!name) return;

    try {

        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${name}`
        );

        if (!response.ok) {
            alert("Pokémon not found.");
            return;
        }

        const pokemon = await response.json();

        document.getElementById("result").innerHTML = `

<div class="card">

<h2>${pokemon.name.toUpperCase()}</h2>

<img
    src="${pokemon.sprites.other["official-artwork"].front_default}"
    width="220">

<p>
<strong>Type:</strong>
${pokemonTypes.join(" / ")}
</p>

<h3>Weaknesses</h3>

<div class="badges">
${weak.map(t=>`<div class="badge">${t}</div>`).join("")}
</div>

<h3>Resistances</h3>

<div class="badges">
${resist.map(t=>`<div class="badge">${t}</div>`).join("")}
</div>

<h3>Immunities</h3>

<div class="badges">
${immune.length
? immune.map(t=>`<div class="badge">${t}</div>`).join("")
: "None"}
</div>

</div>

`;

    }
    catch(err){

        console.error(err);

    }

}

document.getElementById("pokemonInput").addEventListener("keydown", function(e){

    if(e.key === "Enter"){

        searchPokemon();

    }

});

async function getTypeEffectiveness(types) {

    const effectiveness = {};

    const allTypes = [
        "normal","fire","water","electric","grass","ice",
        "fighting","poison","ground","flying","psychic",
        "bug","rock","ghost","dragon","dark","steel","fairy"
    ];

    allTypes.forEach(type => effectiveness[type] = 1);

    for (const type of types) {

        const response = await fetch(
            `https://pokeapi.co/api/v2/type/${type}`
        );

        const data = await response.json();

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