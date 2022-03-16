# action-publish-cloudflare-worker

## Reasoning
Currently, `wrangler` does not allow to publish a bundle without also building it first. This behaviour might be 
undesirable on a GitHub workflow when, for example, you want to roll back a previous version of the worker.

This GitHub actions uses cloudflare api instead of wrangler, so you can split up the building and the publishing.

## 📥 Inputs

| name      | required | description                                            |
|-----------| -------- |--------------------------------------------------------|
 | apiToken  | ✅ | Cloudflare api token with workers privileges |
 | scriptPath  | ✅ | Path of the bundle script for the worker     |
 | wranglerTomlPath  | ✅ | Path of the wrangler.toml config |
 | environment | ✅ | Environment name as defined on wrangler.toml |
---



## 💡 Usage examples

### Full usage example

```yaml
      - uses: actions/checkout@v2
      - name: Publish Cloudflare worker
        uses: infinitaslearning/publish-cloudflare-worker@v1
        with:
          apiToken: 'CLOUDFLARE_API_TOKEN'
          fileName: 'path/to/the/bundle.js'
          workerName: 'name-of-the-worker'
        env:
          CF_ACCOUNT_ID: 'CLOUDFLARE_ACCOUNT_ID'
```
