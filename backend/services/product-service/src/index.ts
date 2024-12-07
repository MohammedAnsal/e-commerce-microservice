import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";
import productRouter from "./routers/productRouter";
import consumeMessage from "./utils/consumeMessage";

config();
dbConnect();
consumeMessage() // Calling All Timee (Kafka Consume Fun)

const app = express();
const PORT = process.env.PORT || 7002;
const apiRoot = process.env.API_ROOT || "/api/product-service";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRoot, productRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
