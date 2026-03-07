const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function flush() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'conversational_ai'
    });

    // Get all dataset tables
    const [rows] = await conn.query('SELECT name, table_name FROM datasets');
    console.log('Found datasets:', rows.length);

    // Drop each dataset table
    for (const row of rows) {
        try {
            await conn.query('DROP TABLE IF EXISTS ' + row.table_name);
            console.log('Dropped table:', row.table_name);
        } catch (e) {
            console.log('Skip:', e.message);
        }
    }

    // Delete all dataset records
    await conn.query('DELETE FROM datasets');
    console.log('Cleared datasets table');

    await conn.end();

    // Clear uploads folder
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        for (const f of files) {
            fs.unlinkSync(path.join(uploadsDir, f));
            console.log('Deleted file:', f);
        }
    }
    console.log('Done! All datasets flushed.');
}

flush().catch(console.error);
