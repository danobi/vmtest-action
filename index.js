const core = require('@actions/core');
const vmtest = require('./vmtest');

try {
    vmtest.main();
} catch (error) {
    core.setFailed(error.message);
}