const core = require('@actions/core');
const request = require('axios');
const fs = require('fs').promises;

const main = async () => {
    const apiToken = core.getInput('apiToken');
    const fileName = core.getInput('fileName');
    const workerName = core.getInput('workerName');
    const cfAccountId = process.env['CF_ACCOUNT_ID'];

    if(!apiToken || !fileName || !workerName || !cfAccountId){
        throw new Error('Missing parameter');
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/workers/scripts/${workerName}`;
    const headers = {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/javascript'
    };

    const file = await fs.readFile(fileName);
    const { data } = await request.put(url, file, { headers });
    core.info(`Cloudflare bundle uploaded to worker ${data.result.id} with etag ${data.result.etag} and usage model ${data.result.usage_model}`);
}

main().catch(err => core.setFailed(err.message));
