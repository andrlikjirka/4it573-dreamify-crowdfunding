import mongoose from "mongoose";

const MONGODB_URL = `mongodb://127.0.0.1:27017`;

export const connectDB = async () => {

    try {
        await mongoose.connect(MONGODB_URL, {
            user: process.env.DB_USER,
            pass: process.env.DB_PASSWORD,
            dbName: 'crowdfunding'
        });
        console.log('Connected to database');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }

}
