require('dotenv').config();
const express = require("express");
const cors = require("cors");

const uploadRoute = require("./routes/upload");
const queryRoute = require("./routes/query");
const datasetsRoute = require("./routes/datasets");

const authRoute = require("./routes/auth");
const historyRoute = require("./routes/history");
const projectsRoute = require("./routes/projects");
const sessionsRoute = require("./routes/sessions");
const connectMongo = require("./services/mongoService");

const app = express();

// Connect to MongoDB
connectMongo();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoute);
app.use("/upload", uploadRoute);
app.use("/ask", queryRoute);
app.use("/datasets", datasetsRoute);
app.use("/history", historyRoute);
app.use("/projects", projectsRoute);
app.use("/sessions", sessionsRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});