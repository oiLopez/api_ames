const express = require("express");
const autenticar = require("../middleware/authMiddleware");

const {
  listar,
  criar,
  atualizarStatus,
  excluir
} = require("../controllers/atividadeController");

const router = express.Router();

router.use(autenticar);

router.get("/", listar);
router.post("/", criar);
router.patch("/:id/status", atualizarStatus);
router.delete("/:id", excluir);

module.exports = router;