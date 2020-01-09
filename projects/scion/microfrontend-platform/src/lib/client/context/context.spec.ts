/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Beans } from '../../bean-manager';
import { MicrofrontendPlatform } from '../../microfrontend-platform';
import { ContextService } from './context-service';

describe('Context', () => {

  beforeEach(async () => await MicrofrontendPlatform.destroy());
  afterEach(async () => await MicrofrontendPlatform.destroy());

  it('should not complete the Observable when looking up context values from inside the host app (no context)', async () => {
    await MicrofrontendPlatform.forHost([]);

    let next = undefined; // tslint:disable-line:no-unnecessary-initializer
    let error = false;
    let complete = false;

    Beans.get(ContextService).observe$('some-context')
      .subscribe(value => next = value, () => error = true, () => complete = true);

    expect(next).toBeNull();
    expect(error).toBeFalsy();
    expect(complete).toBeFalsy();
  });

  it('should not complete the Observable when looking up the names of context values from inside the host app (no context)', async () => {
    await MicrofrontendPlatform.forHost([]);

    let next = undefined; // tslint:disable-line:no-unnecessary-initializer
    let error = false;
    let complete = false;

    Beans.get(ContextService).names$()
      .subscribe(value => next = value, () => error = true, () => complete = true);

    expect(next).toEqual(new Set());
    expect(error).toBeFalsy();
    expect(complete).toBeFalsy();
  });
});
