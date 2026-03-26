import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      user: req.user || null, 
      responseTime: `${duration}ms`,
    };

    logger.info("Request Log", logData);
  });

  next();
};