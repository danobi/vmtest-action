const fs = require('fs');
const tmp = require('tmp');
const vmtest = require('./vmtest');

test('validate good args', async () => {
    const args = {
        kernel: './bzimage',
        kernel_url: '',
        kernel_args: 'console=ttyS0',
        image: '',
        image_url: '',
        command: '/bin/echo hello',
    };
    expect(async () => {
        await vmtest.validateArgs(args)
    }).not.toThrow();
});

test('validate bad args', async () => {
    const badKernelArgs = {
        kernel: './bzimage',
        kernel_url: 'https://example.com/bzimage',
        kernel_args: 'console=ttyS0',
        image: '',
        image_url: '',
        command: '/bin/echo hello',
    };
    await expect(vmtest.validateArgs(badKernelArgs)).rejects.toThrow('Cannot specify both');

    const badImageArgs = {
        kernel: '',
        kernel_url: '',
        kernel_args: '',
        image: './image',
        image_url: 'https://example.com/image',
        command: '/bin/echo hello',
    };
    await expect(vmtest.validateArgs(badImageArgs)).rejects.toThrow('Cannot specify both');
});

test('test os-release ubuntu22', async () => {
    const osRelease = tmp.fileSync();
    const osReleaseContents = 'ID=ubuntu\n' +
        'PRETTY_NAME="Ubuntu 22.04.2 LTS"\n' +
        'NAME="Ubuntu"\n' +
        'VERSION_ID="22.04"\n' +
        'VERSION="22.04.2 LTS (Jammy Jellyfish)"\n' +
        'VERSION_CODENAME=jammy\n' +
        'ID=ubuntu\n' +
        'ID_LIKE=debian\n' +
        'HOME_URL="https://www.ubuntu.com/"\n' +
        'SUPPORT_URL="https://help.ubuntu.com/"\n' +
        'BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\n' +
        'PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"\n' +
        'UBUNTU_CODENAME=jammy\n';
    fs.writeFileSync(osRelease.name, osReleaseContents);
    expect(async () => {
        await vmtest.checkOnUbuntu(osRelease.name)
    }).not.toThrow();
});

test('test os-release ubuntu20', async () => {
    const osRelease = tmp.fileSync();
    const osReleaseContents = 'NAME="Ubuntu"\n' +
        'VERSION="20.04.6 LTS (Focal Fossa)"\n' +
        'ID=ubuntu\n' +
        'ID_LIKE=debian\n' +
        'PRETTY_NAME="Ubuntu 20.04.6 LTS"\n' +
        'VERSION_ID="20.04"\n' +
        'HOME_URL="https://www.ubuntu.com/"\n' +
        'SUPPORT_URL="https://help.ubuntu.com/"\n' +
        'BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\n' +
        'PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"\n' +
        'VERSION_CODENAME=focal\n' +
        'UBUNTU_CODENAME=focal\n';
    fs.writeFileSync(osRelease.name, osReleaseContents);
    expect(async () => {
        await vmtest.checkOnUbuntu(osRelease.name)
    }).not.toThrow();
});

test('test os-release arch linux', async () => {
    const osRelease = tmp.fileSync();
    const osReleaseContents = 'NAME="Arch Linux"\n' +
        'PRETTY_NAME="Arch Linux"\n' +
        'ID=arch\n' +
        'BUILD_ID=rolling\n' +
        'ANSI_COLOR="38;2;23;147;209"\n' +
        'HOME_URL="https://archlinux.org/"\n' +
        'DOCUMENTATION_URL="https://wiki.archlinux.org/"\n' +
        'SUPPORT_URL="https://bbs.archlinux.org/"\n' +
        'BUG_REPORT_URL="https://bugs.archlinux.org/"\n' +
        'PRIVACY_POLICY_URL="https://terms.archlinux.org/docs/privacy-policy/"\n' +
        'LOGO=archlinux-logo\n';
    fs.writeFileSync(osRelease.name, osReleaseContents);
    await expect(vmtest.checkOnUbuntu(osRelease.name)).rejects.toThrow("only works on Ubuntu runners");
});

test('test invalid os-release', async () => {
    const osRelease = tmp.fileSync();
    const osReleaseContents = 'asdfasdf'
    fs.writeFileSync(osRelease.name, osReleaseContents);
    await expect(vmtest.checkOnUbuntu(osRelease.name)).rejects.toThrow("Invalid line in");
});

test('materialize image args', async () => {
    const args = {
        name: 'test',
        image: './foo.img',
        image_url: '',
        uefi: 'true',
        kernel: '',
        kernel_url: '',
        kernel_args: '',
        command: '/bin/true',
    };

    const config = tmp.fileSync();
    await vmtest.materializeConfig(args, config.name, null);
    const contents = fs.readFileSync(config.name, 'utf8');
    const expected = '[[target]]\n' +
        'name = "test"\n' +
        'image = "./foo.img"\n' +
        'uefi = true\n' +
        'command = "/bin/true"';
    expect(contents).toBe(expected);
});

test('materialize downloaded image args', async () => {
    const args = {
        name: 'test',
        image: '',
        image_url: 'https://example.com/image',
        uefi: 'true',
        kernel: '',
        kernel_url: '',
        kernel_args: '',
        command: '/bin/true',
    };

    const config = tmp.fileSync();
    await vmtest.materializeConfig(args, config.name, '/tmp/image');
    const contents = fs.readFileSync(config.name, 'utf8');
    const expected = '[[target]]\n' +
        'name = "test"\n' +
        'image = "/tmp/image"\n' +
        'uefi = true\n' +
        'command = "/bin/true"';
    expect(contents).toBe(expected);
});

test('materialize kernel args', async () => {
    const args = {
        name: 'test',
        image: '',
        image_url: '',
        uefi: 'false',
        kernel: './bzImage-6.0',
        kernel_url: '',
        kernel_args: 'console=ttyS0',
        command: '/bin/true',
    };

    const config = tmp.fileSync();
    await vmtest.materializeConfig(args, config.name, null);
    const contents = fs.readFileSync(config.name, 'utf8');
    const expected = '[[target]]\n' +
        'name = "test"\n' +
        'kernel = "./bzImage-6.0"\n' +
        'kernel_args = "console=ttyS0"\n' +
        'command = "/bin/true"';
    expect(contents).toBe(expected);
});

test('materialize downloaded kernel args', async () => {
    const args = {
        name: 'test',
        image: '',
        image_url: '',
        uefi: 'false',
        kernel: '',
        kernel_url: 'https://example.com/bzImage-6.0',
        kernel_args: 'console=ttyS0',
        command: '/bin/true',
    };

    const config = tmp.fileSync();
    await vmtest.materializeConfig(args, config.name, '/tmp/bzImage-6.0');
    const contents = fs.readFileSync(config.name, 'utf8');
    const expected = '[[target]]\n' +
        'name = "test"\n' +
        'kernel = "/tmp/bzImage-6.0"\n' +
        'kernel_args = "console=ttyS0"\n' +
        'command = "/bin/true"';
    expect(contents).toBe(expected);
});