const pool = require("./services/mysqlService");

async function migrate() {
    console.log("Starting DB Migration...");
    try {
        const connection = await pool.getConnection();

        console.log("1. Creating projects table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log("2. Altering datasets table...");
        try {
            await connection.query(`
                ALTER TABLE datasets 
                ADD COLUMN project_id INT DEFAULT NULL,
                ADD COLUMN chat_id VARCHAR(255) DEFAULT NULL,
                ADD FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
            `);
            console.log("datasets table altered successfully.");
        } catch (alterErr) {
            if (alterErr.code === 'ER_DUP_FIELDNAME') {
                console.log("Columns already exist, skipping alter.");
            } else {
                throw alterErr;
            }
        }

        connection.release();
        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

migrate();
