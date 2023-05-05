const vmtest = require('./vmtest');

test('validate valid args', async () => {
    const args = {
        name: 'test',
        image: './foo.img',
        uefi: 'true',
        kernel: '',
        kernel_args: '',
        command: '/bin/true',
    };

    await vmtest.materializeConfig(args, './vmtest.toml');
    // XXX: add actual test logic
});