const app = require("express")();
const puppeteer = require("puppeteer");

let browser;
let browserInitializedPromise;

(async () => {
  browserInitializedPromise = (async () => {
    try {
      browser = await puppeteer.launch({
        headless: true, 
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--single-process',
          '--no-zygote',
          '--no-first-run',
          `--window-size=1280,800`,
          '--window-position=0,0',
          '--ignore-certificate-errors',
          '--ignore-certificate-errors-skip-list',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--hide-scrollbars',
          '--disable-notifications',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-breakpad',
          '--disable-component-extensions-with-background-pages',
          '--disable-extensions',
          '--disable-features=TranslateUI,BlinkGenPropertyTrees',
          '--disable-ipc-flooding-protection',
          '--disable-renderer-backgrounding',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          '--force-color-profile=srgb',
          '--metrics-recording-only',
          '--mute-audio'
        ]
      });
      browserInitialized = true; // Đánh dấu rằng trình duyệt đã được khởi tạo
    } catch (error) {
      console.error('Failed to initialize browser:', error);
    }
  })();
})();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.get("/hent", async (req, res) => {
  let page;
  const consoleMessages = []
  try {
    const searchTerm = req.query.search;
    if(!searchTerm) {
      return res.json({ data: "need input" })
    }

    if (!browser) {
      await browserInitializedPromise;
    }
    page = await browser.newPage();
    await page.goto("https://rule34.xxx/index.php?page=tags&s=list");
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const resourceType = request.resourceType();
      if (resourceType === 'stylesheet' || resourceType === 'image') {
        request.abort();
      } else {
        request.continue();
      }
    });
    await page.waitForSelector('input[name="tags"]');
    await page.type('input[name="tags"]', searchTerm, { delay: 0.1 });
    await page.on('console', async msg => {
      const args = await Promise.all(msg.args().map(arg => arg.jsonValue()));
      consoleMessages.push(...args);
    });
    await sleep(500);
    res.json({ data: consoleMessages });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred: " + err.message); // Gửi phản hồi lỗi
  }
});

module.exports = app;
