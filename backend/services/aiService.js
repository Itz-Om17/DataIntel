const axios = require("axios");
const http = require("http");

const AI_BASE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

const httpAgent = new http.Agent({
    keepAlive: true,
    timeout: 180000  
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

async function suggestReport(schemaStr, sampleData) {
    const response = await aiAxios.post(
        `/suggest-report`,
        {
            schema_str: schemaStr,
            sample_data: sampleData
        }
    );
    return response.data.suggestions;
}

module.exports = {
    generateSQL,
    generateExplanation,
    suggestReport
};