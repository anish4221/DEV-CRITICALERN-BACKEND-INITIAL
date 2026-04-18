import jwt from "jsonwebtoken";

export const generateToken = (userId, name, email) => {
  return jwt.sign(
    { id: userId,
      name: name, // optional (future use)
      email: email, // optional (future use)
     },
    process.env.JWT_SECRET,
    { expiresIn: "14d" }
  );
};
