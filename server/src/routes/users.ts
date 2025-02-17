import { Router, Request, Response } from "express";
import { User } from "../models";
import bcrypt from "bcrypt";
import { auth } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";
import { checkRole } from "../middleware/checkRole";

const router = Router();

// GET all users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
    console.log("users");
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST create user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.create({
      email,
      password,
      role,
    });
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: "Failed to create user" });
  }
});

// Test route to verify password
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const isValid = await bcrypt.compare(password, user.get("password"));
    res.json({ isValid });
  } catch (error) {
    res.status(400).json({ error: "Verification failed" });
  }
});

//Protected route - Get user profile
router.get("/profile", auth, async (req: AuthRequest, res): Promise<any> => {
  try {
    const user = await User.findByPk(req.user?.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Admin only - Get all users
router.get(
  "/admin/users",
  auth,
  checkRole(["admin"]),
  async (req: AuthRequest, res): Promise<any> => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// Admin only - Delete user
router.delete(
  "/admin/users/:id",
  auth,
  checkRole(["admin"]),
  async (req: AuthRequest, res): Promise<any> => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await user.destroy();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

export default router;
