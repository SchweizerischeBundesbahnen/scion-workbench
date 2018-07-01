/**
 * Configuration for the Workbench.
 */
import { NLS_DEFAULTS } from './workbench.constants';

export class WorkbenchConfig {

  nls?: { [key: string]: string } = NLS_DEFAULTS;

  constructor(config: WorkbenchConfig) {
    Object.keys(config)
      .filter(key => typeof config[key] !== 'undefined')
      .forEach(key => this[key] = config[key]);
  }

  /**
   * Returns the NLS text for the given key.
   */
  public text?(key: string): string {
    return this.nls[key];
  }
}
