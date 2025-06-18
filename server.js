const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Importa as rotas da API
require('./js/backend');

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 