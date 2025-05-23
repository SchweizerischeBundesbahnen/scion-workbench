/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, Signal} from '@angular/core';
import {ɵWorkbenchStartup} from './ɵworkbench-startup.service';

/**
 * Provides the status of the SCION Workbench startup.
 */
@Injectable({providedIn: 'root', useClass: ɵWorkbenchStartup})
export abstract class WorkbenchStartup {

  /**
   * Indicates whether the workbench has completed startup.
   *
   * After startup, the workbench layout is available.
   */
  public abstract readonly done: Signal<boolean>;

  /**
   * Resolves when the workbench has completed startup.
   *
   * After startup, the workbench layout is available.
   */
  public abstract readonly whenDone: Promise<void>;

  /**
   * Indicates whether the workbench has completed startup.
   *
   * After startup, the workbench layout is available.
   *
   * @deprecated since version 19.0.0-beta.3. Use `WorkbenchStartup.done` instead. API will be removed in version 21.
   */
  public abstract readonly isStarted: Signal<boolean>;

  /**
   * Resolves when the workbench completes startup.
   *
   * After startup, the workbench layout is available.
   *
   * @deprecated since version 19.0.0-beta.3. Use `WorkbenchStartup.whenDone` instead. API will be removed in version 21.
   */
  public abstract readonly whenStarted: Promise<true>;
}
