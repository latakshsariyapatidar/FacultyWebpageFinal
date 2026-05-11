const express = require("express");
const path = require("path");

const app = express();

// Serve static files from current directory
app.use(express.static(__dirname));

// Route for admin
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

const PORT = 7997;

app.listen(PORT, '0.0.0.0');
