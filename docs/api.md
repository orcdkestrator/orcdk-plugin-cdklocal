# CDK Local Plugin API Reference

## Plugin Configuration

```typescript
interface CdkLocalConfig {
  enabled: boolean;
  endpoint?: string;
  region?: string;
  cdkLocalPath?: string;
}
```

## Lifecycle Hooks

### `beforeStackDeploy`
Intercepts CDK commands and redirects them to use cdklocal for LocalStack deployments.

### `afterStackDeploy`
Performs any necessary cleanup after deployment.

## Methods

### `initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void>`
Initializes the plugin and verifies cdklocal is installed.

### `isCdkLocalInstalled(): boolean`
Checks if cdklocal CLI is available in the system PATH.

### `interceptCdkCommand(args: string[]): string[]`
Transforms CDK CLI arguments to use cdklocal.
