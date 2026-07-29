import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service';

const contactService = new ContactService();

export const handleContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const result = await contactService.processContactForm(ip, req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
