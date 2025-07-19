const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- INÍCIO DA CORREÇÃO ---

// Configuração de CORS mais robusta
const allowedOrigins = ['https://canva-frontend-delta.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições da sua lista de permissões e requisições sem origem (ex: Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'], // Garante que OPTIONS é permitido
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Aplica o middleware do CORS com as opções
app.use(cors(corsOptions));

// O Express com o middleware cors já lida com a resposta para a requisição OPTIONS.
// Não é necessário um app.options('*', cors()); separado.

// --- FIM DA CORREÇÃO ---


app.use(express.json());

app.post('/api/canva/token', async (req, res) => {
  const { code, code_verifier } = req.body;

  if (!code || !code_verifier) {
    return res.status(400).json({ error: 'Faltando code ou code_verifier' });
  }

  try {
    const tokenResponse = await axios.post(
      'https://api.canva.com/rest/v1/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code_verifier,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    res.json({ access_token, refresh_token, expires_in });
  } catch (error) {
    console.error('Erro ao obter token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao trocar código por token do Canva' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});