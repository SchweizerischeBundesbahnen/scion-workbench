/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable} from '@angular/core';
import {ɵWorkbenchSelectionManagerService} from './ɵworkbench-selection-manager.service';
import {ɵWorkbenchSelection} from './workbench-selection.model';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root', useExisting: ɵWorkbenchSelectionManagerService})
export abstract class WorkbenchSelectionManagerService {

  public abstract readonly selection: Observable<ɵWorkbenchSelection>;

  public abstract setSelection(selection: ɵWorkbenchSelection): void;

  public abstract deleteSelection(provider: string): void;
}
