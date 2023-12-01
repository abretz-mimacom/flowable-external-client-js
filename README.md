# flowable-external-client-js
An example implementation of Flowable [external-worker-client](https://www.npmjs.com/package/@flowable-oss/external-worker-client), which is meant to execute Flowable tasks from an external worker client.

## Installation 
`npm i`

## Set env variables
`export FLOWABLE_HOST=<your_flowable_work_host>`

`export FLOWABLE_USER=<flowable_user_with_admin_rights>`

`export FLOWABLE_PASS=<flowable_user_password>`

## Build

`npx tcx`

## Run
`node dist/index.js`

## Debugging
Of course, running this application from a terminal is possible, but the real power of using an external client app is to maintain custom code utilizing standard software development practices. As such, running a service in debug external from your Flowable instance is highly powerful and vastly increases development efficiently and quality. To run this example in debug, I recommend using an IDE that supports Node.js runtime configurations. Here is an example run configuration using IntelliJ:
<img width="1034" alt="image" src="https://github.com/abretz-mimacom/flowable-external-client-js/assets/133235099/775d00ba-2945-48e3-a7f0-8a8e6cad463d">

Now, we can set break points to stop the task execution and inspect the runtime variable:
<img width="1341" alt="image" src="https://github.com/abretz-mimacom/flowable-external-client-js/assets/133235099/4c5b41e5-397c-4a51-a447-ce505112367d">

