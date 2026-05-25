import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    throw new Error("Tolong definisikan MONGODB_URL di dalam file .env.local");
}

export const hubungkanDatabase = async () => {
    try {
        if (mongoose.connection.readyState >= 1) return;

        await mongoose.connect(MONGODB_URI);
        console.log("🚀 Berhasil terhubung ke MongoDb!");
    } catch (error) {
        console.log("❌ Gagal terhunung ke MongoDB: ", error);
    }
};