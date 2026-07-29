import { RateLimitService } from './rate-limit.service';
import { AIService } from './ai.service';
import { EmailService } from './email.service';
import { MetricsService } from './metrics.service';
import { logger } from '../config/logger';

export class ContactService {
    private rateLimitService = new RateLimitService();
    private aiService = new AIService();
    private emailService = new EmailService();
    private metricsService = new MetricsService();

    async processContactForm(ip: string, data: { name: string; phone: string; email: string; comment: string }) {
        const isAllowed = await this.rateLimitService.isAllowed(ip);
        if (!isAllowed) {
            await this.metricsService.incrementRequest(false);
            throw new Error('RATE_LIMIT_EXCEEDED');
        }

        try {
            const aiResult = await this.aiService.analyzeAndReply(data.comment);
            await this.emailService.sendNotifications({ ...data, aiReply: aiResult.aiReply });
            await this.metricsService.incrementRequest(true, aiResult.sentiment);

            logger.info(`Форма успешно обработана для IP: ${ip}`);
            return { message: 'Ваше сообщение успешно отправлено.', aiReply: aiResult.aiReply, sentiment: aiResult.sentiment };
        } catch (error) {
            await this.metricsService.incrementRequest(false);
            logger.error(`Ошибка обработки формы для IP: ${ip}`, error);
            throw error;
        }
    }
}
