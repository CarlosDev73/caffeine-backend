
import dotenv from 'dotenv';
dotenv.config();

export default {
  mongodb: {
    url: process.env.MONGODB_URI, // Load the URL from .env
    databaseName: 'Test1',         // Specify the database name
  },
  migrationsDir: 'migrations', // Directory where migration files are stored
  changelogCollectionName: 'changelog', // Collection to track migration history
  migrationFileExtension: ".cjs",
};
