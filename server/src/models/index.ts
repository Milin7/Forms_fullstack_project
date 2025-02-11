import User from "./User";

// Export models
export { User };

// Sync database
export const syncDatabase = async () => {
  try {
    await User.sync();
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};
