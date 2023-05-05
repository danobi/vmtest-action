const core = require('@actions/core');
const fs = require('fs/promises');

// Check if the current runner is ubuntu. If not, throws an exception
async function checkOnUbuntu(osRelease) {
    const data = await fs.readFile(osRelease, {
        encoding: 'utf8'
    });
    const lines = data.toString().split('\n');

    for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split('=');
        if (parts[0] == 'ID' && parts[1] == 'ubuntu') {
            return;
        }
    }

    throw new Error('This action only works on Ubuntu runners');
}

// Install required vmtest dependencies
async function installDependencies() {}

async function materializeConfig(args, configFile) {}

async function runVmtest(configFile) {}

async function main() {
    var args = {
        name: core.getInput('name'),
        image: core.getInput('image'),
        uefi: core.getInput('uefi').toLowerCase() === 'true',
        kernel: core.getInput('kernel'),
        kernel_args: core.getInput('kernel_args'),
        command: core.getInput('command'),
    };

    core.debug(`args=${JSON.stringify(args)}`);
    await checkOnUbuntu('/etc/os-release');
    await installDependencies();
    await materializeConfig(args, './vmtest.toml');
    await runVmtest('./vmtest.toml');
}

module.exports = {
    checkOnUbuntu,
    materializeConfig,
    main
};
