import express from "express";
import { User, Session } from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth, AuthRequest } from "../middleware/auth";
import { Op } from "sequelize";

const router = express.Router();

//Find user by id
const findUserById = async (id: number) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
  });
  if (!user) throw new Error("User not found");
  return user;
};

const verifyPassword = async (
  inputPassword: string,
  hashedPassword: string
) => {
  const isValid = await bcrypt.compare(inputPassword, hashedPassword);
  if (!isValid) throw new Error("Invalid password");
  return isValid;
};

// Login route
router.post("/login", async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.get("password"));
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.get("id"), email: user.get("email"), role: user.get("role") },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    // Create session record
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    await Session.create({
      userId: user.get("id"),
      token: token,
      lastUsed: new Date(),
      expiresAt: expiresAt,
    });

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Login failed" });
  }
});

// Change password (protected route)
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

      await verifyPassword(currentPassword, user.get("password"));

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await user.update({ password: hashedPassword });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      const message =
        error.message === "Invalid password"
          ? "Current password is incorrect"
          : "Failed to change password";
      res.status(400).json({ error: message });
    }
  }
);

// Get current user (protected route)
router.get("/me", auth, async (req: AuthRequest, res): Promise<any> => {
  try {
    const user = await findUserById(req.user?.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
});

// Request password reset
router.post("/forgot-password", async (req, res): Promise<any> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user.get("id") },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // In a real app, send this via email
    // For now, just return it
    res.json({
      message: "Password reset token generated",
      resetToken,
    });
  } catch (error) {
    res.status(400).json({ error: "Failed to generate reset token" });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res): Promise<any> => {
  try {
    const { resetToken, newPassword } = req.body;
    console.log(resetToken);
    console.log("New password being set:", newPassword);

    if (newPassword.length < 6 || newPassword.length > 20) {
      return res
        .status(400)
        .json({ error: "Password must be between 6 and 20 characters long." });
    }

    // Verify reset token
    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET as string
    ) as any;
    const user = await User.findByPk(decoded.id);
    console.log("Reset token:", resetToken);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.update({ password: hashedPassword });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }
    console.log(error);
    res.status(400).json({ error: "Failed to reset password" });
  }
});

// Logout from current device
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

// Get active sessions
router.get("/sessions", auth, async (req: AuthRequest, res): Promise<any> => {
  try {
    console.log("Fetching sessions for user:", req.user); // Log user info
    const sessions = await Session.findAll({
      where: {
        userId: req.user?.id,
        expiresAt: {
          [Op.gt]: new Date(), // Only get non-expired sessions
        },
      },
    });
    res.json(sessions);
  } catch (error) {
    console.error("Session fetch error:", error); // Log the error
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

export default router;
