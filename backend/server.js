const express = require("express");
const cors = require("cors");

const uploadRoute = require("./routes/upload");
const queryRoute = require("./routes/query");
const datasetsRoute = require("./routes/datasets");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/upload", uploadRoute);
app.use("/ask", queryRoute);

app.use("/datasets", datasetsRoute);

app.listen(5000, () => {
    console.log("Backend running on port 5000");
});