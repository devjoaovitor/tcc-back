const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const db = require("./db");

app.use(bodyParser.json());

app.post("/api/auth/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res
      .status(400)
      .json({ error: "É necessário fornecer email e senha" });
  }

  try {
    const queryResult = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (queryResult.rows.length === 0) {
      console.log("Usuário não encontrado no banco de dados.");
      return res
        .status(401)
        .json({ error: "Usuário não encontrado ou senha incorreta" });
    }

    const usuario = queryResult.rows[0];

    if (senha !== usuario.senha) {
      console.log("Senha fornecida não corresponde.");
      return res
        .status(401)
        .json({ error: "Usuário não encontrado ou senha incorreta" });
    }

    delete usuario.senha;
    console.log(`Usuário ${email} autenticado com sucesso.`);
    res.json({ usuario });
  } catch (err) {
    console.error("Erro ao tentar fazer login", err);
    res.status(500).json({ error: "Erro interno ao tentar fazer login" });
  }
});


app.post('/bebidas', async (req, res) => {
  const { quantidadeBebida, teorAlcoolico, valorUnitario, descricao, tipoBebida, nomeBebida } = req.body;

  try {
    const query = 'INSERT INTO bebidas (quantidadebebida, teoralcoolico, valorunitario, descricao, tipobebida, nomebebida) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [quantidadeBebida, teorAlcoolico, valorUnitario, descricao, tipoBebida, nomeBebida];
    await db.query(query, values);
  
    res.status(200).json({ message: 'Bebida registrada com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar a bebida:', error);
    res.status(500).json({ error: 'Erro ao registrar a bebida. Por favor, tente novamente mais tarde.' });
  }
});

app.put('/bebidas/:id', async (req, res) => {
  const { quantidadeBebida, teorAlcoolico, valorUnitario, descricao, tipoBebida, nomeBebida } = req.body;
  const bebidaId = req.params.id;

  try {
    const query = `
      UPDATE bebidas
      SET quantidadebebida = $1, teoralcoolico = $2, valorunitario = $3, descricao = $4, tipobebida = $5, nomebebida = $6
      WHERE id = $7
    `;
    const values = [quantidadeBebida, teorAlcoolico, valorUnitario, descricao, tipoBebida, nomeBebida, bebidaId];
    await db.query(query, values);

    res.status(200).json({ message: 'Bebida atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar a bebida:', error);
    res.status(500).json({ error: 'Erro ao atualizar a bebida.' });
  }
});

app.get('/bebidas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM bebidas WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Bebida não encontrada.' });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Erro ao obter bebida:', error);
    res.status(500).json({ error: 'Erro ao obter bebida.' });
  }
});

app.get('/bebidas', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bebidas');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao obter bebidas:', error);
    res.status(500).json({ error: 'Erro ao obter bebidas.' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor está rodando na porta ${PORT}`);
});
