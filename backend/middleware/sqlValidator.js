const { Parser } = require("node-sql-parser");
const parser = new Parser();

function validateSQL(sql, allowedTable, allowedColumns) {
    try {
        // 🔹 Normalize SQL
        sql = sql.trim().replace(/;$/, "");

        // 🔹 Parse SQL to AST
        const ast = parser.astify(sql);

        // 🔹 Ensure single statement
        if (Array.isArray(ast)) {
            return { valid: false, error: "Multiple SQL statements are not allowed." };
        }

        // 🔹 Only allow SELECT
        if (ast.type !== "select") {
            return { valid: false, error: "Only SELECT queries are allowed." };
        }

        // 🔹 Ensure single FROM table
        if (!ast.from || ast.from.length !== 1) {
            return { valid: false, error: "Only single table queries are allowed." };
        }

        const tableName = ast.from[0].table;

        // 🔥 Case-insensitive table validation
        if (tableName.toLowerCase() !== allowedTable.toLowerCase()) {
            return { valid: false, error: "Unauthorized table access." };
        }

        // 🔹 Block JOINs
        if (ast.from[0].join || ast.join) {
            return { valid: false, error: "JOIN operations are not allowed." };
        }

        // 🔹 Block subqueries
        if (hasSubquery(ast)) {
            return { valid: false, error: "Subqueries are not allowed." };
        }

        // 🔹 Deep column extraction
        const usedColumns = new Set();
        extractColumnsDeep(ast, usedColumns);

        // 🔥 Case-insensitive column validation
        const normalizedAllowed = allowedColumns.map(col => col.toLowerCase());

        for (let col of usedColumns) {
            const normalizedCol = col.toLowerCase();

            if (normalizedCol !== "*" && !normalizedAllowed.includes(normalizedCol)) {
                return {
                    valid: false,
                    error: `Invalid column detected: ${col}`
                };
            }
        }

        return { valid: true };

    } catch (err) {
        return { valid: false, error: "Invalid SQL syntax." };
    }
}

/* ========================================= */
/* 🔍 Deep Column Extraction (Recursive) */
/* ========================================= */

function extractColumnsDeep(node, columnSet) {
    if (!node || typeof node !== "object") return;

    // Capture column references
    if (node.type === "column_ref" && node.column) {
        columnSet.add(node.column);
    }

    for (let key in node) {
        if (node[key] && typeof node[key] === "object") {
            extractColumnsDeep(node[key], columnSet);
        }
    }
}

/* ========================================= */
/* 🔒 Subquery Detection */
/* ========================================= */

function hasSubquery(node) {
    if (!node || typeof node !== "object") return false;

    // If nested SELECT inside another SELECT
    if (node.type === "select" && node.parent) {
        return true;
    }

    for (let key in node) {
        if (typeof node[key] === "object") {
            if (hasSubquery(node[key])) return true;
        }
    }

    return false;
}

module.exports = validateSQL;