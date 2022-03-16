const core = require('@actions/core');
const request = require('axios');
const fs = require('fs').promises;
const toml = require('toml');

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
  const apiToken = core.getInput('apiToken')
  const scriptPath = core.getInput('scriptPath')
  const wranglerTomlPath = core.getInput('wranglerTomlPath')
  const tomlEnvironment = core.getInput('tomlEnvironment')
  const cloudflareEnvironment = core.getInput('cloudflareEnvironment')
  const cfAccountId = process.env['CF_ACCOUNT_ID']

  if (!apiToken || !scriptPath || !wranglerTomlPath || !tomlEnvironment || !cfAccountId || !cloudflareEnvironment) {
    throw new Error('Missing parameter');
  }

  const tomlFile = await fs.readFile(wranglerTomlPath);
  const tomlData = toml.parse(tomlFile);

  const { env: tomlEnvs } = tomlData;
  const envConfig = tomlEnvs[tomlEnvironment];

  if (!envConfig) {
    throw new Error(`Cannot find wrangler configuration for environment ${tomlEnvironment}`)
  }

  const envVars = Object.entries(envConfig.vars || {}).reduce(
    (acc, [key, value]) => ([
      ...acc,
      { name: key, text: value, type: 'plain_text' },
    ]),
    []
  );

  const kvNamespaces = envConfig.kv_namespaces || [].map((namespace) => ({
    name: namespace.binding,
    namespace_id: namespace.id,
    type: 'kv_namespace',
  }));

  const workerName = envConfig.name;
  const bindings = [...envVars, ...kvNamespaces];

  core.debug(`Configuring ${envVars.length} environment variables`);
  core.debug(envVars.filter(env => env.type === 'plain_text'));

  core.debug(`Configuring ${kvNamespaces.length} KV namespaces`);
  core.debug(kvNamespaces);

  const script = await fs.readFile(scriptPath);
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/workers/services/${workerName}/environments/${cloudflareEnvironment}`;

  const [boundaryName, formData] = getMultipartForm(script, bindings);
  const headers = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': `multipart/form-data; boundary=----${boundaryName}`,
  };

  const { data } = await request.put(url, formData, {
    headers,
  });

  core.info(
    `Cloudflare bundle uploaded to worker: ${data.result.id} [etag ${data.result.etag}, usage model ${data.result.usage_model}]`
  );
};

main().catch((err) => {
  if (err.response?.data) {
    core.error(err.response.data.errors);
  }
  core.setFailed(err.message);
  console.error(err)
});
