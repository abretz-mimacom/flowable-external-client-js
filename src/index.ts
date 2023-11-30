import {ExternalWorkerAcquireJobResponse, ExternalWorkerClient, WorkerResultBuilder} from "@flowable-oss/external-worker-client";

const externalWorkerClient = new ExternalWorkerClient({
    flowableHost: 'https://internal.celigo-demo.projects.flowable.io',
    auth: {
        username: 'admin',
        password: 'faa@sales'
    }
});

const subscription = externalWorkerClient.subscribe({
    topic: "do-work",
    numberOfTasks: 1,
    callbackHandler(job: ExternalWorkerAcquireJobResponse, workResultBuilder: WorkerResultBuilder) {
        console.log(`Execute job: ${job.id}`);
        return workResultBuilder.success();
    }
});
