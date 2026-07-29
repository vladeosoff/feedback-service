import app from './app';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './config/logger';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    logger.info(`Swagger docs: ${process.env.API_URL}:${PORT}/api-docs`);
});
