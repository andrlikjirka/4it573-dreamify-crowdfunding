import mongoose from "mongoose";

const MONGODB_URL = `mongodb://mongo:27017`;

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL, {
            user: process.env.DB_USER,
            pass: process.env.DB_PASSWORD,
            dbName: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME : process.env.DB_NAME
        });
        console.log('Connected to database');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
