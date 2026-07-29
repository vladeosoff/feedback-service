import { Router } from 'express';
import { handleContact } from '../controllers/contact.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();
const contactSchema = z.object({
    name: z.string()
        .min(2, 'Имя должно содержать минимум 2 символа'),
        // .regex(/^[0-9]+$/, 'Имя не должно содержать цифры'),
    phone: z.string()
        .trim()
        .min(10, 'Некорректный номер телефона'),
        // .regex(/^[a-z]+$/, 'Номер телефона не может содержать буквы'),
    email: z.string().email('Некорректный email'),
    comment: z.string().min(10, 'Комментарий должен содержать минимум 10 символов'),
});

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Отправка формы обратной связи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Иван" }
 *               phone: { type: string, example: "+79990000000" }
 *               email: { type: string, example: "ivan@example.com" }
 *               comment: { type: string, example: "Хочу заказать разработку сайта" }
 *     responses:
 *       200:
 *         description: Успешная отправка
 *       400:
 *         description: Ошибка валидации
 *       429:
 *         description: Превышен лимит запросов
 */
router.post('/', validateRequest(contactSchema), handleContact);
export default router;
