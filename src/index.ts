import {ExternalWorkerAcquireJobResponse, ExternalWorkerClient, WorkerResultBuilder} from "@flowable-oss/external-worker-client";
import {EngineRestVariableType} from "@flowable-oss/external-worker-client/dist/engine-rest-variable";

const externalWorkerClient = new ExternalWorkerClient({
    flowableHost: process.env.FLOWABLE_HOST,
    auth: {
        username: process.env.FLOWABLE_USER,
        password: process.env.FLOWABLE_PASS
    }
});

const subscription = externalWorkerClient.subscribe({
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
