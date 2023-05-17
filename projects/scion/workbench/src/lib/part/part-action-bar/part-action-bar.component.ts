/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, Component, Injector, TemplateRef} from '@angular/core';
import {combineLatest, Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {WorkbenchPartAction} from '../../workbench.model';
import {WorkbenchPart} from '../workbench-part.model';
import {ɵWorkbenchService} from '../../ɵworkbench.service';

@Component({
  selector: 'wb-part-action-bar',
  templateUrl: './part-action-bar.component.html',
  styleUrls: ['./part-action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartActionBarComponent {

  public startActions$: Observable<WorkbenchPartAction[]>;
  public endActions$: Observable<WorkbenchPartAction[]>;

  constructor(private _part: WorkbenchPart, workbenchService: ɵWorkbenchService) {
    this.startActions$ = combineLatest([this._part.actions$, workbenchService.partActions$, this._part.activeViewId$]).pipe(combineAndFilterPartActions('start'));
    this.endActions$ = combineLatest([this._part.actions$, workbenchService.partActions$, this._part.activeViewId$]).pipe(combineAndFilterPartActions('end'));
  }

  public isTemplate(action: WorkbenchPartAction): boolean {
    return action.templateOrComponent instanceof TemplateRef;
  }

  public addPartToInjector(injector: Injector): Injector {
    return Injector.create({
      parent: injector,
      providers: [{provide: WorkbenchPart, useValue: this._part}],
    });
  }
}

function combineAndFilterPartActions(align: 'start' | 'end'): OperatorFunction<[WorkbenchPartAction[], WorkbenchPartAction[], string | null], WorkbenchPartAction[]> {
  return map(([localActions, globalActions, activeViewId]: [WorkbenchPartAction[], WorkbenchPartAction[], string | null]): WorkbenchPartAction[] => {
      return [...localActions, ...globalActions]
        .filter(action => (action.align || 'start') === align)
        .filter(action => !action.viewId || action.viewId === activeViewId);
    },
  );
}
