import React, {useEffect, useState} from 'react';
import {Button, Space, Table, Modal, Form, Input, InputNumber, DatePicker} from 'antd';
import type {TableProps} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';

interface DataType {
    key: string;
    name: string;
    date: string;
    amount: number;
}

type CustomColumn = NonNullable<TableProps<DataType>['columns']>[number] & {
    inputType?: 'text' | 'number' | 'date';
    title: string,
    dataIndex: string,
    required: boolean,
};

const App: React.FC = () => {
    const [dataSource, setDataSource] = useState<DataType[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [disabled, setDisabled] = useState<boolean>(true);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [form] = Form.useForm();

    const columns: CustomColumn[] = [
        {
            title: "Имя",
            dataIndex: 'name',
            key: 'name',
            inputType: 'text',
            required: true,
        },
        {
            title: 'Дата',
            dataIndex: 'date',
            key: 'date',
            inputType: 'date',
            required: true,
        },
        {
            title: 'Количество',
            dataIndex: 'amount',
            key: 'amount',
            inputType: 'number',
            required: true,
        },
        {
            title: 'Action',
            key: 'action',
            dataIndex: 'action',
            required: false,
            render: (_, record) => (
                <Space size="middle">
                    <EditOutlined/>
                    <DeleteOutlined style={{color: 'red'}}/>
                </Space>
            ),
        },
    ];

    const modalFields = columns.filter(col => col.inputType);

    useEffect(() => {
        getList();
    }, []);

    const getList = () => {
        setLoadingData(true)
        fetch('/api/record/list')
            .then(res => res.json())
            .then(data => {
                setDataSource(data.data);
                setLoadingData(false);
            });
    }

    const handleOk = async () => {
        try {
            await form.validateFields();
        } catch (e) {
            console.log(e);
            return;
        }

        const newRecord = form.getFieldsValue();

        setLoadingData(true);
        fetch('/api/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newRecord),
        })
            .then(response => response.json())
            .then(result => {
                if (result.code === 0) {
                    setLoadingData(false);
                    form.resetFields();
                    setOpenModal(false);
                    getList();
                } else {
                    console.error('Ошибка при добавлении');
                }
            })
            .catch(error => console.error('Ошибка запроса:', error));
    }

    return (<>
        <Button type={'primary'} icon={<PlusOutlined/>} onClick={() => setOpenModal(true)}>Добавить</Button>
        <Modal
            open={openModal}
            onCancel={() => {
                setOpenModal(false);
                form.resetFields();
            }}
            title={"Добавить запись"}
            okText={"Добавить"}
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
                        rules={[{required: col.required, message: "Поле обязательно для заполнения"}]}
                    >
                        {col.inputType === 'number' ? <InputNumber style={{width: '100%'}}/> :
                            col.inputType === 'date' ? <DatePicker style={{width: '100%'}}/> :
                                <Input/>
                        }
                    </Form.Item>
                ))}
            </Form>
        </Modal>
        <Table<DataType> columns={columns} dataSource={dataSource} loading={loadingData}/>
    </>)
};

export default App;