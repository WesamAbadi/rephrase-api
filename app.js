import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
import cheerio from "cheerio";
import express from "express";

console.log("Job done");

const app = express();
console.log("Job done");

const PORT = process.env.PORT || 8000;
console.log("Job done");

async function startRephrase(userInput) {
  try {
    console.log("Job done");

const browser = await chromium.puppeteer.launch({
  executablePath: await chromium.executablePath,
});
    console.log("Job done");

    const page = await browser.newPage();
    console.log("Job done");

    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
    );
    console.log("Job done");

    await page.setViewport({ width: 1280, height: 1024 });
    console.log("Job done");

    await page.goto("https://typeset.io/paraphraser");
    console.log("Job done");

    const textToMatch = "Write here or ";
    console.log("Job done");

    const xpathSelector = `//p[contains(text(), "${textToMatch}")]`;
    await page.waitForXPath(xpathSelector);
    const [inputForm] = await page.$x(xpathSelector);
    const [rephrasButton] = await page.$x(
      "//button[contains(., 'Paraphrase')]"
    );

    if (inputForm) {
      console.log("Job done");

      await inputForm.click();
      await page.evaluate(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );
      await page.keyboard.type(userInput);
      console.log("Job done");

      await rephrasButton.click();
      console.log("Job done");

      await page.waitForSelector('svg[data-icon="copy"]');
      const htmlContent = await page.$eval(
        '[data-paraphraser-output="true"]',
        (div) => div.outerHTML
      );
      const $ = cheerio.load(htmlContent);
      console.log("Job done");

      const textContent = $('div[data-paraphraser-output="true"]').text();
      await browser.close();
      console.log("Job done");
      return { textContent };
    } else {
      await browser.close();
      return { error: "Could not find input form." };
    }
  } catch (error) {
    console.error("Error in startRephrase:", error);
  }
}

app.get("/paraphrase/", async (req, res) => {
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
  } catch (error) {}
});
app.get("/test", async (req, res) => {
  try {
    const userInput = `"The discourse on double standards often points to perceived inconsistencies in the Western world's approach to various global issues, prompting discussions about fairness and equity in international relations."`;
    const result = await startRephrase(userInput);
    res.json(result);
  } catch (error) {}
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
