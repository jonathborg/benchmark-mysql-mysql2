const faker = require('faker');
const prettyMilliseconds = require('pretty-ms');
const Table = require('cli-table');
require('colors');
const mysql = require('mysql').createConnection({
    host: 'localhost',
    user: 'root',
    password: 'secret',
    database: 'benchmark',
});
const mysql2 = require('mysql2').createConnection({
    host: 'localhost',
    user: 'root',
    password: 'secret',
    database: 'benchmark',
});

function ms(time) {
    return prettyMilliseconds(time, {
        secondsDecimalDigits: 3,
        millisecondsDecimalDigits: 3,
    })
}

function createLog(name, time) {
    return `${name} - ${ms(time)}`;
}

function benchmark(name, func) {
    return new Promise((resolve, reject) => {
        let start = Date.now();
        func()
            .then()
            .catch((e) => {
                console.error(e.message);
                reject(e);
            })
            .finally(() => {
                const time = Date.now() - start;
                console.log(createLog(name, time));
                resolve(time);
            });
    });
}

async function runBenchmark(bench, times) {
    const results = [];
    for (let i = 0; i < times; i++) {
        const run = await bench();
        results.push(run);
    }
    const result = results.reduce((a, b) => a + b, 0) / times;
    console.log(createLog('average', result).green.bold);
    return result;
}

const data = Array(1000)
        .fill()
        .map(() => [
            null,
            faker.name.findName(),
            faker.address.streetName(),
            faker.address.city(),
            faker.random.number(4000),
            faker.name.jobType(),
            faker.lorem.paragraph(),
        ]);

(async () => {

    console.log('------- MySQL -------'.yellow.bold);
    const mysqlInsert = () => benchmark('inserted 1000 rows', () => {
        return new Promise((resolve, reject) => {
            mysql.query('INSERT INTO benchmark.person VALUES ?', [data], (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
                return;
            });
        });
    });
    const mysqlInsertAvg = await runBenchmark(mysqlInsert, 10);

    const mysqlSelect = () => benchmark('select', () => {
        return new Promise((resolve, reject) => {
            mysql.query('SELECT * FROM benchmark.person', (err, results) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(results);
                return;
            });
        });
    });
    const mysqlSelectAvg = await runBenchmark(mysqlSelect, 10);

    await mysql.query('TRUNCATE TABLE benchmark.person');

    console.log('\n------- MySQL 2 -------'.yellow.bold);
    const mysql2Insert = () => benchmark('inserted 1000 rows', () => {
        return mysql2.promise().query('INSERT INTO benchmark.person VALUES ?', [data])
    });
    const mysql2InsertAvg = await runBenchmark(mysql2Insert, 10);

    const mysql2Select = () => benchmark('select', () => {
        return mysql2.promise().query('SELECT * FROM benchmark.person');
    });
    const mysql2SelectAvg = await runBenchmark(mysql2Select, 10);

    const table = new Table({ head: ['Library', 'Insert', 'Select'] });
    table.push(
        ['MySQL', ms(mysqlInsertAvg), ms(mysqlSelectAvg)],
        ['MySQL 2', ms(mysql2InsertAvg), ms(mysql2SelectAvg)],
    );
    console.log(String(table));
})();
