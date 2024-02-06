"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const external_worker_client_1 = require("@flowable-oss/external-worker-client");
const node_child_process_1 = require("node:child_process");
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const pg_1 = require("pg");
const axios_1 = __importDefault(require("axios"));
const externalWorkerClient = new external_worker_client_1.ExternalWorkerClient({
    flowableHost: process.env.FLOWABLE_HOST,
    auth: {
        username: process.env.FLOWABLE_USER,
        password: process.env.FLOWABLE_PASS
    }
});
const doWorkSubscription = externalWorkerClient.subscribe({
    topic: "do-work",
    numberOfTasks: 1,
    callbackHandler(job, workResultBuilder) {
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
    callbackHandler(job, workResultBuilder) {
        const COMMAND_FILE = "./command.sh";
        const PEM_FILE = "MSKKeyPair.pem";
        const EXPORT_FILE = "extended_medical_records_export.csv";
        const child = (0, node_child_process_1.exec)("./command.sh MSKKeyPair.pem extended_medical_records_export.csv", (error, stdout, stderr) => {
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
                (0, node_child_process_1.exec)('rm extended_medical_records_export.csv');
                workResultBuilder.success().variable('extractSystem1Result', 'success', 'string');
            });
        });
    }
});
const extractSystem2 = externalWorkerClient.subscribe({
    topic: "extract-system-2",
    numberOfTasks: 10,
    callbackHandler(job, workResultBuilder) {
        const pgClient = new pg_1.Client({
            user: 'flowable',
            host: 'localhost', // or the appropriate host if it's not localhost
            database: 'flowable',
            password: 'flowable',
            port: 5433, // PostgreSQL default port
        });
        pgClient.connect(err => {
            if (err) {
                console.error('Connection error', err.stack);
            }
            else {
                console.log('Connected to PostgreSQL');
            }
        });
        pgClient.query('SELECT * FROM public.act_ru_variable', (err, res) => {
            if (err) {
                console.error('Error executing query', err.stack);
            }
            else {
                //console.log(res.rows); // Output the query results
                workResultBuilder.success(); /*.variable('extractedData', JSON.stringify(res.rows), 'string');*/
            }
            // Close the client when you're done
            pgClient.end();
        });
    }
});
function processFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const readStream = fs_1.default.createReadStream(filePath);
        readStream.pipe((0, csv_parser_1.default)()).on('data', (row) => __awaiter(this, void 0, void 0, function* () {
            console.log(row); // This will log each row of the file
            // You can process each row here
            const url = "https://internal.celigo-demo.projects.flowable.io/dataobject-api/dataobject-runtime/data-object-instances?dataObjectOperationKey=create&dataObjectDefinitionKey=extractedMonthlyRecords";
            yield makePostRequest(url, JSON.stringify(row), 'admin', 'faa@sales');
        })).on('end', () => {
            console.log('CSV file successfully processed');
        });
    });
}
function makePostRequest(url, data, username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        // Encoding username and password for basic auth
        const token = Buffer.from(`${username}:${password}`, 'utf-8').toString('base64');
        try {
            const response = yield axios_1.default.post(url, data, {
                headers: {
                    'Authorization': `Basic ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log(response.data);
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('Error in request:', error.message);
            }
            else {
                console.error('Unexpected error:', error);
            }
        }
    });
}
//# sourceMappingURL=index.js.map