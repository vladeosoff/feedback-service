import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../config/logger';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export class EmailService {
    private transporter!: nodemailer.Transporter;

    constructor() {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Ethereal (test mode)
            this.initEthereal();
        }
    }

    private async initEthereal() {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    async sendNotifications(data: { name: string, email: string, phone: string, comment: string, aiReply: string }) {
        try {
            const mailOptions = {
                toRecipient:
                    await this.transporter.sendMail({
                        from: `'"Feedback Form"<${process.env.SMTP_USER || 'owner@example.com'}>'`,
                        to: process.env.EMAIL_TO,
                        subject: `'Новое сообщение от ${data.name}'`,
                        text: `Имя: ${data.name}\nEmail: ${data.email}\nНомер телефона: ${data.phone}\nКомментарий: ${data.comment}\nAi анализ: ${data.aiReply}`,
                    }),

                toClient:
                    await this.transporter.sendMail({
                        from: `"Feedback Form" <${process.env.SMTP_USER || 'owner@example.com'}>`,
                        to: data.email,
                        subject: 'Мы получили Ваше сообщение',
                        text: `Здравствуйте, ${data.name}\n\n${data.aiReply}\n\nМы свяжемся с Вами в ближайшее время.`,
                    }),
            }
            // in case of using Ethereal
            const clientPreviewUrl = nodemailer.getTestMessageUrl(mailOptions.toClient);
            if (clientPreviewUrl) {
                console.log(`Email preview URL: ${clientPreviewUrl}`);
            }
            const recipientPreviewUrl = nodemailer.getTestMessageUrl(mailOptions.toRecipient);
            if (recipientPreviewUrl) {
                console.log(`Email preview URL: ${recipientPreviewUrl}`);
            }

            logger.info(`Emails успешно отправлены: ${data.email} и ${process.env.EMAIL_TO}`);
        } catch (error) {
            logger.error('Ошибка отправки email', error);
            throw new Error('Failed to send email notifications');
        }
    }
}
