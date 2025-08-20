// services/StorageRecordService.ts
import type { DataType } from '../app/types';

const STORAGE_KEY = 'records';

export const getRecords = async (): Promise<DataType[]> => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);

    const res = await fetch(`${import.meta.env.BASE_URL}record-list.json`);
    const data: DataType[] = await res.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
};

export const addRecord = async (record: Omit<DataType, 'key'>): Promise<DataType> => {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newRecord = { ...record, key: String(Date.now()) };
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return newRecord;
};

export const editRecord = async (key: string, updated: Omit<DataType, 'key'>): Promise<boolean> => {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = records.findIndex((r: DataType) => r.key === key);
    if (index === -1) return false;
    records[index] = { key, ...updated };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
};

export const deleteRecord = async (key: string): Promise<boolean> => {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = records.filter((r: DataType) => r.key !== key);
    const changed = filtered.length !== records.length;
    if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
    return changed;
};
