const express = require("express");
const path = require("path");

const app = express();

// Serve static files from current directory
app.use(express.static(__dirname));

// Route for admin
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

const PORT = process.env.PORT || 7997;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST);
