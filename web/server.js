const app = require("./src/app");

const port = 3000;
app.listen(port, () => {
  return console.log(`Listening on port ${port}`);
});
