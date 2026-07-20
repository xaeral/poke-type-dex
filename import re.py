import re
import requests
from bs4 import BeautifulSoup

URLS = [
    "https://www.serebii.net/scarletviolet/paldeapokedex.shtml",
    "https://www.serebii.net/scarletviolet/kitakamipokedex.shtml",
    "https://www.serebii.net/scarletviolet/blueberrypokedex.shtml",
]

pokemon = []
seen = set()

for url in URLS:
    print(f"Reading {url}")
    html = requests.get(url, headers={
        "User-Agent": "Mozilla/5.0"
    }).text

    soup = BeautifulSoup(html, "html.parser")

    # Find links to Pokémon pages
    for link in soup.find_all("a", href=True):
        href = link["href"]

        if "/pokedex-sv/" in href:
            name = link.get_text(strip=True)

            # Ignore empty values and Pokédex numbers
            if (
                name
                and not re.fullmatch(r"#?\d+", name)
                and len(name) > 1
            ):
                if name not in seen:
                    seen.add(name)
                    pokemon.append(name)

with open("Pokemon_SV_All_Pokemon.txt", "w", encoding="utf-8") as f:
    for name in pokemon:
        f.write(name + "\n")

print(f"Done! {len(pokemon)} Pokémon saved.")