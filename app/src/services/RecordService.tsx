import type { DataType } from '../app/types';
import { findIndex, remove, cloneDeep } from 'lodash';

const STORAGE_KEY = 'records';

function getLocalRecords(): DataType[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

export async function getRecords(): Promise<DataType[]> {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);

    const res = await fetch(`${import.meta.env.BASE_URL}record-list.json`);
    const data: DataType[] = await res.json();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
}

export function addRecord(newRecord: Omit<DataType, 'key'>): DataType {
    const records = cloneDeep(getLocalRecords());
    const record: DataType = {
        ...newRecord,
        key: String(Date.now()),
    };
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return record;
}

export function deleteRecord(key: string): boolean {
    const records = cloneDeep(getLocalRecords());
    const initialLength = records.length;

    remove(records, r => r.key === key);

    const changed = records.length !== initialLength;
    if (changed) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
    return changed;
}

export function editRecord(key: string, updated: Omit<DataType, 'key'>): boolean {
    const records = cloneDeep(getLocalRecords());
    const index = findIndex(records, r => r.key === key);
    if (index === -1) return false;

    records[index] = { key, ...updated };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
}
