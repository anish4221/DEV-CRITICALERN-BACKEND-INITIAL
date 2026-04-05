import {Queue, Worker} from 'bullmq';
import {connection } from '../config/redis.js'
import { transporter } from './mailer.js';

const emailQueue = new Queue('emailQueue', {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,      // Remove job after completion
        removeOnFail: false,         // Keep failed jobs for debugging
        attempts: 3,                 // Retry failed jobs 3 times
    },
    streams: {
        events: {
            maxLen: 20              // Keep only last 20 events (prevents growth)
        }
    }
});

const emailWorker = new Worker('emailQueue', async job => {
    const {to, subject, html, text} = job.data;
    console.log(`Sending email to ${to} with subject "${subject}"`);
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        ...(html && { html }),
        ...(text && { text })
    };
    
    await transporter.sendMail(mailOptions);
}, {connection});

emailWorker.on('completed', job => {
    console.log(`Email job ${job.id} completed successfully.`);
});


emailWorker.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed with error:`, err);
});

export {emailQueue};