const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bitcoin = require("bitcoinjs-lib");
const { setSession, getSession } = require("../utils/sessionStore");
const router = express.Router();
// testnet 설정
const network = bitcoin.networks.testnet;

router.get("/generate", async (req, res) => {
  const sessionId = uuidv4();
  const { receiverAddress, amount } = req.body;
  await setSession(sessionId, {
    status: "PENDING",
    receiverAddress,
    amount,
  });

  res.json({ sessionId, receiverAddress });
});

router.post("/confirm", async (req, res) => {
  const { sessionId, rawTx } = req.body;
  const session = await getSession(sessionId);

  if (!session || session.status !== "PENDING") {
    return res.status(400).json({ message: "Invalid session" });
  }

  //bitcoinTX request
  // check receiverAddress & amount
  const receiverAddress = session.receiverAddress;
  const amount = session.amount;
  const tx = bitcoin.Transaction.fromHex(rawTx);
  let ok = false;

  tx.outs.forEach((output, index) => {
    const { value, script } = output;
    const scriptAddress = bitcoin.address.fromOutputScript(script, network);

    if (receiverAddress == scriptAddress && amount == value) {
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

router.get("/status", async (req, res) => {
  const { sessionId } = req.body;
  const session = await getSession(sessionId);

  if (!session) {
    return res.status(404).json({ status: "EXPIRED" });
  }

  res.json({ status: session.status, tx: session.tx || null });
});

module.exports = router;
