import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { JUDET_CSV_CODES } from "./judete.js";
import { JUDET_BAC_FILES } from "./judete.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/api/licee/:an/:judet/:media", (req, res) => {
  const { an, judet, media } = req.params;
  const judetDecodat = decodeURIComponent(judet);
  const cod = JUDET_CSV_CODES[judetDecodat];

  if (!cod) {
    return res.status(400).json({ error: "Judetul nu este suportat." });
  }

  const mediaNum = parseFloat(media);
  if (isNaN(mediaNum)) {
    return res.status(400).json({ error: "Media este invalida." });
  }

  const filePath = path.resolve(__dirname, `cache/${an}/${cod}.json`);
  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({
        error: `Datele pentru anul ${an} nu sunt disponibile pentru acest judet.`,
      });
  }

  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    const licee = JSON.parse(rawData);

    const rezultate = licee.filter((item) => {
      return (
        typeof item.medieAdmitere === "number" && item.medieAdmitere <= mediaNum
      );
    });

    res.json(rezultate);
  } catch (err) {
    console.error(`Eroare la citirea fisierului ${filePath}:`, err.message);
    res
      .status(500)
      .json({ error: "Eroare interna la citirea fisierului cache." });
  }
});

app.use("/cache", express.static(path.join(__dirname, "cache")));

app.get("/api/bac/:judet", (req, res) => {
  const cod = req.params.judet.toUpperCase();
  const numeJudet = JUDET_BAC_FILES[cod];

  if (!numeJudet) {
    return res
      .status(400)
      .json({ error: `Codul de judet ${cod} nu este recunoscut.` });
  }

  const filePath = path.resolve(
    __dirname,
    `cache/bac/data_bac_${numeJudet}.json`
  );

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ error: `Fisierul pentru judetul ${numeJudet} nu exista.` });
  }

  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    const rows = JSON.parse(rawData);

    const header = rows.find(
      (r) => Array.isArray(r) && r.some((cell) => typeof cell === "string" && cell.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("Unitatea de invatamant"))

    );
    const dataRows = rows.filter(
      (r) => Array.isArray(r) && r.length === header.length && r !== header
    );

    const entries = dataRows.map((r) => {
      return {
        school: r[2],
        profil: r[5],
        ri: parseFloat(r[9]) || null,
        mi: parseFloat(r[24]) || null, 
        mev: parseFloat(r[16]) || null, 
        rezultat: r[17] || "Necunoscut",
      };
    });

    res.json(entries);
  } catch (err) {
    console.error(`Eroare la citirea fisierului ${filePath}:`, err.message);
    res.status(500).json({ error: "Eroare interna la citirea datelor BAC." });
  }
});

app.get("/api/ani-disponibili", (req, res) => {
  const cacheDir = path.resolve(__dirname, "cache");
  try {
    const ani = fs
      .readdirSync(cacheDir)
      .filter((folder) => {
        const fullPath = path.join(cacheDir, folder);
        return (
          fs.statSync(fullPath).isDirectory() &&
          /^\d{4}$/.test(folder) 
        );
      })
      .map((folder) => parseInt(folder, 10))
      .sort((a, b) => b - a);
    res.json(ani);
  } catch (err) {
    res.status(500).json({ error: "Nu s-au putut citi anii disponibili." });
  }
});


app.listen(PORT, () => {
  console.log(`Server pornit pe http://localhost:${PORT}`);
});
