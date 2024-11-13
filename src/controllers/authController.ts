import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../dbConfig/db";
import { Request, Response } from "express";

// Predefined roles for validation
const VALID_ROLES = ["user1", "user2", "user3"];

// Register User
export const register = async (req: Request, res: Response): Promise<void> => {
  const { username, password, role } = req.body;

  // Validate input fields
  if (!username || !password || !role) {
    res
      .status(400)
      .json({ message: "Username, password, and role are required." });
    return;
  }

  // Check if role is valid
  if (!VALID_ROLES.includes(role)) {
    res
      .status(400)
      .json({ message: "Invalid role. Please provide a valid role." });
    return;
  }

  try {
    // Check if username already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      // eslint-disable-next-line prettier/prettier
      [username]
    );
    if (userExists.rows.length > 0) {
      res
        .status(409)
        .json({ message: "Username already exists. Please choose another." });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
      // eslint-disable-next-line prettier/prettier
      [username, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error registering user:", error);

    // Cast error to a type with optional code property
    const typedError = error as Error & { code?: string };

    if (typedError.code === "23505") {
      res
        .status(409)
        .json({ message: "Username already exists. Please choose another." });
    } else {
      res
        .status(500)
        .json({ message: "An unexpected error occurred during registration." });
    }
  }
};

// Login User
export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      // eslint-disable-next-line prettier/prettier
      [username]
    );

    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      // eslint-disable-next-line prettier/prettier
      { expiresIn: "2h" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
};
