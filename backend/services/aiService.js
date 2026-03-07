const axios = require("axios");
const http = require("http");

const AI_BASE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

// Create an httpAgent that keeps connections alive and doesn't time out idly
const httpAgent = new http.Agent({
    keepAlive: true,
    timeout: 180000  // 3 minutes socket timeout
});

const aiAxios = axios.create({
    baseURL: AI_BASE_URL,
    timeout: 180000,
    httpAgent
});

console.log("AI Service Base URL:", AI_BASE_URL);

async function generateSQL(schema, question, tableName) {
    const response = await aiAxios.post(
        `/generate-sql`,
        {
            db_schema: schema,
            question,
            table_name: tableName
        }
    );
    console.log("AI SQL Response Received");

    return response.data.sql;
}

async function generateExplanation(question, result) {
    const response = await aiAxios.post(
        `/generate-explanation`,
        {
            question,
            result
        }
    );

    return response.data.explanation;
}

module.exports = {
    generateSQL,
    generateExplanation
};