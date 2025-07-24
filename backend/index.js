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
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "https://liceu-bac-frontend.onrender.com",
      "http://localhost:4200",
    ],
  })
);

app.get("/api/licee/:an/:judet/:media", (req, res) => {
  const { an, judet, media } = req.params;
  const judetDecodat = decodeURIComponent(judet);
  const cod = judetDecodat.toUpperCase();

  if (!cod) {
    return res.status(400).json({ error: "Judetul nu este suportat." });
  }

  const mediaNum = parseFloat(media);
  if (isNaN(mediaNum)) {
    return res.status(400).json({ error: "Media este invalida." });
  }

  const filePath = path.resolve(__dirname, `cache/${an}/${cod}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
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
      (r) =>
        Array.isArray(r) &&
        r.some(
          (cell) =>
            typeof cell === "string" &&
            cell
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .includes("Unitatea de invatamant")
        )
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
        return fs.statSync(fullPath).isDirectory() && /^\d{4}$/.test(folder);
      })
      .map((folder) => parseInt(folder, 10))
      .sort((a, b) => b - a);
    res.json(ani);
  } catch (err) {
    res.status(500).json({ error: "Nu s-au putut citi anii disponibili." });
  }
});

app.get("/api/ultimul-admis", (req, res) => {
  const judetFilter = (req.query.judet || "").toUpperCase();
  const baseDir = path.join(__dirname, "cache");
  const ani = fs.readdirSync(baseDir).filter((d) => /^\d{4}$/.test(d));

  const rezultat = {};

  ani.forEach((an) => {
    const summaryDir = path.join(baseDir, an);
    if (!fs.existsSync(summaryDir)) return;

    const files = judetFilter
      ? [`${judetFilter}_summary.json`]
      : fs.readdirSync(summaryDir).filter((f) => f.endsWith("_summary.json"));

    files.forEach((file) => {
      const full = path.join(summaryDir, file);
      if (!fs.existsSync(full)) return;
      const data = JSON.parse(fs.readFileSync(full, "utf-8"));
      data.forEach((rec) => {
        const key = `${rec.liceu} | ${rec.specializarea}`;
        if (!rezultat[key]) rezultat[key] = {};
        rezultat[key][an] = {
          medieUltim: rec.medieUltim,
          pozitiaUltim: rec.pozitiaUltim,
        };
      });
    });
  });

  res.json(rezultat);
});

app.get("/api/judete", (req, res) => {
  const list = Object.entries(JUDET_CSV_CODES).map(([nume, cod]) => ({
    label: nume,
    value: cod,
  }));
  res.json(list);
});

app.get("/api/contestatii/:an/:judet", (req, res) => {
  const { an, judet } = req.params;
  const cod = judet.toUpperCase();

  const filePath = path.resolve(
    __dirname,
    `cache/contestatii/${an}/${cod}.json`
  );

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .json({ error: "Fișierul pentru contestații nu există." });
  }

  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(rawData);
    res.json(data);
  } catch (err) {
    console.error("Eroare la citirea fișierului de contestații:", err.message);
    res
      .status(500)
      .json({ error: "Eroare internă la citirea fișierului de contestații." });
  }
});

app.get("/api/analiza-pozitie/:an", (req, res) => {
  const { an } = req.params;
  const pozitieQuery = parseInt(req.query.pozitie, 10);
  const judetQuery = req.query.judet?.toLowerCase();

  if (isNaN(pozitieQuery)) {
    return res
      .status(400)
      .json({ error: "Parametrul 'pozitie' este invalid." });
  }

  const dir = path.resolve(__dirname, `cache/${an}`);
  if (!fs.existsSync(dir)) {
    return res
      .status(404)
      .json({ error: `Datele pentru anul ${an} nu există.` });
  }

  const complet = [];
  const partial = [];
  const neocupat = [];

  fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.includes("_summary"))
    .forEach((file) => {
      const codJudet = path.basename(file, ".json");
      if (judetQuery && codJudet.toLowerCase() !== judetQuery) {
        return;
      }

      try {
        const candidati = JSON.parse(
          fs.readFileSync(path.join(dir, file), "utf-8")
        );

        const grupe = {};
        candidati.forEach((c, idx) => {
          if (
            !c.liceu ||
            !c.specializarea ||
            typeof c.medieAdmitere !== "number"
          ) {
            return;
          }
          const cheie = `${c.liceu} / ${c.specializarea}`;
          grupe[cheie] = grupe[cheie] || [];
          grupe[cheie].push({ poz: idx + 1, medie: c.medieAdmitere });
        });

        Object.entries(grupe).forEach(([cheie, pozitii]) => {
          const total = pozitii.length;
          const ocupate = pozitii.filter((p) => p.poz <= pozitieQuery).length;
          const libere = total - ocupate;
          const procent = total
            ? ((ocupate / total) * 100).toFixed(2) + "%"
            : "0%";

          const pozOcupate = pozitii
            .filter((p) => p.poz <= pozitieQuery)
            .map((p) => p.poz);
          const prima = pozOcupate.length ? Math.min(...pozOcupate) : "-";
          const ultima = pozOcupate.length ? Math.max(...pozOcupate) : "-";

          const medieUltim =
            typeof ultima === "number"
              ? (pozitii.find((p) => p.poz === ultima)?.medie || 0).toFixed(2)
              : null;

          const rezultat = {
            judet: codJudet,
            liceu: cheie.split(" / ")[0],
            specializare: cheie.split(" / ")[1],
            pozitii: `${prima} - ${ultima}`,
            ocupate,
            libere,
            total,
            procent,
            medieUltim,
          };

          if (ocupate === total) {
            complet.push(rezultat);
          } else if (ocupate > 0) {
            partial.push(rezultat);
          } else {
            neocupat.push(rezultat);
          }
        });
      } catch (err) {
        console.warn(`Eroare la fișierul ${file}:`, err.message);
      }
    });

  const sortByMedieDesc = (a, b) =>
    parseFloat(b.medieUltim || 0) - parseFloat(a.medieUltim || 0);

  res.json({
    complet: complet.sort(sortByMedieDesc),
    partial: partial.sort(sortByMedieDesc),
    neocupat: neocupat.sort(sortByMedieDesc),
  });
});

app.listen(PORT, () => {
  console.log(`Server pornit pe http://localhost:${PORT}`);
});
