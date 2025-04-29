const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/utxo", async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ error: "Missing address parameter" });
  }

  try {
    const response = await axios.get(
      `https://mempool.space/testnet/api/address/${address}/utxo`
    );
    res.json(response.data);
  } catch (error) {
    console.error("UTXO fetch failed:", error.message);
    res.status(500).json({ error: "Failed to fetch UTXO from mempool.space" });
  }
});

module.exports = router;
