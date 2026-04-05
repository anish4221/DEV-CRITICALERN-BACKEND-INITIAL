import { redis, debugRedisMemory } from './config/redis.js';
import { emailQueue } from './utils/mailqueue.js';

async function debugQueue() {
  console.log('🔍 Checking Queue Status...\n');
  
  // Get job counts
  const counts = await emailQueue.getJobCounts();
  console.log('📋 Job Counts:');
  console.table(counts);
  
  // Get Redis memory info
  await debugRedisMemory();
  
  // Optional: Clean old completed/failed jobs
  console.log('\n🧹 Cleaning old jobs...');
  await emailQueue.clean(0, 100, 'completed');  // Remove completed jobs older than 0ms, keep last 100
  await emailQueue.clean(24 * 3600 * 1000, 0, 'failed');  // Remove failed jobs older than 24h
  
  console.log('✅ Cleanup done!');
  
  process.exit(0);
}

debugQueue().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
