const core = require('@actions/core');
const request = require('axios');
const fs = require('fs').promises;

const getMultipartForm = (script, bindings) => {
  const boundaryName = `boundary-${new Date().valueOf()}`;
  const boundaryString = `------${boundaryName}`;
  const multipartEOF = `${boundaryString}--`;

  const scriptPart = [
    boundaryString,
    'Content-Disposition: form-data; name="script"; filename="blob"',
    'Content-Type: application/javascript\n',
    script,
  ].join('\n');

  const metadataPart = [
    boundaryString,
    'Content-Disposition: form-data; name="metadata"; filename="blob"',
    'Content-Type: application/json\n',
    JSON.stringify({
      bindings,
      body_part: 'script',
    }),
  ].join('\n');

  return [boundaryName, `${scriptPart}\n${metadataPart}\n${multipartEOF}`];
};

const main = async () => {
  const apiToken = core.getInput('apiToken');
  const fileName = core.getInput('fileName');
  const workerName = core.getInput('workerName');
  const cfAccountId = process.env['CF_ACCOUNT_ID'];

  if (!apiToken || !fileName || !workerName || !cfAccountId) {
    throw new Error('Missing parameter');
  }

  const script = await fs.readFile(fileName);
  const bindings = [
    { name: 'SECRET', text: 'SECRET_VALUE', type: 'plain_text' },
    {
      name: 'KVDump',
      type: 'kv_namespace',
      namespace_id: '3b6f4daa5f174d9aa1fd3f0df5203a3b',
    },
  ];

  const cfEnvironment = 'production';
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/workers/services/${workerName}/environments/${cfEnvironment}`;

  const [boundaryName, formData] = getMultipartForm(script, bindings);
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': `multipart/form-data; boundary=----${boundaryName}`,
  };

  const { data } = await request.put(url, formData, {
    headers,
  });

  // const { data } = await request.put(url, file, { headers });
  core.info(
    `Cloudflare bundle uploaded to worker ${data.result.id} with etag ${data.result.etag} and usage model ${data.result.usage_model}`
  );
};

main().catch((err) => {
  if (err.response?.data) {
    core.error(err.response.data.errors);
  }
  console.error(err);
  core.setFailed(err.message);
});
