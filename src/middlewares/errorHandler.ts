import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });

    if (err.message === 'RATE_LIMIT_EXCEEDED') {
        return res.status(429).json({ error: 'Слишком много запросов. Пожалуйста, попробуйте позже.' });
    }
    if (err.message === 'Failed to send email notifications') {
        return res.status(500).json({ error: 'Ошибка при отправке уведомления. Попробуйте позже.' });
    }

    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};
