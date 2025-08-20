import * as mock from './MockRecordService';
import * as storage from './StorageRecordService';

const isLocal = window.location.hostname === 'localhost';
const isDev = import.meta.env.MODE === 'development';

const useMock = isLocal || isDev;

const service = useMock ? mock : storage;

export const getRecords = service.getRecords;
export const addRecord = service.addRecord;
export const editRecord = service.editRecord;
export const deleteRecord = service.deleteRecord;
