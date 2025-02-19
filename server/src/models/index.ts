import User from "./User";
import Session from "./Session";
import Template from "./Template";
import Question from "./Question";
import sequelize from "../config/database";

// Define relationships after all models are initialized
Template.belongsTo(User, { foreignKey: "userId" });
Template.hasMany(Question, { foreignKey: "templateId", onDelete: "CASCADE" });
Question.belongsTo(Template, { foreignKey: "templateId" });

// Export all models
export { User, Session, Template, Question };

// Sync database
export const syncDatabase = async () => {
  try {
    const options = { alter: true };
    await sequelize.sync(options); // Sync all models at once
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
    // Log the full error for debugging
    console.error("Full error:", JSON.stringify(error, null, 2));
  }
};
