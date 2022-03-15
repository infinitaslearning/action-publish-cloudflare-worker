const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {
    const foo = core.getInput('foo');
    core.setOutput('bar', foo);

    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);
}

main().catch(err => core.setFailed(err.message))