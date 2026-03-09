import validator from 'validator';
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({ 
    FullName: {
        type: String,
        required: [true, 'Full Name is required'],
        trim: true
    },
    EmailAddress: {  
        type: String,
        required: [true, 'Email Address is required'],
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please enter a valid email address'
        }
    },      
    PhoneNo: {
    type: String,
    required: [true, 'Phone Number is required'],
    trim: true,
    set: v => v.replace(/\s+/g, ''),
    validate: {
      validator: function (v) {
        // Use validator.js built-in phone check
        return validator.isMobilePhone(v, 'any', { strictMode: false });
      },
      message: 'Please enter a valid phone number'
    }
  },

    Message: {
        type: String,       
        required: [true, 'Message is required'],
        trim: true
    },
    createdAt: {
    type: Date,
    default: Date.now
  }});

export const Contact = mongoose.model('Contact', contactSchema);
