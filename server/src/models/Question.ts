import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Question extends Model {
  declare id: number;
  declare title: string;
  declare description: string;
  declare type: "string" | "text" | "integer" | "checkbox";
  declare required: boolean;
  declare order: number;
  declare options: string[];
  declare templateId: number;
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("string", "text", "integer", "checkbox"),
      allowNull: false,
    },
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    options: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Templates",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Question",
    tableName: "Questions",
  }
);

export default Question;
