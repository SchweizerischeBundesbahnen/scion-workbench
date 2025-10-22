/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Beans} from '@scion/toolkit/bean-manager';
import {Observable} from 'rxjs';
import {mapToBody, MessageClient, MicrofrontendPlatformClient} from '@scion/microfrontend-platform';
import {ɵWorkbenchCommands} from '../ɵworkbench-commands';
import {shareReplay} from 'rxjs/operators';
import {WorkbenchPart} from './workbench-part';
import {decorateObservable} from '../observable-decorator';
import {PartId} from '../workbench.identifiers';
import {WorkbenchPartCapability} from './workbench-part-capability';
import {ɵWorkbenchPartContext} from './ɵworkbench-part-context';

export class ɵWorkbenchPart implements WorkbenchPart {

  public id: PartId;
  public active$: Observable<boolean>;
  public focused$: Observable<boolean>;
  public params: Map<string, unknown>;
  public capability: WorkbenchPartCapability;

  constructor(context: ɵWorkbenchPartContext) {
    this.id = context.partId;
    this.params = context.params;
    this.capability = context.capability;

    this.active$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.partActiveTopic(this.id))
      .pipe(
        mapToBody(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
      );

    this.focused$ = Beans.get(MessageClient).observe$<boolean>(ɵWorkbenchCommands.partFocusedTopic(this.id))
      .pipe(
        mapToBody(),
        shareReplay({refCount: false, bufferSize: 1}),
        decorateObservable(),
      );
  }

  /** @inheritDoc */
  public signalReady(): void {
    MicrofrontendPlatformClient.signalReady();
  }
}
