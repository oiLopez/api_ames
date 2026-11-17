const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

async function registrar(req, res) {
  const { nome, email, senha } = req.body || {};

  if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    return res.status(400).json({
      mensagem: "Informe nome, email e senha."
    });
  }

  const nomeNormalizado = nome.trim();
  const emailNormalizado = email.trim().toLowerCase();

  if (!nomeNormalizado || nomeNormalizado.length > 100) {
    return res.status(400).json({
      mensagem: "O nome deve ter entre 1 e 100 caracteres."
    });
  }

  if (
    emailNormalizado.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)
  ) {
    return res.status(400).json({
      mensagem: "Informe um email válido."
    });
  }

  if (senha.length < 8 || Buffer.byteLength(senha, "utf8") > 72) {
    return res.status(400).json({
      mensagem: "Use uma senha com pelo menos 8 caracteres e até 72 bytes."
    });
  }

  try {
    const existente = await Usuario.findOne({
      email: emailNormalizado
    });

    if (existente) {
      return res.status(409).json({
        mensagem: "Este email já está cadastrado."
      });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await Usuario.create({
      nome: nomeNormalizado,
      email: emailNormalizado,
      senhaHash
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!"
    });
  } catch (erro) {
    if (erro.code === 11000) {
      return res.status(409).json({
        mensagem: "Este email já está cadastrado."
      });
    }

    return res.status(500).json({
      mensagem: "Não foi possível cadastrar o usuário."
    });
  }
}

async function login(req, res) {
  const { email, senha } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof senha !== "string" ||
    !email.trim() ||
    !senha ||
    email.trim().length > 254 ||
    Buffer.byteLength(senha, "utf8") > 72
  ) {
    return res.status(400).json({
      mensagem: "Informe email e senha válidos."
    });
  }

  try {
    const usuario = await Usuario.findOne({
      email: email.trim().toLowerCase()
    }).select("+senhaHash");

    if (
      !usuario ||
      !(await bcrypt.compare(senha, usuario.senhaHash))
    ) {
      return res.status(401).json({
        mensagem: "Email ou senha incorretos."
      });
    }

    const token = jwt.sign(
      {},
      process.env.JWT_SECRET,
      {
        subject: usuario._id.toString(),
        algorithm: "HS256",
        expiresIn: "2h"
      }
    );

    return res.json({
      token,
      usuario: {
        id: usuario._id.toString(),
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (erro) {
    return res.status(500).json({
      mensagem: "Não foi possível realizar o login."
    });
  }
}

module.exports = { registrar, login };