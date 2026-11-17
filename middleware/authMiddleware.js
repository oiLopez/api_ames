const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Usuario = require("../models/Usuario");

async function autenticar(req, res, next) {
  const autorizacao = req.get("Authorization") || "";
  const partes = autorizacao.trim().split(/\s+/);

  if (
    partes.length !== 2 ||
    partes[0].toLowerCase() !== "bearer"
  ) {
    return res.status(401).json({
      mensagem: "Faça login para continuar."
    });
  }

  let dados;

  try {
    dados = jwt.verify(
      partes[1],
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );
  } catch {
    return res.status(401).json({
      mensagem: "Sessão inválida ou expirada. Faça login novamente."
    });
  }

  if (
    typeof dados !== "object" ||
    typeof dados.sub !== "string" ||
    !mongoose.isObjectIdOrHexString(dados.sub)
  ) {
    return res.status(401).json({
      mensagem: "Token inválido."
    });
  }

  try {
    const usuario = await Usuario.findById(dados.sub)
      .select("_id nome email");

    if (!usuario) {
      return res.status(401).json({
        mensagem: "Usuário não encontrado. Faça login novamente."
      });
    }

    req.usuarioId = usuario._id;
    req.usuario = usuario;
  } catch {
    return res.status(500).json({
      mensagem: "Não foi possível verificar a sessão."
    });
  }

  next();
}

module.exports = autenticar;