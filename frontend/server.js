import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Railway provides PORT dynamically

// Serve static files from the React dist directory
// When Vite builds, it outputs to 'dist'
app.use(express.static(path.join(__dirname, 'dist')));

// For any other route, send back the React index.html
// This is necessary for client-side routing (React Router) to work properly
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend static server running on port ${PORT}`);
});
