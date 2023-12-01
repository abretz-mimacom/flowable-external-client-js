"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const external_worker_client_1 = require("@flowable-oss/external-worker-client");
const externalWorkerClient = new external_worker_client_1.ExternalWorkerClient({
    flowableHost: process.env.FLOWABLE_HOST,
    auth: {
        username: process.env.FLOWABLE_USER,
        password: process.env.FLOWABLE_PASS
    }
});
const subscription = externalWorkerClient.subscribe({
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
//# sourceMappingURL=index.js.map