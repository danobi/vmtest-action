# vmtest-action

This action wraps [vmtest][0] with a standard Github Actions interface to make
it easy to plug `vmtest` into your CI.

## Usage

See [action.yml][1] for full manifest.

### Inputs

The following input parameters map 1:1 with `vmtest` [target fields][2].
Please see the link for full documentation. But for reference, here are the
available inputs again:

* `name`
* `image`
* `uefi`
* `kernel`
* `kernel_args`
* `command`

### Example usage

```yaml
steps:
- uses: actions/checkout@v3
- uses: danobi/vmtest-action@master
  with:
    name: '5.4 kernel'
    kernel: './kernels/bzImage-5.15.0-1022-aws'
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

    - name: Run main.sh
      run: |
        ./main.sh

    - name: Run main.sh in a different kernel
      uses: danobi/vmtest-action@master
      with:
        name: '5.4 kernel'
        kernel: './kernels/bzImage-5.15.0-1022-aws
        command: ${{ github.workspace }}./main.sh
```

[0]: https://github.com/danobi/vmtest
[1]: ./action.yml
[2]: https://github.com/danobi/vmtest#target
