const express = require("express");

const app = express();

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.json({ mensagem: "API AMES funcionando!" });
});

module.exports = app;