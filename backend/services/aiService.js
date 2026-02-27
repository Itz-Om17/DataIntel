const axios = require("axios");

const AI_BASE_URL = "http://localhost:8001";

async function generateSQL(schema, question, tableName) {
    const response = await axios.post(
        `${AI_BASE_URL}/generate-sql`,
        {
            schema,
            question,
            table_name: tableName
        }
    );

    return response.data.sql;
}

async function generateExplanation(question, result) {
    const response = await axios.post(
        `${AI_BASE_URL}/generate-explanation`,
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