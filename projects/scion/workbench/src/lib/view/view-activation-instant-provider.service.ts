import {Injectable} from '@angular/core';

/**
 * Provider for instants at which a {WorkbenchView} is activated.
 */
@Injectable()
export class ViewActivationInstantProvider {

  /**
   * Returns the current instant.
   */
  public get instant(): number {
    return Date.now();
  }
}
