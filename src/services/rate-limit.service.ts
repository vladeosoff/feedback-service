import { readJsonFile, writeJsonFile } from '../utils/fileStorage';

interface RateLimitRecord { count: number; resetTime: number; }
type RateLimitStore = Record<string, RateLimitRecord>;

export class RateLimitService {
    async isAllowed(ip: string): Promise<boolean> {
        const store = await readJsonFile<RateLimitStore>('rate-limits.json', {});
        const now = Date.now();
        const record = store[ip];

        if (!record || now > record.resetTime) {
            store[ip] = { count: 1, resetTime: now + Number(process.env.RATE_LIMIT_WINDOW_MS) || 5 };
            await writeJsonFile('rate-limits.json', store);
            return true;
        }

        if (record.count >= Number(process.env.RATE_LIMIT_MAX)) return false;

        record.count += 1;
        await writeJsonFile('rate-limits.json', store);
        return true;
    }
}
