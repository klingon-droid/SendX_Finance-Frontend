import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const db = await mongoose.connect(MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    
    mongoose.connection.on('disconnected', () => {
      connection.isConnected = 0;
    });

    mongoose.connection.on('reconnected', () => {
      connection.isConnected = 1;
    });

  } catch (error: any) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

export default dbConnect;
