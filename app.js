const express = require("express");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const { setSession, getSession } = require("./utils/sessionStore");
const app = express();
const port = process.env.PORT | 8000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/generate", async (req, res) => {
  const sessionId = uuidv4();
  const { receiverPubKey, senderPubKey } = req.body;
  await setSession(sessionId, {
    status: "PENDING",
    receiverPubKey,
    senderPubKey,
  });

  res.json({ sessionId });
});

app.post("/confirm", async (req, res) => {
  const { sessionId, bitcoinTx, senderPubKey } = req.body;
  const session = await getSession(sessionId);

  if (!session || session.status !== "PENDING") {
    return res.status(400).json({ message: "Invalid session" });
  }

  //bitcoinTX request
  // check senderPubKey
  // check receiverPubKey
  // sendTX

  //if success
  await setSession(sessionId, { status: "CONFIRMED" });
  res.json({ success: true });
});

app.get("/status", async (req, res) => {
  const { sessionId } = req.query;
  const session = await getSession(sessionId);

  if (!session) {
    return res.status(404).json({ status: "EXPIRED" });
  }

  res.json({ status: session.status, tx: session.tx || null });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
