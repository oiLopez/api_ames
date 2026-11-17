const express = require("express");
const usuarioRoutes = require("./routes/usuarioRoutes");

const app = express();

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.json({ mensagem: "API AMES funcionando!" });
});

app.use("/usuarios", usuarioRoutes);

module.exports = app;