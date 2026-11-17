const express = require("express");
const {
  registrar,
  login
} = require("../controllers/usuarioController");
const autenticar = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/registrar", registrar);
router.post("/login", login);

router.get("/me", autenticar, (req, res) => {
  res.json({
    id: req.usuario._id.toString(),
    nome: req.usuario.nome,
    email: req.usuario.email
  });
});

module.exports = router;