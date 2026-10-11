import mongoose from 'mongoose';


const internshipLinkSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    link: {
        type: String,
        required: [true, 'Link is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+/.test(v);
            },
        }
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: false,
    }
})
export const InternshipLink = mongoose.model('InternshipLink', internshipLinkSchema);