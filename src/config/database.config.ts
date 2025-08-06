import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("connected to mongo databse");
  } catch (error) {
    console.log("Error connecting to mongo database");
    process.exit(1);
  }
};

export default connectDatabase;
