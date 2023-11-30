"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const external_worker_client_1 = require("@flowable-oss/external-worker-client");
const externalWorkerClient = new external_worker_client_1.ExternalWorkerClient({
    flowableHost: 'https://internal.celigo-demo.projects.flowable.io',
    auth: {
        username: 'admin',
        password: 'faa@sales'
    }
});
const subscription = externalWorkerClient.subscribe({
    topic: "do-work",
    numberOfTasks: 1,
    callbackHandler(job, workResultBuilder) {
        console.log(`Execute job: ${job.id}`);
        return workResultBuilder.success();
    }
});
//# sourceMappingURL=index.js.map