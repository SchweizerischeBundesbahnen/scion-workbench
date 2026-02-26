/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Disposable} from '../common/disposable';
import {WorkbenchMenuContributions} from './workbench-menu.model';
import {Observable} from 'rxjs';
import {WorkbenchMenuCommands} from './workbench-menu.command';

export abstract class WorkbenchMenuService {

  public abstract contributeMenu(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`, contributions: WorkbenchMenuContributions, context: Map<string, unknown>): Disposable;

  public abstract menuContributions(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): Observable<WorkbenchMenuCommands>;
}
