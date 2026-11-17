const mongoose = require("mongoose");
const Atividade = require("../models/Atividade");


const categorias = [
  "Tarefa doméstica",
  "Compromisso",
  "Medicamento",
  "Outro"
];

// Interpreta dd/MM/aaaa HH:mm e rejeita datas inexistentes.
function analisarData(texto) {
  if (!texto) return null;

  const partes = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(texto);
  if (!partes) return NaN;

  const [, dia, mes, ano, hora, minuto] = partes.map(Number);

  if (ano < 1900 || ano > 9999) return NaN;

  const data = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia ||
    data.getUTCHours() !== hora ||
    data.getUTCMinutes() !== minuto
  ) {
    return NaN;
  }

  return data.getTime();
}

// Mantém os nomes e tipos esperados pelo aplicativo Android.
function apresentar(atividade) {
  return {
    id: atividade._id.toString(),
    titulo: atividade.titulo,
    descricao: atividade.descricao,
    categoria: atividade.categoria,
    dataInicio: atividade.dataInicio,
    dataFim: atividade.dataFim,
    endereco: atividade.endereco,
    status: atividade.status,
    dataCriacao: atividade.dataCriacao
  };
}

async function listar(req, res) {
  try {
    const atividades = await Atividade.find({
      usuario: req.usuarioId
    }).sort({ dataCriacao: -1 });

    return res.json(atividades.map(apresentar));
  } catch {
    return res.status(500).json({
      mensagem: "Não foi possível listar as atividades."
    });
  }
}

async function criar(req, res) {
  const corpo = req.body || {};

  const campos = [
    "titulo",
    "descricao",
    "categoria",
    "dataInicio",
    "dataFim",
    "endereco"
  ];

  const dados = {};

  for (const campo of campos) {
    const valor = corpo[campo] ?? "";

    if (typeof valor !== "string") {
      return res.status(400).json({
        mensagem: `O campo ${campo} deve ser um texto.`
      });
    }

    dados[campo] = valor.trim();
  }

  if (!dados.titulo || dados.titulo.length > 150) {
    return res.status(400).json({
      mensagem: "Informe um título com até 150 caracteres."
    });
  }

  if (!categorias.includes(dados.categoria)) {
    return res.status(400).json({
      mensagem: "Selecione uma categoria válida."
    });
  }

  if (dados.descricao.length > 500 || dados.endereco.length > 255) {
    return res.status(400).json({
      mensagem: "Descrição ou endereço acima do tamanho permitido."
    });
  }

  const inicio = analisarData(dados.dataInicio);
  const fim = analisarData(dados.dataFim);

  if (Number.isNaN(inicio) || Number.isNaN(fim)) {
    return res.status(400).json({
      mensagem: "Data inválida. Use dd/MM/aaaa HH:mm."
    });
  }

  if (inicio !== null && fim !== null && fim < inicio) {
    return res.status(400).json({
      mensagem: "O término não pode ser anterior ao início."
    });
  }

  try {
    const atividade = await Atividade.create({
      ...dados,
      usuario: req.usuarioId,
      status: "pendente"
    });

    return res.status(201).json(apresentar(atividade));
  } catch {
    return res.status(500).json({
      mensagem: "Não foi possível cadastrar a atividade."
    });
  }
}

async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({
      mensagem: "ID da atividade inválido."
    });
  }

  if (!["pendente", "concluida"].includes(status)) {
    return res.status(400).json({
      mensagem: "Status inválido."
    });
  }

  try {
    const atividade = await Atividade.findOneAndUpdate(
      {
        _id: id,
        usuario: req.usuarioId
      },
      { $set: { status } },
      {
        new: true,
        runValidators: true
      }
    );

    if (!atividade) {
      return res.status(404).json({
        mensagem: "Atividade não encontrada."
      });
    }

    return res.json(apresentar(atividade));
  } catch {
    return res.status(500).json({
      mensagem: "Não foi possível atualizar a atividade."
    });
  }
}

async function excluir(req, res) {
  const { id } = req.params;

  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({
      mensagem: "ID da atividade inválido."
    });
  }

  try {
    const atividade = await Atividade.findOneAndDelete({
      _id: id,
      usuario: req.usuarioId
    });

    if (!atividade) {
      return res.status(404).json({
        mensagem: "Atividade não encontrada."
      });
    }

    return res.json({
      mensagem: "Atividade excluída com sucesso!"
    });
  } catch {
    return res.status(500).json({
      mensagem: "Não foi possível excluir a atividade."
    });
  }
}

module.exports = {
  listar,
  criar,
  atualizarStatus,
  excluir
};