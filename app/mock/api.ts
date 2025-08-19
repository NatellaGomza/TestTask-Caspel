const mockData: DataType[] = [
    {key: '1', name: 'John Brown', date: '01.08.2025', amount: '1'},
    {key: '2', name: 'Emily Clark', date: '02.08.2025', amount: '3'},
    {key: '3', name: 'Michael Smith', date: '03.08.2025', amount: '2'},
    {key: '4', name: 'Olga Ivanova', date: '04.08.2025', amount: '5'},
    {key: '5', name: 'David Lee', date: '05.08.2025', amount: '4'},
    {key: '6', name: 'Anna Petrova', date: '06.08.2025', amount: '2'},
    {key: '7', name: 'James Wilson', date: '07.08.2025', amount: '6'},
    {key: '8', name: 'Irina Sokolova', date: '08.08.2025', amount: '1'},
    {key: '9', name: 'Robert Taylor', date: '09.08.2025', amount: '3'},
    {key: '10', name: 'Natalia Romanova', date: '10.08.2025', amount: '2'},
    {key: '11', name: 'Chris Evans', date: '11.08.2025', amount: '4'},
    {key: '12', name: 'Maria Kuznetsova', date: '12.08.2025', amount: '5'},
    {key: '13', name: 'Daniel Craig', date: '13.08.2025', amount: '1'},
    {key: '14', name: 'Sofia Volkova', date: '14.08.2025', amount: '3'},
    {key: '15', name: 'Victor Bondarenko', date: '15.08.2025', amount: '2'},
];

function randomDelay(min = 500, max = 2000) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default [
    {
        url: '/api/record/list',
        method: 'get',
        timeout: randomDelay(),
        response: () => ({
            code: 0,
            data: mockData,
        }),
    },
    {
        url: '/api/record',
        method: 'post',
        timeout: randomDelay(),
        response: ({ body }) => {
            const newRecord = {
                ...body,
                key: String(Date.now()),
            };
            mockData.push(newRecord);
            return {
                code: 0,
                data: newRecord,
            };
        },
    },
];
