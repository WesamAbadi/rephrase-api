import puppeteer from "puppeteer";
import cheerio from "cheerio";
import express from "express";

const app = express();
const PORT = process.env.PORT || 8000;


async function clickLinkAndScreenshot(userInput) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://typeset.io/paraphraser");
  const textToMatch = "Write here or ";
  const xpathSelector = `//p[contains(text(), "${textToMatch}")]`;
  await page.waitForXPath(xpathSelector);
  const [inputForm] = await page.$x(xpathSelector);
  const [rephrasButton] = await page.$x("//button[contains(., 'Paraphrase')]");

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

    await browser.close();
    return { textContent };
  } else {
    await browser.close();
    return { error: "Could not find input form." };
  }
}

app.get("/paraphrase/", async (req, res) => {
  try {
    const userInput = req.body.text;
    const result = await clickLinkAndScreenshot(userInput);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/", async (req, res) => {
  try {
    res.json('Hello World');
  } catch (error) {}
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
