import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("CryptoCard Exchange Backend Running Successfully 🚀");
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
