import {EnvironmentProviders, makeEnvironmentProviders} from '@angular/core';
import {UUID} from '@scion/toolkit/uuid';
import {APP_INSTANCE_ID} from 'workbench-testing-app-components';

/**
 * Provides a unique app instance id for this application. The app instance id is different each time the app is reloaded.
 */
export function provideAppInstanceId(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: APP_INSTANCE_ID, useFactory: () => UUID.randomUUID()},
  ]);
}
