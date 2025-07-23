const mysql = require("mysql2/promise");
const dbConfig = require("./dbConfig.js");

let connection;

async function connectDB() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Conexão com o banco de dados estabelecida");
        return connection;
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error);
        throw error;
    }
}

function getConnection() {
    if (!connection) {
        throw new Error("Conexão não estabelecida.");
    }
    return connection;
}

module.exports = { connectDB, getConnection };