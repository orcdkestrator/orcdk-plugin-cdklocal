import { CDKLocalPlugin } from '../index';
import { PluginConfig, OrcdkConfig } from '@orcdkestrator/core';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

// Mock child_process
jest.mock('child_process');
const mockExec = execCallback as jest.MockedFunction<typeof execCallback>;

// Mock EventBus
jest.mock('@orcdkestrator/core', () => {
  const actual = jest.requireActual('@orcdkestrator/core');
  const mockEventBus = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    emitEvent: jest.fn(),
    removeAllListeners: jest.fn(),
    listeners: jest.fn().mockReturnValue([]),
    once: jest.fn()
  };
  return {
    ...actual,
    EventBus: {
      getInstance: jest.fn(() => mockEventBus)
    },
    EventTypes: {
      'orchestrator:before:pattern-detection': 'orchestrator:before:pattern-detection'
    }
  };
});

describe('CDKLocalPlugin', () => {
  let plugin: CDKLocalPlugin;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;
  let mockEventBus: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset environment
    delete process.env.CDK_ENVIRONMENT;
    
    plugin = new CDKLocalPlugin();
    
    // Get mocked EventBus
    const mockedCore = jest.requireMock('@orcdkestrator/core');
    mockEventBus = mockedCore.EventBus.getInstance();
  });
  
  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
  });
  
  describe('initialize', () => {
    it('enables plugin for local environment', async () => {
      process.env.CDK_ENVIRONMENT = 'local';
      const config: PluginConfig = { name: 'cdklocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          local: { displayName: 'Local', isLocal: true }
        },
        plugins: [],
      };
      
      await plugin.initialize(config, orcdkConfig);
      
      expect((plugin as any).enabled).toBe(true);
    });
    
    it('disables plugin when config disabled', async () => {
      process.env.CDK_ENVIRONMENT = 'local';
      const config: PluginConfig = { name: 'cdklocal', enabled: false };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          local: { displayName: 'Local', isLocal: true }
        },
        plugins: [],
      };
      
      await plugin.initialize(config, orcdkConfig);
      
      expect((plugin as any).enabled).toBe(false);
    });
    
    it('disables plugin for non-local environment', async () => {
      process.env.CDK_ENVIRONMENT = 'production';
      const config: PluginConfig = { name: 'cdklocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          production: { displayName: 'Production', isLocal: false }
        },
        plugins: [],
      };
      
      await plugin.initialize(config, orcdkConfig);
      
      expect((plugin as any).enabled).toBe(false);
    });
  });
  
  describe('checkCDKLocal', () => {
    it('sets hasCDKLocal to true when cdklocal found', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(null, '/usr/local/bin/cdklocal', '');
        return {} as any;
      });
      
      await (plugin as any).checkCDKLocal();
      
      expect((plugin as any).hasCDKLocal).toBe(true);
    });
    
    it('sets hasCDKLocal to false when cdklocal not found', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(new Error('command not found'), '', 'command not found');
        return {} as any;
      });
      
      await (plugin as any).checkCDKLocal();
      
      expect((plugin as any).hasCDKLocal).toBe(false);
    });
  });
  
  describe('logStatus', () => {
    it('logs success message when cdklocal available', () => {
      (plugin as any).hasCDKLocal = true;
      
      (plugin as any).logStatus();
      
      expect(mockConsoleLog).toHaveBeenCalledWith('[cdklocal] CDK commands will use cdklocal');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
    
    it('logs warning when cdklocal not available', () => {
      (plugin as any).hasCDKLocal = false;
      
      (plugin as any).logStatus();
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[cdklocal] aws-cdk-local not found. CDK commands will use standard cdk CLI.\n' +
        '  To enable LocalStack integration, install aws-cdk-local: npm install -g aws-cdk-local\n' +
        '  For more information, visit: https://github.com/localstack/aws-cdk-local'
      );
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });
  
  describe('getCDKCommand', () => {
    it('returns cdklocal when available', () => {
      (plugin as any).hasCDKLocal = true;
      
      expect(plugin.getCDKCommand()).toBe('cdklocal');
    });
    
    it('returns cdk when cdklocal not available', () => {
      (plugin as any).hasCDKLocal = false;
      
      expect(plugin.getCDKCommand()).toBe('cdk');
    });
  });
  
  describe('pattern detection event handling', () => {
    beforeEach(async () => {
      (plugin as any).enabled = true;
      // Initialize the plugin to register event handlers
      const config: PluginConfig = { name: 'cdklocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          local: { displayName: 'Local', isLocal: true }
        },
        plugins: [],
      };
      process.env.CDK_ENVIRONMENT = 'local';
      await plugin.initialize(config, orcdkConfig);
    });
    
    it('checks for cdklocal and logs status when enabled', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(null, '/usr/local/bin/cdklocal', '');
        return {} as any;
      });
      
      // Get the event handler from the mock
      const mockedCore = jest.requireMock('@orcdkestrator/core');
      const eventHandler = mockEventBus.on.mock.calls.find(
        (call: any[]) => call[0] === mockedCore.EventTypes['orchestrator:before:pattern-detection']
      )?.[1];
      
      await eventHandler();
      
      expect(mockExec).toHaveBeenCalledWith(
        'which cdklocal',
        expect.any(Function)
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('[cdklocal] CDK commands will use cdklocal');
    });
    
    it('does nothing when disabled', async () => {
      // Re-initialize with disabled config
      const config: PluginConfig = { name: 'cdklocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          prod: { displayName: 'Production', isLocal: false }
        },
        plugins: [],
      };
      process.env.CDK_ENVIRONMENT = 'prod';
      await plugin.initialize(config, orcdkConfig);
      
      // Get the event handler from the mock
      const mockedCore = jest.requireMock('@orcdkestrator/core');
      const eventHandler = mockEventBus.on.mock.calls.find(
        (call: any[]) => call[0] === mockedCore.EventTypes['orchestrator:before:pattern-detection']
      )?.[1];
      
      await eventHandler();
      
      expect(mockExec).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
    
    it('handles cdklocal not found gracefully', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(new Error('command not found'), '', 'command not found');
        return {} as any;
      });
      
      // Get the event handler from the mock
      const mockedCore = jest.requireMock('@orcdkestrator/core');
      const eventHandler = mockEventBus.on.mock.calls.find(
        (call: any[]) => call[0] === mockedCore.EventTypes['orchestrator:before:pattern-detection']
      )?.[1];
      
      await eventHandler();
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[cdklocal] aws-cdk-local not found. CDK commands will use standard cdk CLI.\n' +
        '  To enable LocalStack integration, install aws-cdk-local: npm install -g aws-cdk-local\n' +
        '  For more information, visit: https://github.com/localstack/aws-cdk-local'
      );
    });
  });
});