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
        default: 'waiting',
        enum: ['waiting', 'approved', 'cancelled', 'successful', 'failed']
    },
    dueDate: {
        type: Date,
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
    photos: {
        type: [
            {
                name: {
                    type: String,
                    required: true
                }
            }
        ],
        validate: {
            validator: function(array) {
                return array.length >= 1; // Minimum array length of 1
            },
            message: props => `Array of dream photos must have at least 1 element.`
        }
    },
    showed: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

dreamSchema.virtual('dateDiff').get(function() {
    const currentDate = new Date();
    return Math.ceil((this.dueDate - currentDate) / (1000 * 60 * 60 * 24));
});

export const Dream = mongoose.model('Dream', dreamSchema);
