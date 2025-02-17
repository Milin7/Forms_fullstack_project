import User from "./User";
import Session from "./Session";

// Export models
export { User, Session };

// Sync database
export const syncDatabase = async () => {
  try {
    await User.sync();
    await Session.sync();
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};
