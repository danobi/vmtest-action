const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs/promises');

// Check if the current runner is ubuntu. If not, throws an exception
async function checkOnUbuntu(osRelease) {
    const data = await fs.readFile(osRelease, {
        encoding: 'utf8'
    });
    const lines = data.toString().split('\n');

    for (var i = 0; i < lines.length; i++) {
        if (lines[i].length == 0) {
            continue;
        }
        var parts = lines[i].split('=');
        if (parts.length != 2) {
            throw new Error(`Invalid line in ${osRelease}: ${lines[i]}`);
        }
        if (parts[0] == 'ID' && parts[1] == 'ubuntu') {
            return;
        }
    }

    throw new Error('This action only works on Ubuntu runners');
}

async function installVmtest() {
    await exec.exec(`bash -c "curl https://sh.rustup.rs -s | sh -s -- -y"`);
    await exec.exec('cargo install vmtest');
}

async function installPackages() {
    await exec.exec('sudo apt-get update');
    await exec.exec('sudo apt-get install -y qemu-system-x86-64 ovmf');
}

// Install required vmtest dependencies
async function installDependencies() {
    await Promise.all([installVmtest(), installPackages()]);
}

async function materializeConfig(args, configFile) {
    var lines = [];
    lines.push('[[target]]');
    lines.push(`name = "${args.name}"`);
    if (args.image.length) {
        lines.push(`image = "${args.image}"`);
    }
    if (args.uefi.toLowerCase() == 'true') {
        lines.push('uefi = true');
    }
    if (args.kernel.length) {
        lines.push(`kernel = "${args.kernel}"`);
    }
    if (args.kernel_args.length) {
        lines.push(`kernel_args = "${args.kernel_args}"`);
    }
    lines.push(`command = "${args.command}"`);

    var contents = lines.join('\n');
    await fs.writeFile(configFile, contents);
}

async function runVmtest(configFile) {
    core.debug(`running vmtest with config file: ${configFile}`);
    await exec.exec(`vmtest --config ${configFile}`);
}

async function main() {
    var args = {
        name: core.getInput('name'),
        image: core.getInput('image'),
        uefi: core.getInput('uefi'),
        kernel: core.getInput('kernel'),
        kernel_args: core.getInput('kernel_args'),
        command: core.getInput('command'),
    };
    core.debug(`args=${JSON.stringify(args)}`);

    // Can run these in parallel
    var check = checkOnUbuntu('/etc/os-release');
    var install = installDependencies();
    var materialize = materializeConfig(args, './vmtest.toml');
    await Promise.all([check, install, materialize]);

    // Once above tasks complete, we can run vmtest
    await runVmtest('./vmtest.toml');
}

module.exports = {
    checkOnUbuntu,
    materializeConfig,
    main
};
