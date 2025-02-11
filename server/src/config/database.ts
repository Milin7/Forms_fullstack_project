import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default sequelize;
