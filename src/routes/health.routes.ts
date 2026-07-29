import { Router, Request, Response } from 'express';
const router = Router();
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Проверка статуса сервиса
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Сервис работает
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-07-29T08:41:04.464Z
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
export default router;
