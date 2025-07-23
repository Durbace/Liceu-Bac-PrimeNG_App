import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { JUDET_CSV_CODES } from "./judete.js";

const ANI = [2023, 2024];

async function scrapeContestatii(an, judetCod, judetNume) {
  const startUrl = `https://static.evaluare.edu.ro/${an}/rezultate/${judetCod}/index.html`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const toateRezultatele = [];
    let currentPage = 1;

    await page.goto(startUrl, { waitUntil: "networkidle0" });

    while (true) {
      // 1) Așteaptă tabelul
      try {
        await page.waitForSelector("table tbody tr", { timeout: 15000 });
      } catch {
        console.warn(
          `⚠️  ${judetNume} (${an}) — fără tabel pe pagina ${currentPage}`
        );
        break;
      }

      // 2) Extrage contestațiile (Română + Matematică)
      const pageResults = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("table tbody tr")).flatMap(
          (row) => {
            const tds = Array.from(row.querySelectorAll("td"));
            const cells = tds.map((td) => {
              const text = td.innerText.trim();
              if (text) return text;
              // if there's an <i> (FontAwesome check) in here, treat it as a “√”
              if (td.querySelector("i.fa-check, i.fas.fa-check")) return "√";
              return "-";
            });

            if (cells.length < 8) return [];
            const [cod, scoala, rIni, rCont, rFin, mIni, mCont, mFin] = cells;
            const out = [];
            const parseNote = (ini, fin, materie) => {
              if (ini !== "-" && fin !== "-") {
                const ni = parseFloat(ini.replace(",", "."));
                const nf = parseFloat(fin.replace(",", "."));
                if (!isNaN(ni) && !isNaN(nf)) {
                  out.push({
                    cod,
                    scoala,
                    materie,
                    nota_initiala: ni,
                    nota_finala: nf,
                    diferenta: +(nf - ni).toFixed(2),
                  });
                }
              }
            };

            parseNote(rIni, rFin, "Limba și literatura română");
            parseNote(mIni, mFin, "Matematică");
            return out;
          }
        );
      });

      toateRezultatele.push(...pageResults);
      console.log(
        `📄 ${judetNume} (${an}) — Pagina ${currentPage}: ${pageResults.length} contestații`
      );

      // 3) Verifică dacă există "Pagina următoare" cu un număr mai mare
      const nextBtn = await page.$("a.dynatable-page-link.dynatable-page-next");
      if (!nextBtn) break;

      const nextPageNum = await page.evaluate((el) => {
        const v = el.getAttribute("data-dynatable-page");
        return v ? parseInt(v, 10) : NaN;
      }, nextBtn);

      if (isNaN(nextPageNum) || nextPageNum <= currentPage) {
        // ori nu există pagina următoare, ori nu avansează
        break;
      }

      // 4) Pregătește click-ul
      const prevFirst = await page.$eval(
        "table tbody tr:first-child",
        (tr) => tr.innerText
      );

      // 5) Scroll & click
      await page.evaluate((el) => {
        el.scrollIntoView();
        el.click();
      }, nextBtn);

      // 6) Așteaptă până se schimbă cel puțin primul rând (max 15s)
      try {
        await page.waitForFunction(
          (sel, old) => document.querySelector(sel)?.innerText !== old,
          { timeout: 15000 },
          "table tbody tr:first-child",
          prevFirst
        );
      } catch {
        console.warn(
          `⚠️  ${judetNume} (${an}) — nu s-a detectat schimbarea după click la pagina ${
            currentPage + 1
          }`
        );
        break;
      }

      currentPage++;
    }

    // 7) Salvare automată în cache/contestatii/<an>/<judetCod>.json
    if (toateRezultatele.length) {
      const baseCache = path.resolve("./cache/contestatii");
      const yearDir = path.join(baseCache, String(an));
      fs.mkdirSync(yearDir, { recursive: true });
      fs.writeFileSync(
        path.join(yearDir, `${judetCod}.json`),
        JSON.stringify(toateRezultatele, null, 2),
        "utf-8"
      );
      console.log(
        `✅ ${an} ${judetNume} → ${toateRezultatele.length} contestații salvate`
      );
    } else {
      console.log(`ℹ️  ${an} ${judetNume} → fără contestații`);
    }
  } catch (err) {
    console.warn(`⚠️  Eroare la ${an} ${judetNume}: ${err.message}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  for (const an of ANI) {
    for (const [judetNume, judetCod] of Object.entries(JUDET_CSV_CODES)) {
      await scrapeContestatii(an, judetCod, judetNume);
    }
  }
})();
