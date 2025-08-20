// services/MockRecordService.ts
import type {DataType} from "../app/types.tsx";

export const getRecords = async (): Promise<DataType[]> => {
    const res = await fetch('/api/record/list');
    const json = await res.json();
    return json.data;
};

export const addRecord = async (record: Omit<DataType, 'key'>): Promise<DataType> => {
    const res = await fetch('/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
    });
    return res.json();
};

export const editRecord = async (key: string, updated: Omit<DataType, 'key'>): Promise<boolean> => {
    const res = await fetch(`/api/record/edit?key=${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
    });
    return res.json();
};

export const deleteRecord = async (key: string): Promise<boolean> => {
    const res = await fetch(`/api/record/delete?key=${key}`, {
        method: 'DELETE',
    });
    return res.json();
};
