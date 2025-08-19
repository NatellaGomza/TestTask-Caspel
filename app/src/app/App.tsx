import React, {useEffect, useState} from 'react';
import {Button, Space, Table, Modal, Form, Input, InputNumber, DatePicker, Row, Popconfirm} from 'antd';
import type {TableProps} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import styles from './styles.module.scss';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { debounce } from 'lodash';
import type {DataType} from "./types.tsx";

dayjs.extend(utc);
dayjs.extend(timezone);

type CustomColumn = NonNullable<TableProps<DataType>['columns']>[number] & {
    inputType?: 'text' | 'number' | 'date';
    title: string,
    dataIndex: string,
    sorter?: (a: DataType, b: DataType) => number;
    validation?: (rule: any, value: any) => Promise<void>;
};

const validators: Record<string, (rule: any, value: any) => Promise<void>> = {
    name: (_: any, value: string) => {
        const isOnlyLetters = /^[A-Za-zА-Яа-яЁё\s]+$/.test(value);
        if (isOnlyLetters && value.length < 51) return Promise.resolve();
        return Promise.reject(new Error('Поле может содержать только буквы и знак пробела. Длина не должна превышать 50 символов'));
    },
    date: (_: any, value: dayjs.Dayjs | null) => {
        if (!value) return Promise.reject('Дата обязательна');
        if (value.isBefore('2000-01-01')) return Promise.reject('Дата должна быть после 01.01.2000');
        return Promise.resolve();
    },
    amount: (_: any, value: unknown) => {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        if (!isNaN(num) && num > 0 && num < 1001) return Promise.resolve();
        return Promise.reject(new Error('Введите число от 1 до 1000'));
    }
};

const App: React.FC = () => {
        const [dataSource, setDataSource] = useState<DataType[]>([]);
        const [filteredData, setFilteredData] = useState<DataType[]>([]);
        const [openModal, setOpenModal] = useState<boolean>(false);
        const [searchText, setSearchText] = useState<string>('');
        const [loadingData, setLoadingData] = useState<boolean>(false);
        const [recordToEdit, setRecordToEdit] = useState<string>('');
        const [form] = Form.useForm();

        const columns: CustomColumn[] = [
            {
                title: "Имя",
                dataIndex: 'name',
                key: 'name',
                inputType: 'text',
                sorter: (a: DataType, b: DataType) => a.name.localeCompare(b.name),
                validation: validators.name,
            },
            {
                title: 'Дата',
                dataIndex: 'date',
                key: 'date',
                inputType: 'date',
                sorter: (a: DataType, b: DataType) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                validation: validators.date
            },
            {
                title: 'Количество',
                dataIndex: 'amount',
                key: 'amount',
                inputType: 'number',
                sorter: (a: DataType, b: DataType) => a.amount - b.amount,
                validation: validators.amount,

            },
            {
                title: 'Действие',
                key: 'action',
                dataIndex: 'action',
                render: (_, record) => (
                    <Space size="middle">
                        <EditOutlined
                            onClick={() => {
                                setOpenModal(true);
                                setRecordToEdit(record.key);
                                form.setFieldsValue({
                                    ...record,
                                    date: dayjs(record.date, 'DD.MM.YYYY'),
                                });

                            }}
                        />
                        <Popconfirm
                            title={'Вы действительно хотите удалить запись?'}
                            onConfirm={() => handleDelete(record.key)}
                        >
                            <DeleteOutlined style={{color: 'red'}}/>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        const modalFields = columns.filter(col => col.inputType);

        useEffect(() => {
            getList();
        }, []);

        useEffect(() => {
            setFilteredData(dataSource);
        }, [dataSource]);

        const getList = () => {
            setLoadingData(true)
            fetch('/api/record/list')
                .then(res => res.json())
                .then(data => {
                    setDataSource(data.data);
                })
                .finally(() => setLoadingData(false));
        }

        const handleSearch = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearchText(value);

            const filtered = dataSource.filter(item =>
                Object.values(item).some(val =>
                    typeof val === 'string' || typeof val === 'number'
                        ? String(val).toLowerCase().includes(value.toLowerCase())
                        : false
                )
            );

            setFilteredData(filtered);
        }, 300);

        const handleDelete = (key: string) => {
            fetch(`/api/record/delete?key=${key}`, {
                method: 'DELETE',
            })
                .then(res => res.json())
                .then(result => {
                    if (result.code === 0) {
                        console.log('Удалено:', key);
                        setSearchText('');
                        getList();
                    } else {
                        console.error('Ошибка удаления');
                    }
                });
        };

        const handleOk = async () => {
            try {
                await form.validateFields();
            } catch (e) {
                console.log(e);
                return;
            }

            const newRecord = form.getFieldsValue();
            if (newRecord.date) {
                newRecord.date = dayjs(newRecord.date).tz('Europe/Minsk').format('DD.MM.YYYY');
            }
            const url = recordToEdit ? `/api/record/edit?key=${recordToEdit}` : '/api/record'

            setLoadingData(true);
            fetch(url, {
                method: recordToEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRecord),
            })
                .then(response => response.json())
                .then(result => {
                    if (result.code === 0) {
                        form.resetFields();
                        setRecordToEdit('');
                        setOpenModal(false);
                        setSearchText('');
                        getList();
                    } else {
                        console.error(result.message);
                    }
                })
                .catch(error => console.error('Ошибка запроса:', error))
                .finally(() => setLoadingData(false));
        }

        return (<div className={styles.wrapper}>
            <Row wrap={false}>
                <Button
                    type={'primary'}
                    icon={<PlusOutlined/>}
                    onClick={() => setOpenModal(true)}
                    className={styles.btn}
                >
                    Добавить
                </Button>
                <Input
                    placeholder="Поиск"
                    value={searchText}
                    onChange={handleSearch}
                    allowClear
                />
            </Row>
            <Modal
                open={openModal}
                onCancel={() => {
                    setOpenModal(false);
                    form.resetFields();
                    setRecordToEdit('');
                }}
                title={recordToEdit.length ? "Редактировать запись" : "Добавить запись"}
                okText={"Сохранить"}
                cancelText={"Отмена"}
                onOk={() => handleOk()}
                okButtonProps={{
                    loading: loadingData,
                }}
            >
                <Form layout="vertical" form={form}>
                    {modalFields.map(col => (
                        <Form.Item
                            label={col.title}
                            name={col.dataIndex}
                            key={col.key}
                            rules={[{
                                validator: col.validation,
                            }]}
                        >
                            {col.inputType === 'number' ? <InputNumber style={{width: '100%'}}/> :
                                col.inputType === 'date' ? <DatePicker format="DD.MM.YYYY" style={{width: '100%'}}/> :
                                    <Input maxLength={50}/>
                            }
                        </Form.Item>
                    ))}
                </Form>
            </Modal>
            <Table<DataType> className={styles.table} columns={columns} dataSource={filteredData} loading={loadingData}/>
        </div>)
    }
;

export default App;