/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';

/**
 * Allows executing initialization tasks (synchronous or asynchronous) when starting the workbench.
 *
 * At workbench startup, the workbench runs provided workbench initializers and waits for them to complete.
 * Initializers may execute in parallel.
 *
 * To register a workbench initializer, you need to provide it as multi provider using the DI class token {@link WorkbenchInitializer}, as following:
 *
 * ```ts
 * {
 *   provide: WorkbenchInitializer,
 *   useClass: Initializer,
 *   multi: true,
 * }
 *
 * @Injectable()
 * export class Initializer implements WorkbenchInitializer {
 *   ...
 * }
 */
@Injectable()
export abstract class WorkbenchInitializer {

  /**
   * Executes some work during workbench startup.
   *
   * @return a Promise that resolves when this initializer completes its initialization.
   */
  public abstract init?(): Promise<void>;
}
