const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const db = require('./db');

app.use(cors());
app.use(bodyParser.json());

app.post('/api/auth/login', async (req, res) => {
    const { email, senha } = req.body;

    console.log(`Tentativa de login para o email: ${email}`);

    if (!email || !senha) {
        return res.status(400).json({ error: 'É necessário fornecer email e senha' });
    }

    try {
        const queryResult = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (queryResult.rows.length === 0) {
            console.log('Usuário não encontrado no banco de dados.'); 
            return res.status(401).json({ error: 'Usuário não encontrado ou senha incorreta' });
        }

        const usuario = queryResult.rows[0];

        if (senha !== usuario.senha) {
            console.log('Senha fornecida não corresponde.'); 
            return res.status(401).json({ error: 'Usuário não encontrado ou senha incorreta' });
        }

        delete usuario.senha; 
        console.log(`Usuário ${email} autenticado com sucesso.`); 
        res.json({ usuario });
    } catch (err) {
        console.error('Erro ao tentar fazer login', err);
        res.status(500).json({ error: 'Erro interno ao tentar fazer login' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta ${PORT}`);
});