import { Queue, Worker, QueueEvents } from "bullmq";
import { connection } from "../config/redis.js";
import StudentFeedback from "../model/Pgmodel/FeedFormStore.js";

// 1. Define BullMQ Queue for Feedback Submissions
export const feedbackQueue = new Queue("feedbackQueue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true, // Auto clean completed jobs
    removeOnFail: false,    // Keep failed jobs for inspection
    attempts: 3,            // Retry 3 times if DB write fails
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// 2. QueueEvents listener so controllers can await job.waitUntilFinished(queueEvents)
export const feedbackQueueEvents = new QueueEvents("feedbackQueue", { connection });

// 3. Worker to process feedback jobs 1-by-1 (concurrency: 1)
export const feedbackWorker = new Worker(
  "feedbackQueue",
  async (job) => {
    console.log(`[Queue] Processing feedback submission job ${job.id} for: ${job.data.fullName}`);

    // Save to PostgreSQL table
    const feedback = await StudentFeedback.create(job.data);

    console.log(`[Queue] Successfully saved feedback ID ${feedback.id} for ${feedback.fullName}`);
    return feedback;
  },
  {
    connection,
    concurrency: 10, // Processes up to 10 feedback writes concurrently in background
  }
);

feedbackWorker.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} finished successfully.`);
});

feedbackWorker.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job?.id} failed with error:`, err?.message);
});
