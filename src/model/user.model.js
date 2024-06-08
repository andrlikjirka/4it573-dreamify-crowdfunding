import mongoose from "mongoose";
import {userRoles} from "../utils.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 1,
        maxLength: 255,
        required: true,
    },
    email: {
        type: String,
        maxLength: 255,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Invalid email address format',
        },
    },
    hash: {
        type: String,
        unique: true,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        enum: Array.from(userRoles.keys()),
        required: true
    },
    paypal_address: {
        type: String,
        unique: true
    },
    blocked: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

export const User = mongoose.model('User', userSchema);