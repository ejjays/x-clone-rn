import { getAuth } from "@clerk/express";

export const protectRoute = (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - you must be logged in" });
    }
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - invalid auth context" });
  }
};
