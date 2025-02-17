import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Session extends Model {
  declare id: number;
  declare userId: number;
  declare token: string;
  declare expiresAt: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Session",
  }
);

export default Session;
