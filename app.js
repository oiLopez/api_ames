const express = require("express");
const usuarioRoutes = require("./routes/usuarioRoutes");
const atividadeRoutes = require("./routes/atividadeRoutes");

const app = express();

app.use(express.json({ limit: "100kb" }));

app.get("/health", (req, res) => {
  res.json({ mensagem: "API AMES funcionando!" });
});

app.use("/usuarios", usuarioRoutes);
app.use("/atividades", atividadeRoutes);

module.exports = app;
module.exports = app;