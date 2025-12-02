const express = require("express");
const app = express();
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.send("CryptoCard Exchange API Running 🚀");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
