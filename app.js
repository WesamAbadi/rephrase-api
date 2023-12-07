import puppeteer from "puppeteer";
import cheerio from "cheerio";
import express from "express";
const app = express();
const PORT = process.env.PORT || 8000;

let browserInstance;

async function getBrowserInstance() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: 'new',
    });
  }
  return browserInstance;
}
async function startRephrase(userInput) {
  try {
    const browser = await getBrowserInstance();
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 1024 });
    page.goto("https://typeset.io/paraphraser");
    const textToMatch = "Write here or ";
    const xpathSelector = `//p[contains(text(), "${textToMatch}")]`;
    await page.waitForXPath(xpathSelector);
    const [inputForm] = await page.$x(xpathSelector);
    const [rephrasButton] = await page.$x(
      "//button[contains(., 'Paraphrase')]"
    );

    if (inputForm) {
      await inputForm.click();
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      await page.keyboard.type(userInput);
      await rephrasButton.click();
      await page.waitForSelector('svg[data-icon="copy"]');
      const htmlContent = await page.$eval(
        '[data-paraphraser-output="true"]',
        (div) => div.outerHTML
      );
      const $ = cheerio.load(htmlContent);
      const textContent = $('div[data-paraphraser-output="true"]').text();
      await page.close();
      return { textContent };
    }
  } catch (error) {
    console.error("Error in startRephrase:", error);
    return { error: error.message };
  }
}

app.use(express.json());

app.post("/paraphrase/", async (req, res) => {
  try {
    const userInput = req.body.text;
    const result = await startRephrase(userInput);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", async (req, res) => {
  try {
    res.json("Hello World");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/test", async (req, res) => {
  try {
    const userInput = `The discourse on double standards often points to perceived inconsistencies in the Western world's approach to various global issues.`;
    const result = await startRephrase(userInput);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
