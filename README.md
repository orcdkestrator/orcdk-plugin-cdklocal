# Orcdkestrator Plugin: Cdklocal

CDK CLI interception plugin for LocalStack integration with Orcdkestrator

## Installation

```bash
npm install @orcdkestrator/orcdk-plugin-cdklocal --save-dev
```

## Configuration

Add to your `orcdk.config.json`:

```json
{
  "plugins": [
    {
      "name": "cdklocal",
      "enabled": true,
      "config": {
        // Plugin-specific configuration
      }
    }
  ]
}
```

## Usage

See configuration section above and examples directory for detailed usage.

## API Reference

See [API Documentation](docs/api.md) for detailed information.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Enable/disable the plugin |

## Prerequisites

This plugin requires `aws-cdk-local` CLI to be installed:

```bash
npm install -g aws-cdk-local
```

## How It Works

The plugin intercepts CDK CLI command executions and replaces them with `cdklocal` equivalents when running in local mode.

## Examples

See the [examples directory](docs/examples/) for complete examples.

## Development

```bash
# Clone the repository
git clone https://github.com/orcdkestrator/orcdk-plugin-cdklocal.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.

<\!-- CI test -->
