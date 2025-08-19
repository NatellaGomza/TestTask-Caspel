import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import {ConfigProvider} from "antd";
import ruRU from 'antd/es/locale/ru_RU';
dayjs.locale('ru');


createRoot(document.getElementById('root')!).render(
    <ConfigProvider locale={ruRU}>
        <StrictMode>
            <App/>
        </StrictMode>
    </ConfigProvider>,
)
