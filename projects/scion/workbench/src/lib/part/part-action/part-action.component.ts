/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injector, input, runInInjectionContext, TemplateRef} from '@angular/core';
import {WorkbenchPartAction} from '../../workbench.model';
import {WorkbenchPart} from '../workbench-part.model';
import {ComponentType} from '@angular/cdk/portal';
import {NgComponentOutlet, NgTemplateOutlet} from '@angular/common';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {InstanceofPipe} from '../../common/instanceof.pipe';

@Component({
  selector: 'wb-part-action',
  templateUrl: './part-action.component.html',
  styleUrl: './part-action.component.scss',
  imports: [
    NgTemplateOutlet,
    NgComponentOutlet,
    InstanceofPipe,
  ],
})
export class PartActionComponent {

  public readonly action = input.required({transform: (action: WorkbenchPartAction) => runInInjectionContext(this._injector, () => transform(action))});

  private readonly _injector = inject(Injector);

  protected readonly TemplatePartAction = TemplatePartAction;
  protected readonly ComponentPartAction = ComponentPartAction;
}

/**
 * Transforms a {@link WorkbenchPartAction} into a {@link ComponentPartAction} or {@link TemplatePartAction}.
 */
function transform(action: WorkbenchPartAction): ComponentPartAction | TemplatePartAction {
  const part = inject(WorkbenchPart);
  const injector = Injector.create({
    parent: action.injector ?? inject(Injector),
    providers: [
      {provide: ɵWorkbenchPart, useValue: part},
      {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
    ],
  });

  if (action.content instanceof TemplateRef) {
    return new TemplatePartAction(action.content, {$implicit: part, ...action.inputs}, injector);
  }
  else {
    return new ComponentPartAction(action.content, action.inputs, injector);
  }
}

/**
 * Represents a part action with a component.
 */
class ComponentPartAction {

  constructor(public component: ComponentType<unknown>,
              public inputs: {[name: string]: unknown} | undefined,
              public injector: Injector) {
  }
}

/**
 * Represents a part action with a template.
 */
export class TemplatePartAction {

  constructor(public template: TemplateRef<unknown>,
              public context: {[name: string]: unknown},
              public injector: Injector) {
  }
}
