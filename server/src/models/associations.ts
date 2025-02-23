import Template from "./Template";
import Question from "./Question";

// Define associations
export function setupAssociations() {
  Template.hasMany(Question, {
    foreignKey: "templateId",
    as: "questions",
    onDelete: "CASCADE",
  });

  Question.belongsTo(Template, {
    foreignKey: "templateId",
    as: "template",
  });
}
