import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    format: winston.format.combine(
        winston.format.json(),
        winston.format.timestamp(),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log'}),
    ],
});
export default logger;