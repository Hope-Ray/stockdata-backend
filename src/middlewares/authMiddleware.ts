import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Define the shape of the JWT payload (user info)
interface DecodedToken {
  userId: string;
  role: string;
}

// Middleware to verify JWT token and user role
export const authMiddleware = (allowedRoles: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req: any, res: Response, next: NextFunction): void => {
    // Extract the token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Access denied. No token provided." });
      return; // End the request here, no need to call next()
    }

    try {
      // Verify the token and decode the payload
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as DecodedToken;

      // Attach decoded user info to the request object
      req.user = decoded;

      // Check if the user's role is in the allowedRoles array
      if (!allowedRoles.includes(decoded.role)) {
        res.status(403).json({ message: "Access denied." });
        return; // End the request here, no need to call next()
      }

      // Proceed to the next middleware or route handler
      next();
    } catch (ex) {
      res.status(400).json({ message: "Invalid token." });
    }
  };
};
