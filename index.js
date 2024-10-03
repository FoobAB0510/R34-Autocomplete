const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

let browser;
let page;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    browser = await puppeteer.launch({ headless: false });
})();

app.get('/hent', async (req, res) => {
    const searchTerm = req.query.search;

    if (!searchTerm) {
        return res.status(400).json({ error: 'Missing search parameter' });
    }

    const consoleMessages = [];

    try {
        const newPage = await browser.newPage();
        await newPage.goto('https://rule34.xxx/index.php?page=tags&s=list');

        await newPage.setRequestInterception(true);
        newPage.on('request', (request) => {
            const resourceType = request.resourceType();
            if (resourceType === 'stylesheet' || resourceType === 'image') {
                request.abort();
            } else {
                request.continue();
            }
        });
        await newPage.waitForSelector('input[name="tags"]');

        await newPage.type('input[name="tags"]', searchTerm, { delay: 0.1 });
        await newPage.on('console', async msg => {
            const args = await Promise.all(msg.args().map(arg => arg.jsonValue()));
            consoleMessages.push(...args);
        });
        await sleep(1000);
        console.log(consoleMessages)
        res.json({ data: consoleMessages });
        await newPage.close();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

process.on('exit', async () => {
    if (browser) {
        await browser.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
