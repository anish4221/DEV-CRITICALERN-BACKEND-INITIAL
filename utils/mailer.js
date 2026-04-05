//const nodemailer = require('nodemailer');
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config();

export const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

