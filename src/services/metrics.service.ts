import { readJsonFile, writeJsonFile } from '../utils/fileStorage';

interface Metrics {
    totalRequests: number;
    successful: number;
    failed: number;
    sentiments: { positive: number; neutral: number; negative: number };
}

const defaultMetrics: Metrics = { totalRequests: 0, successful: 0, failed: 0, sentiments: { positive: 0, neutral: 0, negative: 0 } };

export class MetricsService {
    async incrementRequest(success: boolean, sentiment?: string) {
        const metrics = await readJsonFile<Metrics>('metrics.json', defaultMetrics);
        metrics.totalRequests += 1;
        if (success) {
            metrics.successful += 1;
            if (sentiment && metrics.sentiments[sentiment as keyof typeof metrics.sentiments] !== undefined) {
                metrics.sentiments[sentiment as keyof typeof metrics.sentiments] += 1;
            } else {
                metrics.sentiments.neutral += 1;
            }
        } else {
            metrics.failed += 1;
        }
        await writeJsonFile('metrics.json', metrics);
    }

    async getMetrics(): Promise<Metrics> {
        return await readJsonFile<Metrics>('metrics.json', defaultMetrics);
    }
}
