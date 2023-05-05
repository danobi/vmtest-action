const core = require('@actions/core');
const github = require('@actions/github');

try {
    const name = core.getInput('name');
    const image = core.getInput('image');
    const uefi = core.getInput('uefi');
    const kernel = core.getInput('kernel');
    const kernel_args = core.getInput('kernel_args');
    const command = core.getInput('command');

    console.log(`name=${name}, image=${image}, uefi=${uefi}, kernel=${kernel}, kernel_args=${kernel_args}, command=${command}`);

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
} catch (error) {
    core.setFailed(error.message);
}