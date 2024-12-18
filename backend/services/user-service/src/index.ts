import express from "express";
import { config } from "dotenv";
import dbConnect from "./config/dbConnection";
import userRoute from "./routes/userRoute";

config();
dbConnect();

const app = express();
const PORT = process.env.PORT || 7001;
const apiRoot = process.env.API_ROOT || "/api/user-service";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRoot, userRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
