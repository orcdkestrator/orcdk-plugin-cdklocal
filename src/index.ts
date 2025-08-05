import { Plugin, PluginConfig, OrcdkConfig, EventBus, EventTypes } from '@orcdkestrator/core';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const exec = promisify(execCallback);

// Read version from package.json
const packageJsonPath = path.join(__dirname, '../..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

/**
 * CDKLocal plugin for CDK command interception
 * Automatically uses cdklocal for local development when available
 * 
 * @example
 * ```json
 * {
 *   "name": "cdklocal",
 *   "enabled": true
 * }
 * ```
 */
export class CDKLocalPlugin implements Plugin {
  public readonly name = '@orcdkestrator/cdklocal';
  public readonly version = packageJson.version;
  
  private enabled = false;
  private hasCDKLocal = false;
  private eventBus: EventBus | null = null;
  
  async initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void> {
    const env = process.env.CDK_ENVIRONMENT;
    const envConfig = orcdkConfig.environments[env || ''];
    this.enabled = !!(envConfig?.isLocal && config.enabled);
    
    // Subscribe to events
    this.eventBus = EventBus.getInstance();
    this.subscribeToEvents();
  }
  
  /**
   * Subscribe to relevant events
   */
  private subscribeToEvents(): void {
    if (!this.eventBus) return;
    
    // Listen for pattern detection event
    this.eventBus.on(EventTypes['orchestrator:before:pattern-detection'], async () => {
      if (!this.enabled) return;
      await this.checkCDKLocal();
      this.logStatus();
    });
  }
  
  private async checkCDKLocal(): Promise<void> {
    try {
      await exec('which cdklocal');
      this.hasCDKLocal = true;
    } catch {
      this.hasCDKLocal = false;
    }
  }
  
  private logStatus(): void {
    if (this.hasCDKLocal) {
      console.log('[cdklocal] CDK commands will use cdklocal');
    } else {
      console.warn(
        '[cdklocal] aws-cdk-local not found. CDK commands will use standard cdk CLI.\n' +
        '  To enable LocalStack integration, install aws-cdk-local: npm install -g aws-cdk-local\n' +
        '  For more information, visit: https://github.com/localstack/aws-cdk-local'
      );
    }
  }
  
  getCDKCommand(): string {
    return this.hasCDKLocal ? 'cdklocal' : 'cdk';
  }
  
  async cleanup(): Promise<void> {
    // Unsubscribe from events
    if (this.eventBus) {
      this.eventBus.removeAllListeners(EventTypes['orchestrator:before:pattern-detection']);
    }
    
    // Reset state for consistency
    this.hasCDKLocal = false;
  }
}

// Export as default for easy importing
export default CDKLocalPlugin;