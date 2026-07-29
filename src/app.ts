import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './config/logger';
import { ensureDir } from './utils/fileStorage';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

app.set('trust proxy', 1); // Для корректного определения IP за прокси (Render, Railway и т.д.)
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: { title: 'Feedback API', version: '1.0.0', description: 'API для формы обратной связи с AI-интеграцией' },
        servers: [{ url: `${process.env.API_URL}:${process.env.PORT}` }],
    },
    apis: ['./src/routes/*.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.use(errorHandler);

ensureDir().then(() => logger.info('Data directories initialized'));

export default app;
