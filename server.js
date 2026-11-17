require("dotenv").config();

const app = require("./app");
const conectarBanco = require("./config/db");

async function iniciar() {
  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error("Configure JWT_SECRET no arquivo .env");
  }

  await conectarBanco();

  const porta = Number(process.env.PORT || 3000);

  const servidor = app.listen(porta, () => {
    console.log(`API AMES rodando na porta ${porta}`);
  });

  servidor.on("error", (erro) => {
    console.error("Erro ao iniciar o servidor:", erro.message);
    process.exit(1);
  });
}

iniciar().catch(() => {
  console.error(
    "Falha ao iniciar. Confira MONGO_URI, JWT_SECRET e o acesso ao MongoDB."
  );
  process.exit(1);
});