import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import type Question from "./Question";

class Template extends Model {
  declare id: number;
  declare title: string;
  declare description: string;
  declare isPublic: boolean;
  declare userId: number;
  declare questions?: Question[];
}

Template.init(
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
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Template",
    tableName: "Templates",
  }
);

export default Template;
