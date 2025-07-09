import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { JUDET_CSV_CODES } from "./judete.js";

async function scrapeJudet(judet, cod, an) {
  const url = `https://static.admitere.edu.ro/${an}/repartizare/${cod}/index.html`;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  let results = [];
  let currentPage = 1;

  while (true) {
    try {
      await page.waitForSelector("table tbody tr", { timeout: 8000 });
    } catch {
      console.warn(`${judet} (${an}) are pagina, dar fara date/tablou`);
      await browser.close();
      return;
    }

    const pageResults = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table tbody tr"));
      return rows
        .map((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length < 11) return null;

          const medieAdmitere = parseFloat(
            cells[3].innerText.trim().replace(",", ".")
          );
          const rawHTML = cells[10].innerHTML;
          const [liceuRaw, profilRaw] = rawHTML.includes("<br>")
            ? rawHTML.split("<br>")
            : [rawHTML, ""];

          const div = document.createElement("div");
          div.innerHTML = liceuRaw;
          const liceu = div.innerText.trim();
          div.innerHTML = profilRaw;
          const specializarea = div.innerText.trim();

          return { liceu, specializarea, medieAdmitere };
        })
        .filter(Boolean);
    });

    results.push(...pageResults);
    console.log(
      `An ${an}, ${judet} - Pagina ${currentPage}: ${pageResults.length} randuri`
    );

    const nextButton = await page.$("a.dynatable-page-next");
    if (nextButton) {
      const prevFirstRow = await page.$eval(
        "table tbody tr:first-child",
        (row) => row.innerText
      );
      await nextButton.click();

      try {
        await page.waitForFunction(
          (selector, prevText) => {
            const first = document.querySelector(selector);
            return first && first.innerText !== prevText;
          },
          {},
          "table tbody tr:first-child",
          prevFirstRow
        );
        currentPage++;
      } catch {
        break;
      }
    } else {
      break;
    }
  }

  await browser.close();

  const outputDir = path.resolve(`./cache/${an}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${cod}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Scris: ${outputPath}`);
}

(async () => {
  const aniInceput = 2022;
  const anCurent = new Date().getFullYear();

  for (let an = aniInceput; an <= anCurent; an++) {
    for (const [judet, cod] of Object.entries(JUDET_CSV_CODES)) {
      const testUrl = `https://static.admitere.edu.ro/${an}/repartizare/${cod}/index.html`;

      try {
        const response = await fetch(testUrl);
        if (!response.ok) {
          console.warn(`${judet} (${an}): pagina nu exista`);
          continue;
        }

        await scrapeJudet(judet, cod, an);
      } catch (err) {
        console.error(`Eroare la ${judet} (${an}):`, err.message);
      }
    }
  }
})();
