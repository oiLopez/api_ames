const mongoose = require("mongoose");

async function conectarBanco() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("Configure MONGO_URI no arquivo .env");
  }

  await mongoose.connect(uri);
  console.log("MongoDB conectado!");
}

module.exports = conectarBanco;