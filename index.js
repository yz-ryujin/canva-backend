const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIGURAÇÃO DE CORS CORRIGIDA ---
// Esta configuração é mais robusta e garante que o seu backend
// responda corretamente às verificações de segurança (preflight requests)
// enviadas pelo navegador a partir do seu frontend na Vercel.

const corsOptions = {
  origin: 'https://canva-frontend-delta.vercel.app', // A URL exata do seu frontend
  methods: ['POST', 'GET', 'OPTIONS'], // Permite os métodos necessários
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite os cabeçalhos necessários
};

// O middleware cors do Express já lida com as requisições OPTIONS automaticamente
// quando configurado desta forma.
app.use(cors(corsOptions));

app.use(express.json());

// A rota da API
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
        redirect_uri: process.env.REDIRECT_URI, // Garanta que esta variável de ambiente está configurada na Vercel
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

// Vercel lida com o app.listen, então não é estritamente necessário, mas bom para dev local.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Backend rodando em http://localhost:${PORT}`);
    });
}

// Exporta o app para a Vercel usar
module.exports = app;
