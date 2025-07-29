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
import {WorkbenchSelection, WorkbenchSelectionOptions} from './workbench-selection.model';
import {Observable} from 'rxjs';

@Injectable()
export abstract class WorkbenchSelectionService {

  public abstract readonly selection: Observable<WorkbenchSelection>;

  public abstract setSelection(selection: WorkbenchSelection, options?: WorkbenchSelectionOptions): void;

  public abstract deleteSelection(): void;
}
