/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Provider} from '@angular/core';
import {WORKBENCH_PRE_STARTUP, WorkbenchInitializer} from '@scion/workbench';
import {WorkbenchStartupQueryParams} from './workbench-startup-query-params';
import {Beans} from '@scion/toolkit/bean-manager';
import {Handler, MessageHeaders, MessageInterceptor, TopicMessage} from '@scion/microfrontend-platform';
import {asyncScheduler} from 'rxjs';

/**
 * Simulates the slow retrieval of the microfrontend's current view capability by delaying capability lookups by 2000ms.
 *
 * This initializer is only installed if the query parameter {@link WorkbenchStartupQueryParams#SIMULATE_SLOW_CAPABILITY_LOOKUP} is set.
 */
@Injectable()
export class ThrottleCapabilityLookupInitializer implements WorkbenchInitializer {

  public async init(): Promise<void> {
    Beans.register(MessageInterceptor, {multi: true, useClass: CapabilityLookupMessageInterceptor});
  }
}

class CapabilityLookupMessageInterceptor implements MessageInterceptor {

  public intercept(message: TopicMessage, next: Handler<TopicMessage>): void {
    const requestor: string = message.headers.get(MessageHeaders.AppSymbolicName);

    if (message.topic === 'ɵLOOKUP_CAPABILITIES' && requestor.startsWith('workbench-client-testing-app')) {
      console.log(`Delaying the lookup of capabilities for ${requestor} by 2000ms.`, message);
      asyncScheduler.schedule(() => next.handle(message), 2000);
    }
    else {
      next.handle(message);
    }
  }
}

/**
 * Provides a {@link WorkbenchInitializer} to throttle capability lookups to simulate slow capability retrievals.
 *
 * Returns an empty provider array if the query parameter {@link WorkbenchStartupQueryParams#SIMULATE_SLOW_CAPABILITY_LOOKUP} is not set.
 */
export function provideThrottleCapabilityLookupInterceptor(): Provider[] {
  if (WorkbenchStartupQueryParams.standalone()) {
    return [];
  }
  if (WorkbenchStartupQueryParams.simulateSlowCapabilityLookup()) {
    return [
      {
        provide: WORKBENCH_PRE_STARTUP,
        multi: true,
        useClass: ThrottleCapabilityLookupInitializer,
      },
    ];
  }
  return [];
}
