import { Router } from "express";
import Template from "../models/Template";
import Question from "../models/Question";
import { auth, AuthRequest } from "../middleware/auth";
import { Op } from "sequelize";

const router = Router();

// Create template
router.post("/", auth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { title, description, isPublic, questions } = req.body;

    // Validate input
    if (!title || title.trim() === "") {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ error: "At least one question is required" });
      return;
    }

    // Create template first
    const template = await Template.create({
      title,
      description,
      isPublic,
      userId: req.user!.id,
    });

    // Create questions without specifying IDs
    if (questions && questions.length > 0) {
      try {
        await Question.bulkCreate(
          questions.map((q: any, index: number) => ({
            title: q.title,
            description: q.description,
            type: q.type,
            required: q.required,
            options: q.options,
            order: index,
            templateId: template.id,
          }))
        );
      } catch (error) {
        console.error("Question creation error:", error);
        await template.destroy();
        throw error;
      }
    }

    // Fetch the complete template with questions
    const templateWithQuestions = await Template.findByPk(template.id, {
      include: [Question],
      order: [[Question, "order", "ASC"]],
    });

    res.status(201).json(templateWithQuestions);
  } catch (error) {
    console.error("Template creation error:", error);
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "Failed to create template",
    });
  }
});

// Get all templates (with optional filtering)
router.get("/", auth, async (req: AuthRequest, res) => {
  try {
    const templates = await Template.findAll({
      include: [Question],
      order: [[Question, "order", "ASC"]],
      where: {
        [Op.or]: [{ userId: req.user!.id }, { isPublic: true }],
      },
    });
    res.json(templates);
  } catch (error) {
    console.error("Template fetch error:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Get single template
router.get("/:id", auth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const template = await Template.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [{ userId: req.user!.id }, { isPublic: true }],
      },
      include: [Question],
      order: [[Question, "order", "ASC"]],
    });

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch template" });
  }
});

// Update template
router.put("/:id", auth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const template = await Template.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    const { title, description, isPublic, questions } = req.body;

    // Update template
    await template.update({
      title,
      description,
      isPublic,
    });

    if (questions) {
      // Delete existing questions
      await Question.destroy({
        where: { templateId: template.id },
      });

      // Create new questions
      await Question.bulkCreate(
        questions.map((q: any, index: number) => ({
          ...q,
          templateId: template.id,
          order: index,
        }))
      );
    }

    // Fetch updated template with questions
    const updatedTemplate = await Template.findByPk(template.id, {
      include: [Question],
      order: [[Question, "order", "ASC"]],
    });

    res.json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ error: "Failed to update template" });
  }
});

// Delete template
router.delete("/:id", auth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const template = await Template.findOne({
      where: {
        id: req.params.id,
        userId: req.user!.id,
      },
    });

    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    await template.destroy();
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// Reorder questions
router.put(
  "/:id/reorder",
  auth,
  async (req: AuthRequest, res): Promise<void> => {
    try {
      const template = await Template.findOne({
        where: {
          id: req.params.id,
          userId: req.user!.id,
        },
      });

      if (!template) {
        res.status(404).json({ error: "Template not found" });
        return;
      }

      const { questionOrder } = req.body;

      // Update question orders
      await Promise.all(
        questionOrder.map((questionId: number, index: number) => {
          return Question.update(
            { order: index },
            {
              where: {
                id: questionId,
                templateId: template.id,
              },
            }
          );
        })
      );

      // Fetch updated template with questions
      const updatedTemplate = await Template.findByPk(template.id, {
        include: [Question],
        order: [[Question, "order", "ASC"]],
      });

      res.json(updatedTemplate);
    } catch (error) {
      res.status(400).json({ error: "Failed to reorder questions" });
    }
  }
);

export default router;
