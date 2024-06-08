import mongoose from "mongoose";
import {User} from "./user.model.js";
import {Dream} from "./dream.model.js";

const contributionSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    contributedAt: {
        type: Date,
        default: Date.now()
    },
    contributor: {
        contributor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: User,
            required: true
        },
        contributor_name: {
            type: String,
            required: true
        }
    },
    dream: {
        dream_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: Dream,
            required: true
        },
        dream_name: {
            type: String,
            required: true
        }
    },
    payment: {
        payment_id: {
            type: String,
            //required: true
        },
        payment_status: {
            type: String,
            //required: true,
            enum: ['PENDING', 'COMPLETED', 'DECLINED']
        }
    }
});

export  const Contribution = mongoose.model('Contribution', contributionSchema);