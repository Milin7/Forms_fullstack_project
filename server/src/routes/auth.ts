import express from "express";
import { User, Session } from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth, AuthRequest } from "../middleware/auth";
import { QueryTypes } from "sequelize";

const router = express.Router();

// Login route
router.post("/login", async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with:", { email, password });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const loginUser = await User.findOne({
      where: { email },
      attributes: { exclude: ["password"] }, // Exclude password directly in the query
    });
    const storedHash = user.get("password");
    console.log("Stored hash in DB:", storedHash);
    console.log("Attempting to compare:", password, "with stored hash");

    const isValid = await bcrypt.compare(password, storedHash);
    console.log("Password comparison result:", isValid);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.get("id"), email: user.get("email"), role: user.get("role") },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, user: loginUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Login failed" });
  }
});

// Get current user (protected route)
router.get("/me", auth, async (req: AuthRequest, res): Promise<any> => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
});

// Logout (protected route)
router.post("/logout", auth, async (req: AuthRequest, res): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    await Session.destroy({ where: { token } });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// Logout from all devices
router.post(
  "/logout-all",
  auth,
  async (req: AuthRequest, res): Promise<any> => {
    try {
      await Session.destroy({ where: { userId: req.user?.id } });
      res.json({ message: "Logged out from all devices" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  }
);

// Change password route
router.post(
  "/change-password",
  auth,
  async (req: AuthRequest, res): Promise<any> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user?.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const storedHash = user.get("password");
      const isValid = await bcrypt.compare(currentPassword, storedHash);

      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Generate new hash
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);

      // Verify hash before saving
      const preUpdateTest = await bcrypt.compare(newPassword, newHash);
      console.log("Pre-update verification:", {
        newPassword,
        newHash,
        verified: preUpdateTest,
      });

      if (!preUpdateTest) {
        return res.status(400).json({ error: "Hash verification failed" });
      }

      // Update using raw query to prevent any model transformation
      await user.sequelize?.query(
        'UPDATE "Users" SET password = ? WHERE id = ?',
        {
          replacements: [newHash, user.get("id")],
          type: QueryTypes.UPDATE,
        }
      );

      // Verify stored hash
      const updatedUser = await User.findByPk(req.user?.id);
      const finalHash = updatedUser?.get("password");

      console.log("Post-update verification:", {
        newPassword,
        finalHash,
        verified: await bcrypt.compare(newPassword, finalHash),
      });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(400).json({ error: "Failed to change password" });
    }
  }
);

export default router;
