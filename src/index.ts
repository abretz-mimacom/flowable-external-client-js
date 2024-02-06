import {ExternalWorkerAcquireJobResponse, ExternalWorkerClient, WorkerResultBuilder} from "@flowable-oss/external-worker-client";
import {EngineRestVariableType} from "@flowable-oss/external-worker-client/dist/engine-rest-variable";
import { exec } from "node:child_process";
import fs from 'fs';
import csv from 'csv-parser';
import { Client } from "pg";
import axios from 'axios'

const externalWorkerClient = new ExternalWorkerClient({
    flowableHost: process.env.FLOWABLE_HOST,
    auth: {
        username: process.env.FLOWABLE_USER,
        password: process.env.FLOWABLE_PASS
    }
});

const doWorkSubscription = externalWorkerClient.subscribe({
    topic: "do-work",
    numberOfTasks: 1,
    callbackHandler(job: ExternalWorkerAcquireJobResponse, workResultBuilder: WorkerResultBuilder) {
        console.log(`Execute job: ${job.id}`);
        console.log('Variables:', JSON.stringify(job.variables));
        return workResultBuilder.success()
            .variable('result', 'do-work-completed', 'string')
            .variable('someJson', '{value1:"test"}', 'json')
            .variable('someDouble', '4', 'string');
    }
});

const extractSystem1 = externalWorkerClient.subscribe({
    topic: "extract-system-1",
    numberOfTasks: 10,
    callbackHandler( job: ExternalWorkerAcquireJobResponse, workResultBuilder: WorkerResultBuilder) {
        const COMMAND_FILE = "./command.sh";
        const PEM_FILE = "MSKKeyPair.pem";
        const EXPORT_FILE = "extended_medical_records_export.csv";
        const child =  exec("./command.sh MSKKeyPair.pem extended_medical_records_export.csv", (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return;
            }
            console.log(`Stdout: ${stdout}`);
            processFile(EXPORT_FILE).then(() => {
                exec('rm extended_medical_records_export.csv');
                workResultBuilder.success().variable('extractSystem1Result', 'success', 'string');
            });

        });
    }
});

const extractSystem2 = externalWorkerClient.subscribe({
    topic: "extract-system-2",
    numberOfTasks: 10,
    callbackHandler(job: ExternalWorkerAcquireJobResponse, workResultBuilder: WorkerResultBuilder) {
        const pgClient = new Client({
            user: 'flowable',
            host: 'localhost', // or the appropriate host if it's not localhost
            database: 'flowable',
            password: 'flowable',
            port: 5433, // PostgreSQL default port
        });


        pgClient.connect(err => {
            if (err) {
                console.error('Connection error', err.stack);
            } else {
                console.log('Connected to PostgreSQL');
            }
        });

        pgClient.query('SELECT * FROM public.act_ru_variable', (err, res) => {
            if (err) {
                console.error('Error executing query', err.stack);
            } else {
                //console.log(res.rows); // Output the query results
                workResultBuilder.success();/*.variable('extractedData', JSON.stringify(res.rows), 'string');*/
            }

            // Close the client when you're done
            pgClient.end();
        });
    }
});

async function processFile(filePath: string) {
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(csv()).on('data', async (row) => {
            console.log(row); // This will log each row of the file
            // You can process each row here
            const url = "https://internal.celigo-demo.projects.flowable.io/dataobject-api/dataobject-runtime/data-object-instances?dataObjectOperationKey=create&dataObjectDefinitionKey=extractedMonthlyRecords"
            await makePostRequest(url, JSON.stringify(row), 'admin', 'faa@sales');
    }).on('end', () => {
            console.log('CSV file successfully processed');
    });
}

async function makePostRequest(url: string, data: any, username: string, password: string) {
    // Encoding username and password for basic auth
    const token = Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Basic ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error in request:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
}
