import {InjectionToken} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';

/**
 * DI token to get a unique token for this app instance. This token is different each time the app is reloaded.
 */
export const APP_INSTANCE_ID = new InjectionToken<string>('APP_INSTANCE_ID', {
  providedIn: 'root',
  factory: () => UUID.randomUUID(),
});
