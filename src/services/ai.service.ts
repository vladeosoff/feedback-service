import { Mistral } from '@mistralai/mistralai';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../config/logger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Используем правильную переменную для Mistral
const client = process.env.MISTRAL_API_KEY
    ? new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
    : null;

export class AIService {
    async analyzeAndReply(comment: string): Promise<{ sentiment: string; aiReply: string }> {
        const fallback = {
            sentiment: 'neutral',
            aiReply: 'Спасибо за ваше обращение. Мы свяжемся с вами в ближайшее время.'
        };

        // Проверка наличия клиента
        if (!client) {
            logger.warn('Mistral API ключ не найден. Используется fallback-ответ.');
            return fallback;
        }

        // Проверка комментария
        if (!comment || comment.trim().length === 0) {
            logger.warn('Пустой комментарий. Используется fallback-ответ.');
            return fallback;
        }

        try {
            const response = await client.chat.complete({
                model: 'mistral-large-latest',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты полезный ассистент. Проанализируй тональность комментария (выбери одно: positive, neutral, negative) и составь краткий вежливый ответ на русском языке (максимум 2 предложения). Верни ответ СТРОГО в формате JSON: {"sentiment": "positive|neutral|negative", "aiReply": "текст ответа"}'
                    },
                    { role: 'user', content: comment }
                ],
                responseFormat: { type: "json_object" },
                temperature: 0.3,
                maxTokens: 100,
            });

            // Безопасное извлечение контента
            const message = response?.choices?.[0]?.message;

            if (!message) {
                logger.warn('Пустой ответ от Mistral API');
                return fallback;
            }

            // Обработка разных типов content
            let content: string = '';

            if (typeof message.content === 'string') {
                content = message.content;
            } else if (Array.isArray(message.content)) {
                // Если content - массив, извлекаем текст из chunks
                content = message.content
                    .map(chunk => {
                        if (typeof chunk === 'string') return chunk;
                        if (chunk && typeof chunk === 'object' && 'text' in chunk) {
                            return chunk.text;
                        }
                        return '';
                    })
                    .join('');
            } else {
                logger.warn('Неизвестный тип content от Mistral');
                return fallback;
            }

            if (!content || content.trim().length === 0) {
                logger.warn('Пустой content от Mistral');
                return fallback;
            }

            // Безопасный парсинг JSON
            let parsed;
            try {
                parsed = JSON.parse(content);
            } catch (parseError) {
                logger.error('Ошибка парсинга JSON от Mistral:', parseError);
                logger.debug('Полученный контент:', content);

                // Пробуем извлечь JSON из текста
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsed = JSON.parse(jsonMatch[0]);
                    } catch {
                        return fallback;
                    }
                } else {
                    return fallback;
                }
            }

            // Валидация полей
            if (!parsed.sentiment || !parsed.aiReply) {
                logger.warn('Невалидная структура ответа от Mistral:', parsed);
                return fallback;
            }

            // Нормализация тональности
            const validSentiments = ['positive', 'neutral', 'negative'];
            const sentiment = validSentiments.includes(parsed.sentiment)
                ? parsed.sentiment
                : 'neutral';

            return {
                sentiment: sentiment,
                aiReply: String(parsed.aiReply).trim() || fallback.aiReply
            };

        } catch (error: any) {
            // Детальное логирование ошибки
            logger.error('Ошибка Mistral API:', {
                message: error?.message || 'Unknown error',
                status: error?.statusCode || error?.status,
                code: error?.code,
                stack: error?.stack
            });

            // Graceful fallback
            return fallback;
        }
    }
}