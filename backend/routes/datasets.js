const express = require("express");
const pool = require("../services/mysqlService");
const authMiddleware = require("../middleware/authMiddleware");
const { suggestReport } = require("../services/aiService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query;

    let query = "SELECT id, name, table_name, project_id, chat_id FROM datasets ORDER BY uploaded_at DESC";
    let params = [];

    if (projectId) {
      query = "SELECT id, name, table_name, project_id, chat_id FROM datasets WHERE project_id = ? OR project_id IS NULL ORDER BY uploaded_at DESC";
      params = [projectId];
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch datasets" });
  }
});

// Get dataset summary (schema, row count, preview)
router.get("/:id/summary", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [dataset] = await connection.query(
      "SELECT table_name, name FROM datasets WHERE id = ?",
      [req.params.id]
    );

    if (!dataset.length) {
      connection.release();
      return res.status(404).json({ error: "Dataset not found" });
    }

    const tableName = dataset[0].table_name;
    const datasetName = dataset[0].name;

    // Get schema info
    const [columns] = await connection.query(
      "SELECT column_name, data_type, sample_values FROM dataset_schema WHERE dataset_id = ?",
      [req.params.id]
    );

    // Get row count
    const [countRes] = await connection.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
    const rowCount = countRes[0].total;

    // Get sample preview (more rows for better reporting)
    const [preview] = await connection.query(`SELECT * FROM \`${tableName}\` LIMIT 100`);

    connection.release();

    res.json({
      name: datasetName,
      tableName,
      rowCount,
      columns,
      preview
    });
  } catch (err) {
    if (connection) connection.release();
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dataset summary" });
  }
});

// Get AI-powered report suggestions
router.get("/:id/suggestions", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [dataset] = await connection.query(
      "SELECT table_name FROM datasets WHERE id = ?",
      [req.params.id]
    );

    if (!dataset.length) {
      connection.release();
      return res.status(404).json({ error: "Dataset not found" });
    }

    const [schemaRows] = await connection.query(
      "SELECT column_name, data_type, sample_values FROM dataset_schema WHERE dataset_id = ?",
      [req.params.id]
    );

    let schemaStr = schemaRows.map(r => `Col: ${r.column_name}, Type: ${r.data_type}, Sample: ${r.sample_values}`).join("\n");
    const [preview] = await connection.query(`SELECT * FROM \`${dataset[0].table_name}\` LIMIT 3`);
    
    connection.release();

    const suggestions = await suggestReport(schemaStr, JSON.stringify(preview));
    res.json(suggestions);
  } catch (err) {
    if (connection) connection.release();
    console.error("AI suggested report error:", err);
    res.status(500).json({ error: "Failed to fetch AI suggestions" });
  }
});

// Delete a dataset (drops its table and removes record)
router.delete("/:id", authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT table_name FROM datasets WHERE id = ?",
      [req.params.id]
    );

    if (!rows.length) {
      connection.release();
      return res.status(404).json({ error: "Dataset not found" });
    }

    const tableName = rows[0].table_name;

    // Drop the actual data table
    await connection.query(`DROP TABLE IF EXISTS \`${tableName}\``);

    // Remove the datasets record
    await connection.query("DELETE FROM datasets WHERE id = ?", [req.params.id]);

    connection.release();
    res.json({ success: true });
  } catch (err) {
    connection.release();
    console.error(err);
    res.status(500).json({ error: "Failed to delete dataset" });
  }
});

module.exports = router;
