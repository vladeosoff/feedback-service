import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(__dirname, '../../data');

export async function ensureDir() {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(path.join(dataDir, 'logs'), { recursive: true });
}

export async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
    try {
        const filePath = path.join(dataDir, filename);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}

export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
    const filePath = path.join(dataDir, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
