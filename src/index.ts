import {ExternalWorkerAcquireJobResponse, ExternalWorkerClient, WorkerResultBuilder} from "@flowable-oss/external-worker-client";

const externalWorkerClient = new ExternalWorkerClient({
    flowableHost: '${FLOWABLE_HOST}',
    auth: {
        username: '${FLOWABLE_USER}',
        password: '${FLOWABLE_PASS}'
    }
});

const subscription = externalWorkerClient.subscribe({
    topic: "do-work",
    numberOfTasks: 1,
    callbackHandler(job: ExternalWorkerAcquireJobResponse, workResultBuilder: WorkerResultBuilder) {
        console.log(`Execute job: ${job.id}`);
        console.log('Variables:', job.variables.toString());
        return workResultBuilder.success();
    }
});
