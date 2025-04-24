const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT | 8000;

const bitcoinqrRouter = require("./routes/bitcoinqr");

app.use(express.json());
app.use(cors());

app.use("/bitcoinqr", bitcoinqrRouter);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});
