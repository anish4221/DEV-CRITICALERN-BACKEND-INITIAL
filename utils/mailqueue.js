import { Queue, Worker } from 'bullmq';
import { connection, redis } from '../config/redis.js';
import { transporter } from './mailer.js';
import VisitCount from '../model/visitCount/visitCount.js';

const emailQueue = new Queue('emailQueue', {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
    },
    streams: {
        events: {
            maxLen: 20,
        },
    },
});

const emailWorker = new Worker(
    'emailQueue',
    async (job) => {
        const { to, subject, html, text } = job.data;
        console.log(`Sending email to ${to} with subject "${subject}"`);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            ...(html && { html }),
            ...(text && { text }),
        };

        await transporter.sendMail(mailOptions);
    },
    { connection }
);

emailWorker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed successfully.`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed with error:`, err);
});

const visitorQueue = new Queue('visitorQueue', {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
    },
    streams: {
        events: {
            maxLen: 20,
        },
    },
});

await visitorQueue.upsertJobScheduler(
    'visitor-batch-sync',
    { every: 60 * 1000 },
    {
        name: 'sync-visitors',
        data: {},
    }
);

const visitorWorker = new Worker(
    'visitorQueue',
    async () => {
        try {
            const today = new Date().toISOString().slice(0, 10);
            const key = `visitCount:${today}`;
            const count = await redis.getset(key, '0');
            const batchCount = Number(count || 0);

            if (batchCount <= 0) {
                console.log('No visitors to sync.');
                return;
            }

            console.log(`Processing visitor batch: ${batchCount}`);

            await VisitCount.updateOne(
                { today },
                { $inc: { count: batchCount } },
                { upsert: true }
            );

            console.log(`${batchCount} visitors saved to MongoDB.`);
        } catch (error) {
            console.error('Visitor batch processing failed:', error);
            throw error;
        }
    },
    { connection }
);

visitorWorker.on('completed', (job) => {
    console.log(`Visitor job ${job.id} completed successfully.`);
});

visitorWorker.on('failed', (job, err) => {
    console.error(`Visitor job ${job.id} failed with error:`, err);
});

export { emailQueue, visitorQueue };