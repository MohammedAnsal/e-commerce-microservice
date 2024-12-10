import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";

config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 7004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});