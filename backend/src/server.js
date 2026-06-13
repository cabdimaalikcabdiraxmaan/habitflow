import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 7001;

await testConnection();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});