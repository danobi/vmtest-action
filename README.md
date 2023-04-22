# vmtest-action

This action wraps [vmtest][0] with a standard Github Actions interface to make
it easy to plug `vmtest` into your CI.

## Usage

See [action.yml][1] for full manifest.

### Inputs

* `name`
    * Optional field.
    * Name for vmtest target.
* `image`
    * Optional field.
    * Path or URL to virtual machine image. Optional field, but one of `image` or `kernel` must be specified.
* `uefi`
    * Optional field.
    * Whether to use UEFI boot or not.
* `kernel`
    * Optional field.
    * Path or URL to kernel. Typically named `vmlinuz` or `bzImage`. Optional field, but one of `image` and `kernel` must be specified.
* `kernel_args`
    * Optional field.
    * Additional kernel command line arguments to append to vmtest generated kernel arguments. `kernel` must be specified for this field to be effective.
* `command`
    * Required field.
    * Command to run inside VM. The specified command must be an absolute path. Note that the specified command is not run inside a shell by default. If you want a shell, use /bin/bash -c "$SHELL_CMD_HERE".

### Example usage

```yaml
steps:
- uses: actions/checkout@v3
- uses: danobi/vmtest-action@master
  with:
    name: '5.4 kernel'
    kernel: './kernels/bzImage-5.15.0-1022-aws
    command: "/bin/bash -c 'uname -r | grep -e aws$'"
```

### Example workflow

```yaml
name: vmtest

on:
  push:
    branches: [ "master" ]
  pull_request:
    branches: [ "master" ]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Run vmtest
      uses: danobi/vmtest-action@master
      with:
        name: '5.4 kernel'
        kernel: './kernels/bzImage-5.15.0-1022-aws
        command: "./main.sh"

    - name: Run main.sh
      run: |
        ./main.sh
```

[0]: https://github.com/danobi/vmtest
[1]: ./action.yml
