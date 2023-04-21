# vmtest-action

This action wraps [vmtest][0] with a standard Github Actions interface to make
it easy to plug `vmtest` into your CI.

## Usage

See [action.yml][1] for full manifest.

### Inputs

* `myInput`
    * Name to say hello to

### Example usage

```
steps:
- uses: actions/checkout@v3
- name: Run vmtest
  uses: danobi/vmtest-action@master
  with:
    myInput: 'Mona the Octocat'
```

### Example workflow

```
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
        myInput: 'Mona the Octocat'

    - name: Run main.sh
      run: |
        ./main.sh
```

[0]: https://github.com/danobi/vmtest
[1]: ./action.yml
