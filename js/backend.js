require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const posDeviceRouter = require("./routers/posDeviceRouter.js")
const { connectDB } = require("./database/conection.js");

// Configuração usuário statico
const staticUser = require("./staticUser.js");

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || origin.startsWith("http://131.107") || origin.startsWith("http://localhost")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST"],
    credentials: false
}));
app.use(express.json());
app.use("/api", posDeviceRouter);

// Rotas básicas
app.post("/api/login", async (req, res) => {
    try {
        const { login, password } = req.body; // Recebe diretamente login e password
        if (login === staticUser.login && password === staticUser.password) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error("Erro ao autenticar:", error);
        res.status(500).json({ success: false, error: "Erro interno do servidor" });
    }
});

// Inicia o servidor E conecta ao DB
async function startServer() {
    await connectDB(); // Conecta ao banco de dados antes de iniciar o servidor
    app.listen(3000, () => {
        console.log("Servidor rodando na porta 3000");
    });
}

startServer(); 