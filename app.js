const express = require("express");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const bitcoin = require("bitcoinjs-lib");
const { setSession, getSession } = require("./utils/sessionStore");
const app = express();
const port = process.env.PORT | 8000;
// testnet 설정
const network = bitcoin.networks.testnet;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/generate", async (req, res) => {
  const sessionId = uuidv4();
  const { receiverPubKey, amount } = req.body;
  await setSession(sessionId, {
    status: "PENDING",
    receiverPubKey,
    amount,
  });

  res.json({ sessionId, receiverPubKey });
});

app.post("/confirm", async (req, res) => {
  const { sessionId, rawTx } = req.body;
  const session = await getSession(sessionId);

  if (!session || session.status !== "PENDING") {
    return res.status(400).json({ message: "Invalid session" });
  }

  //bitcoinTX request
  // check receiverPubKey & amount
  const receiverPubKey = session.receiverPubKey;
  const amount = session.amount;
  const tx = bitcoin.Transaction.fromHex(rawTx);
  let ok = false;

  tx.outs.forEach((output, index) => {
    const { value, script } = output;
    const scriptPubKey = script.toString("hex"); //공개키로 바꿔야함

    console.log(receiverPubKey, scriptPubKey);
    if (receiverPubKey == scriptPubKey && amount == value) {
      ok = true;
    }
  });

  // sendTX
  if (ok) {
    await setSession(sessionId, { status: "CONFIRMED", tx: tx.getId() });
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.get("/status", async (req, res) => {
  const { sessionId } = req.body;
  const session = await getSession(sessionId);

  if (!session) {
    return res.status(404).json({ status: "EXPIRED" });
  }

  res.json({ status: session.status, tx: session.tx || null });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
