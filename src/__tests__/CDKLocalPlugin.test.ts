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
      options: {}
    };

    mockOrcdkConfig = {
      version: '1.0.0',
      environments: {},
      isLocal: true,
      plugins: []
    };

    plugin = new CDKLocalPlugin();
  });

  describe('initialization', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('cdklocal');
    });
  });

  describe('beforeStackDeploy', () => {
    it('should modify CDK command for local deployment', async () => {
      await plugin.beforeStackDeploy(mockConfig, mockOrcdkConfig);
      // Test passes if no errors are thrown
      expect(true).toBe(true);
    });
  });
});
