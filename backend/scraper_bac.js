import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { JUDETE } from './judete.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, 'cache', 'bac'); 
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Creat folderul: cache/bac');
}

const headers = [
  "Nr.crt.", "Codul candidatului", "Unitatea de învăţământ", "Promotie anterioară", "Forma învăţământ",
  "Specializare", "Romana Competenţe", "Romana Scris", "Romana Contestaţie", "Romana Nota finală",
  "Materna Competenţe", "Limba modernă studiată - competenţe", "Nota Limba Moderna",
  "Disciplina obligatorie", "Disciplina alegere", "Competenţe digitale", "Media", "Rezultatul final",
  "Competenţe materna", "Nota maternă", "Contestaţie maternă", "Nota finală maternă",
  "Nota disciplina obligatorie", "Contestaţie disciplina obligatorie", "Nota finală disciplina obligatorie",
  "Nota alegere", "Nota contestatie alegere", "Nota finala alegere"
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (let judetId = 1; judetId <= 42; judetId++) {
 const judetNameRaw = JUDETE[judetId - 1]; 
  const judetName = judetNameRaw
    ?.replace(/ /g, "_")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const url = `https://bacalaureat.edu.ro/Pages/JudetRezultMedie.aspx?jud=${judetId}`;
  console.log(`Scraping pentru ${judetNameRaw} (${judetId})...`);

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    const allRows = [];

    let currentPage = 1;
    while (true) {
      console.log(`Pagina ${currentPage}`);
      try {
        await page.waitForSelector('table.mainTable', { timeout: 10000 });
      } catch {
        console.warn(` Nu s-a gasit tabel pentru ${judetNameRaw}, pagina ${currentPage}.`);
        break;
      }

      const rows = await page.$$eval('table.mainTable tr', trs => {
        const pageRows = [];
        for (let i = 0; i < trs.length; i += 2) {
          const row1 = trs[i];
          const row2 = trs[i + 1];
          if (!row2) continue;
          const tds1 = Array.from(row1.querySelectorAll('td')).map(td => td.innerText.trim());
          const tds2 = Array.from(row2.querySelectorAll('td')).map(td => td.innerText.trim());
          pageRows.push(tds1.concat(tds2));
        }
        return pageRows;
      });

      allRows.push(...rows);

      const nextBtn = await page.$('input[title="Pagina urmatoare"]');
      const isDisabled = await nextBtn?.getAttribute('disabled');
      if (!nextBtn || isDisabled !== null) break;

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        nextBtn.click(),
      ]);

      currentPage++;
    }

    if (allRows.length > 0) {
      const finalData = [headers, ...allRows];
      const fileName = path.join(outputDir, `data_bac_${judetName}.json`);
      fs.writeFileSync(fileName, JSON.stringify(finalData, null, 2), 'utf-8');
      console.log(`Salvat ${allRows.length} randuri în ${fileName}\n`);
    } else {
      console.warn(` Niciun rand gasit pentru ${judetNameRaw}.\n`);
    }
  } catch (err) {
    console.error(`Eroare la ${judetNameRaw} (${judetId}):`, err.message);
  }
}

await browser.close();
console.log('Toate judetele procesate si salvate');
