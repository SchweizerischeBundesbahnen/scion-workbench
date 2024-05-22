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
import {Observable} from 'rxjs';
import {WorkbenchSelectionData} from './workbench-selection.model';

@Injectable()
export abstract class WorkbenchSelectionService {

  public abstract readonly selection$: Observable<WorkbenchSelectionData>;

  public abstract setSelection(selection: WorkbenchSelectionData): void;

  public abstract deleteSelection(): void;
}
