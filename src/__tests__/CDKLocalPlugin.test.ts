import { CDKLocalPlugin } from '../index';
import { PluginConfig, OrcdkConfig } from '@orcdkestrator/core';

describe('CDKLocalPlugin', () => {
  let plugin: CDKLocalPlugin;
  let mockConfig: PluginConfig;
  let mockOrcdkConfig: OrcdkConfig;

  beforeEach(() => {
    mockConfig = {
      name: 'cdklocal',
      enabled: true,
      config: {}
    };

    mockOrcdkConfig = {
      cdkRoot: 'cdk',
      deploymentStrategy: 'auto',
      environments: {
        local: { displayName: 'Local', isLocal: true }
      },
      plugins: []
    };

    plugin = new CDKLocalPlugin();
  });

  describe('initialization', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('cdklocal');
    });
  });

  describe('initialize', () => {
    it('should initialize the plugin successfully', async () => {
      await plugin.initialize(mockConfig, mockOrcdkConfig);
      
      expect(plugin.name).toBe('@orcdkestrator/cdklocal');
      expect(plugin.version).toBeDefined();
    });
  });
});
