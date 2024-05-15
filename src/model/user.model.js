import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
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
        default: 'dreamer',
        enum: ['dreamer', 'admin'],
        required: true
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