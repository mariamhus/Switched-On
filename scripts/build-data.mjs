import { readFile, writeFile } from "node:fs/promises";

const SOURCE = "https://raw.githubusercontent.com/owid/energy-data/master/owid-energy-data.csv";
const PEER_YEAR = 2024;
const PEERS = [
  ["Egypt", "Egypt"],
  ["Morocco", "Morocco"],
  ["Algeria", "Algeria"],
  ["Tunisia", "Tunisia"],
  ["Jordan", "Jordan"],
  ["Turkey", "Türkiye"],
  ["South Africa", "South Africa"],
  ["Africa", "Africa (average)"],
  ["World", "World (average)"],
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") field += char;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows;
  return body.filter((cells) => cells.length === header.length).map((cells) => Object.fromEntries(header.map((key, index) => [key, cells[index]])));
}

const num = (value, digits = 2) => {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(digits)) : null;
};

const local = process.argv[2];
const text = local ? await readFile(local, "utf8") : await (await fetch(SOURCE)).text();
const rows = parseCsv(text);

const egypt = rows
  .filter((row) => row.country === "Egypt" && Number(row.year) >= 1965)
  .map((row) => ({
    year: Number(row.year),
    population: num(row.population, 0),
    total: num(row.electricity_generation),
    gas: num(row.gas_electricity),
    oil: num(row.oil_electricity),
    hydro: num(row.hydro_electricity),
    solar: num(row.solar_electricity),
    wind: num(row.wind_electricity),
    perCapita: num(row.per_capita_electricity, 0),
    carbonIntensity: num(row.carbon_intensity_elec, 0),
  }))
  .filter((row) => row.hydro !== null)
  .sort((a, b) => a.year - b.year);

const peers = PEERS.map(([country, label]) => {
  const row = rows.find((entry) => entry.country === country && Number(entry.year) === PEER_YEAR);
  if (!row) throw new Error(`Missing ${country} ${PEER_YEAR}`);
  return {
    id: country.toLowerCase().replace(/\s+/g, "-"),
    label,
    perCapita: num(row.per_capita_electricity, 0),
    renewables: num(row.renewables_share_elec, 1),
    gas: num(row.gas_share_elec, 1),
  };
});

const output = {
  source: "Our World in Data, Energy dataset (Ember and Energy Institute Statistical Review of World Energy)",
  sourceUrl: "https://github.com/owid/energy-data",
  peerYear: PEER_YEAR,
  egypt,
  peers,
};

await writeFile(new URL("../src/data/energy.json", import.meta.url), `${JSON.stringify(output)}\n`);
console.log(`Egypt ${egypt[0].year}-${egypt.at(-1).year}, ${peers.length} peers`);
