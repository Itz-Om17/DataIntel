const express = require("express");
const pool = require("../services/mysqlService");
const validateSQL = require("../middleware/sqlValidator");
const { generateSQL, generateExplanation } = require("../services/aiService");

const router = express.Router();

router.post("/", async (req, res) => {

    const connection = await pool.getConnection();

    try {
        const { datasetId, question } = req.body;

        if (!datasetId || !question) {
            return res.status(400).json({
                error: "datasetId and question are required."
            });
        }

        console.log("Question:", question);

        /* ==============================
           1️⃣ Fetch Table Name
        ============================== */

        const [datasetRows] = await connection.query(
            "SELECT table_name FROM datasets WHERE id = ?",
            [datasetId]
        );

        if (datasetRows.length === 0) {
            return res.status(400).json({
                error: "Invalid dataset ID"
            });
        }

        const tableName = datasetRows[0].table_name;

        /* ==============================
           2️⃣ Fetch Full Schema (with samples)
        ============================== */

        const [schemaRows] = await connection.query(
            "SELECT column_name, data_type, sample_values FROM dataset_schema WHERE dataset_id = ?",
            [datasetId]
        );

        if (schemaRows.length === 0) {
            return res.status(400).json({
                error: "Schema not found for dataset"
            });
        }

        const allowedColumns = schemaRows.map(r => r.column_name);

        // 🔥 Build rich schema string
        let schemaString = "";

        schemaRows.forEach(col => {
            schemaString += `Column: ${col.column_name}\n`;
            schemaString += `Type: ${col.data_type}\n`;
            if (col.sample_values) {
                schemaString += `Possible Values: ${col.sample_values}\n`;
            }
            schemaString += "\n";
        });

        /* ==============================
           3️⃣ Generate SQL from AI
        ============================== */

        let generatedSQL = await generateSQL(
            schemaString,
            question,
            tableName
        );

        // 🔥 Clean SQL
        generatedSQL = generatedSQL.trim();

        if (generatedSQL.includes("SELECT")) {
            generatedSQL = generatedSQL.substring(
                generatedSQL.indexOf("SELECT")
            );
        }

        generatedSQL = generatedSQL.replace(/;$/, "").trim();

        // 🔥 Optional: enforce LIMIT safety
        if (!generatedSQL.toUpperCase().includes("LIMIT")) {
            generatedSQL += " LIMIT 1000";
        }

        console.log("Generated SQL:", generatedSQL);

        /* ==============================
           4️⃣ Validate SQL
        ============================== */

        const validation = validateSQL(
            generatedSQL,
            tableName,
            allowedColumns
        );

        console.log("Validation Result:", validation);

        if (!validation.valid) {
            return res.status(400).json({
                error: validation.error
            });
        }

        /* ==============================
           5️⃣ Execute SQL
        ============================== */

        const startTime = Date.now();
        const [rows] = await connection.query(generatedSQL);
        const executionTime = (Date.now() - startTime) / 1000;

        /* ==============================
           6️⃣ Generate Explanation
        ============================== */

        const explanation = await generateExplanation(question, rows);

        /* ==============================
           7️⃣ Log Query
        ============================== */

        await connection.query(
            `INSERT INTO query_logs 
             (dataset_id, user_question, generated_sql, execution_time)
             VALUES (?, ?, ?, ?)`,
            [datasetId, question, generatedSQL, executionTime]
        );

        /* ==============================
           8️⃣ Return Response
        ============================== */

        res.json({
            answer: explanation,
            sql: generatedSQL,
            data: rows,
            executionTime
        });

    } catch (err) {

        console.error("Query Error:", err);

        res.status(500).json({
            error: "Query processing failed",
            details: err.message
        });

    } finally {
        connection.release();
    }
});

module.exports = router;