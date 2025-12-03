const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// DB Connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));

// Test route
app.get("/", (req, res) => {
  res.send("Cryptocard Exchange API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
