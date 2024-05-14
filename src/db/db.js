import mongoose from "mongoose";

const user = 'and'
const password = 'and'

const MONGODB_URL = `mongodb://127.0.0.1:27017`;

export const connectDB = async () => {

    try {
        await mongoose.connect(MONGODB_URL, {
            user: user,
            pass: password,
            dbName: 'crowdfunding'
        });
        console.log('Connected to database');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }

}
