import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";
import productRouter from "./routers/productRouter";

config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 7002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/product", productRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
