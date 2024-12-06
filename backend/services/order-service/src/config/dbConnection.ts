import { connect } from "mongoose";
import { config } from "dotenv";
config();

export default async function dbConnect() {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not defined in the environment variables");
  }

  await connect(mongoUrl)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error while connecting to MongoDB:", err.message);
    });
}
