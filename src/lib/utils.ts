import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseSizeToBytes(sizeStr: string): number {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const regex = /(\d+(\.\d+)?)\s*(B|KB|MB|GB|TB)/i;
    const match = sizeStr.match(regex);

    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[3].toUpperCase();
    const power = units.indexOf(unit);

    return value * Math.pow(1024, power);
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
