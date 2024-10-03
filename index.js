const app = require("express")();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.get("/hent", async (req, res) => {
  var start = performance.now();
  var stop
  let page;
  const consoleMessages = []
  try {
    const searchTerm = req.query.search;
    if (!searchTerm) {
      return res.json({ data: "need input" })
    }
    const Nigger = require("nightmare");
    const nightmare = new Nigger({ show: true, typeInterval: 0.001 })
    nightmare
      .goto('https://rule34.xxx/index.php?page=tags&s=list')
      .type('input[name="tags"]', searchTerm)
      .on('console', (type, ...args) => {
        if (type === 'log') {
          consoleMessages.push(...args)
          console.log((performance.now()-start).toFixed(2));
        }
      })
      .wait(3000)
      .end()
      .then(() => {
        console.log(consoleMessages);
      })
      .catch(error => {
        console.error('Error:', error);
      });

    await sleep(3300)
    res.json({ data: consoleMessages });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred: " + err.message); // Gửi phản hồi lỗi
  }
});

module.exports = app;
