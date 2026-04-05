import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();
export const connection = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  ...(process.env.REDIS_USE_TLS === 'true' && { 
    tls: {
      rejectUnauthorized: false
    } 
  })
};

// Optional: test connection
const redis = new Redis(connection);
redis.on('connect', () => console.log('✅ Connected to Redis Cloud'));
redis.on('error', (err) => console.error('❌ Redis error:', err));

// Debug function to check Redis memory usage
export async function debugRedisMemory() {
  const keys = await redis.keys('bull:emailQueue:*');
  console.log('\n📊 Redis Keys Report:');
  console.log('Total keys:', keys.length);
  
  // Group by key type
  const keyTypes = {};
  for (const key of keys.slice(0, 50)) {  // Check first 50 keys
    const type = await redis.type(key);
    const memory = await redis.memory('USAGE', key);
    keyTypes[key] = { type, memory };
  }
  
  console.table(keyTypes);
  
  // Check events stream length
  const eventsLen = await redis.xlen('bull:emailQueue:events');
  console.log('Events stream length:', eventsLen);
  
  return keys;
}

export { redis };
