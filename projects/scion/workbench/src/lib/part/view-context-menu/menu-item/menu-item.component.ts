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
import {WorkbenchMenuItem} from '../../../workbench.model';
import {WORKBENCH_ELEMENT} from '../../../workbench-element-references';
import {ComponentType} from '@angular/cdk/portal';
import {NgComponentOutlet, NgTemplateOutlet} from '@angular/common';
import {InstanceofPipe} from '../../../common/instanceof.pipe';
import {ɵWorkbenchView} from '../../../view/ɵworkbench-view.model';
import {WorkbenchView} from '../../../view/workbench-view.model';

@Component({
  selector: 'wb-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  imports: [
    NgTemplateOutlet,
    NgComponentOutlet,
    InstanceofPipe,
  ],
})
export class MenuItemComponent {

  public readonly menuItem = input.required({transform: (menuItem: WorkbenchMenuItem) => runInInjectionContext(this._injector, () => transform(menuItem))});

  private readonly _injector = inject(Injector);

  protected readonly TemplateMenuItem = TemplateMenuItem;
  protected readonly ComponentMenuItem = ComponentMenuItem;
}

/**
 * Transforms a {@link WorkbenchMenuItem} into a {@link ComponentMenuItem} or {@link TemplateMenuItem}.
 */
function transform(menuItem: WorkbenchMenuItem): ComponentMenuItem | TemplateMenuItem {
  const view = inject(ɵWorkbenchView);
  const injector = Injector.create({
    parent: menuItem.injector ?? inject(Injector),
    providers: [
      {provide: ɵWorkbenchView, useValue: view},
      {provide: WorkbenchView, useExisting: ɵWorkbenchView},
      {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchView},
    ],
  });

  if (menuItem.content instanceof TemplateRef) {
    return new TemplateMenuItem(menuItem.content, {$implicit: view, ...menuItem.inputs}, injector);
  }
  else {
    return new ComponentMenuItem(menuItem.content, menuItem.inputs, injector);
  }
}

/**
 * Represents a menu item with a component.
 */
class ComponentMenuItem {

  constructor(public component: ComponentType<unknown>,
              public inputs: {[name: string]: unknown} | undefined,
              public injector: Injector) {
  }
}

/**
 * Represents a menu item with a template.
 */
export class TemplateMenuItem {

  constructor(public template: TemplateRef<unknown>,
              public context: {[name: string]: unknown},
              public injector: Injector) {
  }
}
