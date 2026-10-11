import { redis } from '../../config/redis.js';
import VisitCount from '../../model/visitCount/visitCount.js';

export const postVisitCount = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const key = `visitCount:${today}`;

        await redis.incr(key);
        await redis.expire(key, 60 * 60 * 24 * 2);

        res.sendStatus(204);
    } catch (error) {
        console.error('Visitor tracking error:', error);
        res.sendStatus(204);
    }
};

export const getVisitCount = async (req, res) => {
    try {
        const totalVisitors = await VisitCount.find();
        res.status(200).json({
            success: true,
            message: 'Total visitor count retrieved successfully',
            data: totalVisitors,
        });
    } catch (error) {
        console.error('Error retrieving visit count:', error);
        res.status(500).json({
            total: 0,
        });
    }
};

export default getVisitCount;
