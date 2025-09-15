import {invoke} from '@tauri-apps/api/core';
import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';

import Logger from '@/util/logger';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatDate = (date: Date | string | number | null | undefined): string => {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year} ${d.toLocaleTimeString()}`;
};

export const scrollbarStyles = 'overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-accent scrollbar-thumb-rounded-full scrollbar-track-rounded-full [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:bg-transparent [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent hover:[&::-webkit-scrollbar-thumb]:bg-accent';

export async function safeInvoke<T = any>(key: string, payload?: any): Promise<T> {
    try {
        return await invoke<T>(key, payload);
    } catch (error) {
        Logger.error(`Error invoking ${key}:`, error);
        return Promise.reject(error);
    }
}