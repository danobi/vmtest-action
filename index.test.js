const fs = require('fs');
const tmp = require('tmp');
const vmtest = require('./vmtest');

test('validate image args', async () => {
    const args = {
        name: 'test',
        image: './foo.img',
        uefi: 'true',
        kernel: '',
        kernel_args: '',
        command: '/bin/true',
    };

    const config = tmp.fileSync();
    await vmtest.materializeConfig(args, config.name);
    const contents = fs.readFileSync(config.name, 'utf8');
    const expected = '[[target]]\n' +
        'name = "test"\n' +
        'image = "./foo.img"\n' +
        'uefi = true\n' +
        'command = "/bin/true"';
    expect(contents).toBe(expected);
});

test('validate kernel args', async () => {
    const args = {
        name: 'test',
        image: '',
        uefi: 'false',
        kernel: './bzImage-6.0',
        kernel_args: 'console=ttyS0',
        command: '/bin/true',
    };

    const config = tmp.fileSync();
    await vmtest.materializeConfig(args, config.name);
    const contents = fs.readFileSync(config.name, 'utf8');
    const expected = '[[target]]\n' +
        'name = "test"\n' +
        'kernel = "./bzImage-6.0"\n' +
        'kernel_args = "console=ttyS0"\n' +
        'command = "/bin/true"';
    expect(contents).toBe(expected);
});