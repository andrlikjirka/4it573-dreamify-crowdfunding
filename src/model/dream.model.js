import mongoose from "mongoose";
import {User} from "./user.model.js";

const dreamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 255
    },
    summary: {
        type: String,
        required: true
    },
    // TODO: category???
    description: {
        type: String
    },
    goal: {
        type: Number,
        required: true,
        min: 1,
        max: 999999999
    },
    pledged: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        default: 'approved',
        enum: ['waiting', 'approved', 'cancelled', 'successful', 'failed']
    },
    dueDate: {
        type: Date,
        min: new Date(Date.now()),
        required: true,
    },
    author: {
        author_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
            required: true
        },
        author_name: {
            type: String,
            required: true
        }
    },
    // TODO: photos (array)???
    showed: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

export const Dream = mongoose.model('Dream', dreamSchema);
