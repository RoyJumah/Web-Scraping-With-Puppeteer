const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const cron = require("node-cron");

async function start() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://climatechangeconference.netlify.app");

  // await page.screenshot({ path: "climate-conference.png" });

  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".artistName")).map(
      (el) => el.textContent
    );
  });

  const photos = await page.$$eval(".artistPhoto-container img ", (imgs) => {
    return imgs.map((img) => img.src);
  });

  for (const photo of photos) {
    const imagePage = await page.goto(photo);
    await fs.writeFile(photo.split("/").pop(), await imagePage.buffer());
  }

  await fs.writeFile("names.txt", names.join("\r\n"));
  await browser.close();
}

setInterval(start, 5000);

// cron.schedule("*/5 * * * *", start);
