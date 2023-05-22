const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');
const tc = require('@actions/tool-cache');
const fs = require('fs/promises');

// Pin exact vmtest version so user always get the same thing no matter
// when the action is used.
const vmtestVersion = '0.5.5';

// Validate input parameters. Throws an exception on error.
//
// Note we only validate vmtest-action provided parameters. We leave
// the remaining validation to vmtest itself.
async function validateArgs(args) {
    if (args.kernel.length && args.kernel_url.length) {
        throw new Error('Cannot specify both kernel and kernel_url');
    }
    if (args.image.length && args.image_url.length) {
        throw new Error('Cannot specify both image and image_url');
    }
}

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

// Install staticically linked vmtest binary
async function installVmtest() {
    const downloadPath = await tc.downloadTool(`https://github.com/danobi/vmtest/releases/download/v${vmtestVersion}/vmtest-amd64`);
    await fs.chmod(downloadPath, '755');
    await io.cp(downloadPath, '/usr/local/bin/vmtest');
}

async function installPackages() {
    await exec.exec('sudo apt-get update');
    await exec.exec('sudo apt-get install -y qemu-system-x86-64 qemu-guest-agent ovmf');
}

// Install required vmtest dependencies
async function installDependencies() {
    await Promise.all([installVmtest(), installPackages()]);
}

async function materializeConfig(args, configFile, downloadedAssetPath) {
    var lines = [];
    lines.push('[[target]]');
    lines.push(`name = "${args.name}"`);
    if (args.image.length) {
        lines.push(`image = "${args.image}"`);
    } else if (args.image_url.length) {
        lines.push(`image = "${downloadedAssetPath}"`);
    }
    if (args.uefi.toLowerCase() == 'true') {
        lines.push('uefi = true');
    }
    if (args.kernel.length) {
        lines.push(`kernel = "${args.kernel}"`);
    } else if (args.kernel_url.length) {
        lines.push(`kernel = "${downloadedAssetPath}"`);
    }
    if (args.kernel_args.length) {
        lines.push(`kernel_args = "${args.kernel_args}"`);
    }
    // Triple-quoting the command here is necessary to avoid any parsing
    // or escaping issues. We don't want the user command to accidentally
    // terminate our string. We also don't want anything to be accidentally
    // escaped.
    //
    // See: https://toml.io/en/v0.3.0#string
    lines.push(`command = '''${args.command}'''`);

    var contents = lines.join('\n');
    await fs.writeFile(configFile, contents);
}

// Download image/kernel asset if necessary and then materialize vmtest config
async function generateConfig(args, configFile) {
    var downloadPath = null;
    if (args.image_url.length) {
        downloadPath = await tc.downloadTool(args.image_url);
    } else if (args.kernel_url.length) {
        downloadPath = await tc.downloadTool(args.kernel_url);
    }

    await materializeConfig(args, configFile, downloadPath);
}

async function runVmtest(configFile) {
    core.debug(`running vmtest with config file: ${configFile}`);
    await exec.exec(`vmtest --config ${configFile}`);
}

async function main() {
    var args = {
        name: core.getInput('name'),
        image: core.getInput('image'),
        image_url: core.getInput('image_url'),
        uefi: core.getInput('uefi'),
        kernel: core.getInput('kernel'),
        kernel_url: core.getInput('kernel_url'),
        kernel_args: core.getInput('kernel_args'),
        command: core.getInput('command'),
    };

    // Start a collapsable log group
    core.startGroup("Install vmtest");

    core.debug(`args=${JSON.stringify(args)}`);
    await validateArgs(args);

    // Can run these in parallel
    var check = checkOnUbuntu('/etc/os-release');
    var install = installDependencies();
    var generate = generateConfig(args, './vmtest.toml');
    await Promise.all([check, install, generate]);

    // End log group
    core.endGroup();

    // Once above tasks complete, we can run vmtest
    await runVmtest('./vmtest.toml');
}

module.exports = {
    validateArgs,
    checkOnUbuntu,
    materializeConfig,
    main
};
