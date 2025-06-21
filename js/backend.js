require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const posDevice = require('./posDevice.js');

const app = express();

// Configuração usuário statico
const staticUser = require("./staticUser.js");

// Configuração do banco de dados
const dbConfig = require("./dbConfig.js");

let connection; // Conexão com o banco de dados

// Função para estabelecer a conexão com o banco de dados
async function connectDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conectado ao banco de dados MySQL!');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        process.exit(1); // Encerra o processo se não conseguir conectar
    }
}

// Middleware
app.use(cors({
    origin: 'https://digsix.github.io',
    methods: ['GET', 'POST'],
    credentials: false
  }));
app.use(express.json());

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
        console.error('Erro ao autenticar:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});

app.get('/api/loadDevices', async (req, res) => {
    try {
        console.log("loadDevices Ok!");
        const [rows] = await connection.execute(`
            SELECT pd.serialNumber, pd.logicalNumber, pd.reciveDate, 
                   ps.possibleStatus, pr.possibleReason, 
                   pd.protocol, pd.exitDate 
            FROM posDevices pd 
            JOIN possiblesStatus ps ON pd.statusId = ps.id 
            JOIN possiblesReasons pr ON pd.changeReasonId = pr.id
            ORDER BY pd.reciveDate DESC;
        `);

        const devices = rows.map(row => {
            const device = new posDevice(
              row.serialNumber,
              row.logicalNumber,
              row.reciveDate,
              row.possibleStatus,
              row.possibleReason,
              row.protocol,
              row.exitDate
            );

            device.transformDatas();

            return device;
          });
          
        res.json(devices);
    } catch (error) {
        console.error('Erro ao buscar dispositivos:', error);
        res.status(500).json({ error: 'Erro ao buscar dispositivos' });
    }
});

app.post("/api/createDevice", async (req, res) => {
    try{
        const { serialNumber,
                logicalNumber,
                reciveDate,
                status,
                changeReason,
                protocol,
                exitDate } = req.body;

        const device = new posDevice( serialNumber,
                                      logicalNumber, 
                                      reciveDate, 
                                      status, 
                                      changeReason, 
                                      protocol, 
                                      exitDate );

        device.validateDatas();

        const [result] = await connection.execute(
            'INSERT INTO posDevices (serialNumber, logicalNumber, reciveDate, statusId, changeReasonId, protocol, exitDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [device.serialNumber, device.logicalNumber, device.reciveDate, device.status, device.changeReason, device.protocol, device.exitDate]
        );

        res.status(201).json({ message: 'Dispositivo criado com sucesso', id: result.insertId });

    } catch (error){
        console.error('Erro ao criar dispositivo:', error);
        res.status(500).json({ error: 'Erro ao criar dispositivo' });
    }
});

app.post("/api/filterDevices", async(req, res) =>{
    try{
        const { serialNumber,
            logicalNumber,
            reciveDate,
            status,
            changeReason,
            protocol,
            exitDate } = req.body;

        // Monta a query base
        let query = `
            SELECT pd.serialNumber, pd.logicalNumber, pd.reciveDate, 
                   ps.possibleStatus, pr.possibleReason, 
                   pd.protocol, pd.exitDate 
            FROM posDevices pd 
            JOIN possiblesStatus ps ON pd.statusId = ps.id 
            JOIN possiblesReasons pr ON pd.changeReasonId = pr.id
            WHERE 1=1
        `;
        const params = [];

        // Adiciona filtros dinamicamente
        if (serialNumber) {
            query += " AND pd.serialNumber = ?";
            params.push(serialNumber);
        }
        if (logicalNumber) {
            query += " AND pd.logicalNumber = ?";
            params.push(logicalNumber);
        }
        if (reciveDate) {
            query += " AND pd.reciveDate = ?";
            params.push(reciveDate);
        }
        if (status) {
            query += " AND pd.statusId = ?";
            params.push(status);
        }
        if (changeReason) {
            query += " AND pd.changeReasonId = ?";
            params.push(changeReason);
        }
        if (protocol) {
            query += " AND pd.protocol = ?";
            params.push(protocol);
        }
        if (exitDate) {
            query += " AND pd.exitDate = ?";
            params.push(exitDate);
        }

        query += " ORDER BY pd.reciveDate DESC;"

        const [rows] = await connection.execute(query, params);

        const devices = rows.map(row => {
            const device = new posDevice(
                row.serialNumber,
                row.logicalNumber,
                row.reciveDate,
                row.possibleStatus,
                row.possibleReason,
                row.protocol,
                row.exitDate
            );
            device.transformDatas();
            return device;
        });
        res.json(devices);
    } catch (error) {
        console.error('Erro ao filtrar dispositivos:', error);
        res.status(500).json({ error: 'Erro ao filtrar dispositivos' });
    }
})

app.post("/api/editDevice", async(req, res) => {
    try {
        const { serialNumber,
            logicalNumber,
            reciveDate,
            status,
            changeReason,
            protocol,
            exitDate } = req.body;
        
        const device = new posDevice( 
            serialNumber,
            logicalNumber, 
            reciveDate, 
            status, 
            changeReason, 
            protocol, 
            exitDate );

        device.validateDatas();

        const [result] = await connection.execute(
            `UPDATE posDevices
            SET
                statusId = ?,
                changeReasonId = ?,
                protocol = ?,
                exitDate = ?
            WHERE
                serialNumber = ?`,
            [
                device.status,
                device.changeReason,
                device.protocol,
                device.exitDate,
                device.serialNumber
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Dispositivo não encontrado ou nenhum dado alterado.' });
        }

        res.json({ message: 'Dispositivo atualizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar dispositivo:', error);
        res.status(500).json({ error: 'Erro ao atualizar dispositivo' });
    }
});

app.get("/api/storegedDevices", async(req, res) => {
    try {
        console.log("storegedDevices Ok!");
        const [rows] = await connection.execute(`SELECT COUNT(*) AS total FROM posDevices WHERE statusId = 2;`);
        const quantity = rows[0].total;
        res.json({quantity});
    } catch (error) {
        console.error('Erro ao buscar quantidade de dispositivos armazenados:', error);
        res.status(500).json({ error: 'Erro ao buscar quantidade de dispositivos armazenados' });
    }
});

// Inicia o servidor E conecta ao DB
async function startServer() {
    await connectDB(); // Conecta ao banco de dados antes de iniciar o servidor
    app.listen(3000, () => {
        console.log('Servidor rodando na porta 3000');
    });
}

startServer(); 