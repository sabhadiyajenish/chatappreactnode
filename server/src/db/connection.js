import mongoose from "mongoose";
import { DBname } from "../utils/constant.js";
const connection = async () => {
    try {
        const mongoConnect = await mongoose.connect(`${process.env.MONGO_URI}/${DBname}`);
        console.log(`DataBase Connected !! ${mongoConnect.connection.host}`);
    } catch (error) {
        console.log("MongoDb connection ERRor", error);
        process.exit();
    }
};

export default connection;