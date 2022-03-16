# action-publish-cloudflare-worker

## Reasoning
Currently, `wrangler` does not allow to publish a bundle without also building it first. This behaviour might be 
undesirable on a GitHub workflow when, for example, you want to roll back a previous version of the worker.

This GitHub actions uses cloudflare api instead of wrangler, so you can split up the building and the publishing.

## 📥 Inputs

| name      | required | description                                      |
|-----------| -------- |--------------------------------------------------|
 | apiToken  | ✅ | Cloudflare api token with workers privileges     |
 | scriptPath  | ✅ | Path of the bundle script for the worker         |
 | wranglerTomlPath  | ✅ | Path of the wrangler.toml config                 |
 | tomlEnvironment | ✅ | Environment name as defined on wrangler.toml     |
 | cloudflareEnvironment | ✅ | Environment name as defined on cloudflare worker |
---



## 💡 Usage examples

### Full usage example

```yaml
      - uses: actions/checkout@v2
      - name: Publish Cloudflare worker
        uses: infinitaslearning/publish-cloudflare-worker@v1.0.0
        with:
          apiToken: {{ secrets.CLOUDFLARE_API_TOKEN }}
          scriptPath: 'path/to/the/bundle.js'
          wranglerTomlPath: 'path/to/wrangler.toml'
          environment: 'cf-environment-name
        env:
          CF_ACCOUNT_ID: 'CLOUDFLARE_ACCOUNT_ID'
```
