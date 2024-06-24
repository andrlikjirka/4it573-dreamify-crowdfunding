import mongoose from "mongoose";
import {User} from "./src/model/user.model.js";
import bcryptjs from "bcryptjs";
import {Dream} from "./src/model/dream.model.js";
import {fileURLToPath} from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path:  path.resolve(__dirname, 'app.env') });

const seed = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017', {
        user: process.env.DB_USER,
        pass: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME
    });

    const admin = new User({
        name: 'Admin Adminovič',
        email: 'admin@email.cz',
        role: 'admin',
        paypal_address: 'admin@personal.example.com',
        hash: await bcryptjs.hash('admin', 10)
    });
    await admin.save();

    const user = new User({
        name: 'Jirka Andrlík',
        email: 'j@email.cz',
        paypal_address: 'jirka@personal.example.com',
        hash: await bcryptjs.hash('jirka', 10)
    });
    await user.save();

    const dream1 = new Dream({
        name: 'Chci procestovat svět',
        summary: 'Chci procestovat svět',
        category: 'travelling',
        description: '<p>Mým snem je procestovat svět</p>',
        goal: 35000,
        dueDate: '2024-07-31T00:00:00.000Z',
        status: 'approved',
        author: {
            author_id: user._id,
            author_name: user.name
        }
    });
    dream1.photos.push({name: 'file-1719177890550-383056361.jpeg'});
    await dream1.save();

    const dream2 = new Dream({
        name: 'Debutové album',
        summary: 'Nahrání debutového alba',
        category: 'music',
        description: '<p>Mým snem je nahrát debutové album.</p>',
        goal: 20000,
        dueDate: '2024-08-20T00:00:00.000Z',
        status: 'approved',
        author: {
            author_id: user._id,
            author_name: user.name
        }
    });
    dream2.photos.push({name: 'file-1719177931425-713086509.jpeg'});
    await dream2.save();

    const dream3 = new Dream({
        name: 'Lampionový průvod',
        summary: 'Uspořádat lampionový průvod',
        category: 'entertainment',
        description: '<p>Mým snem je uspořádat lampiónový průvod v Praze.</p>',
        goal: 10000,
        dueDate: '2024-10-31T00:00:00.000Z',
        status: 'approved',
        author: {
            author_id: user._id,
            author_name: user.name
        }
    });
    dream3.photos.push({name: 'file-1719178047901-249733558.jpeg'});
    await dream3.save();
}

try {
    await seed()
    console.log('database seeded successfuly')
    process.exit(1);
} catch(err) {
    console.error(err.message)
}