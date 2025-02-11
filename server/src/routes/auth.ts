import express from "express";
import { User } from "../models";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth, AuthRequest } from "../middleware/auth";

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

    await verifyPassword(password, user.get("password"));

    const token = jwt.sign(
      { id: user.get("id"), email: user.get("email"), role: user.get("role") },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
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

export default router;
