import {InjectionToken} from '@angular/core';

/**
 * DI token to get a unique token for this app instance.
 */
export const APP_INSTANCE_ID = new InjectionToken<string>('APP_INSTANCE_ID');
