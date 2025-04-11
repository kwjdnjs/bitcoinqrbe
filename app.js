const express = require("express");
const app = express();
const port = process.env.PORT | 8000;

const bitcoinqrRouter = require("./routes/bitcoinqr");

app.use(express.json());

app.use("/bitcoinqr", bitcoinqrRouter);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
