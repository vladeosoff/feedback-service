import { Router, Request, Response } from 'express';
import { MetricsService } from '../services/metrics.service';
const router = Router();
const metricsService = new MetricsService();
/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Получение статистики обращений
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Успешный ответ со статистикой
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: number
 *                   example: 150
 *                 successfulRequests:
 *                   type: number
 *                   example: 142
 *                 failedRequests:
 *                   type: number
 *                   example: 8
 *                 sentiments:
 *                   type: object
 *                   properties:
 *                     positive:
 *                       type: number
 *                       example: 85
 *                     neutral:
 *                       type: number
 *                       example: 40
 *                     negative:
 *                       type: number
 *                       example: 17
 *                 rateLimits:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: number
 *                       example: 3
 *                     totalBlocked:
 *                       type: number
 *                       example: 12
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        res.status(200).json(await metricsService.getMetrics());
    } catch {
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});
export default router;
