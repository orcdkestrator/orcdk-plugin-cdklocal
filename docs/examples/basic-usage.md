# CDK Local Plugin Examples

## Basic Configuration

```json
{
  "environments": {
    "local": {
      "isLocal": true,
      "plugins": {
        "@orcdkestrator/cdklocal": {
          "enabled": true
        }
      }
    }
  }
}
```

## Custom Configuration

```json
{
  "environments": {
    "local": {
      "isLocal": true,
      "plugins": {
        "@orcdkestrator/cdklocal": {
          "enabled": true,
          "config": {
            "endpoint": "http://localhost:4566",
            "region": "us-east-1",
            "cdkLocalPath": "/usr/local/bin/cdklocal"
          }
        }
      }
    }
  }
}
```

## Usage Example

```bash
# Deploy CDK app to LocalStack
orcdk deploy --env local

# The plugin automatically uses cdklocal instead of cdk
# cdk deploy -> cdklocal deploy
# cdk synth -> cdklocal synth
```
