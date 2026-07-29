import { Router } from 'express';
import contactRoutes from './contact.routes';
import healthRoutes from './health.routes';
import metricsRoutes from './metrics.routes';

const router = Router();
router.use('/health', healthRoutes);
router.use('/metrics', metricsRoutes);
router.use('/contact', contactRoutes);

export default router;
