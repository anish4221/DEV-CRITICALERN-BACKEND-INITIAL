
import jwt from "jsonwebtoken";

export const authorize = (req, res) => {
  const authHeader = req.headers.authorization;

  // Token missing
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "User is authorized",
      user: decoded
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
