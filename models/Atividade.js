const mongoose = require("mongoose");

const atividadeSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true
    },

    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    descricao: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500
    },

    categoria: {
      type: String,
      required: true,
      enum: [
        "Tarefa doméstica",
        "Compromisso",
        "Medicamento",
        "Outro"
      ]
    },

    dataInicio: {
      type: String,
      default: ""
    },

    dataFim: {
      type: String,
      default: ""
    },

    endereco: {
      type: String,
      trim: true,
      default: "",
      maxlength: 255
    },

    status: {
      type: String,
      enum: ["pendente", "concluida"],
      default: "pendente"
    },

    dataCriacao: {
      type: Number,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Atividade", atividadeSchema);