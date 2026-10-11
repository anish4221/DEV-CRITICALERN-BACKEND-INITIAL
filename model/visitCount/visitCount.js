import mongoose from 'mongoose';

const visitCountSchema = new mongoose.Schema(
    {
        count: {
            type: Number,
            default: 0,
        },
        today: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model('VisitCount', visitCountSchema);