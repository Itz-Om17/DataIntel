const express = require("express");
const pool = require("../services/mysqlService");
const authMiddleware = require("../middleware/authMiddleware");

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
