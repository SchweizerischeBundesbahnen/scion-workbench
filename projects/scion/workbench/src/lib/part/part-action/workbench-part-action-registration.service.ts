/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injectable, Injector, input, inputBinding, runInInjectionContext, signal, TemplateRef} from '@angular/core';
import {contributeMenu} from '@scion/components/menu';
import {Disposable} from '@scion/toolkit/types';
import {SciComponentDescriptor} from '@scion/components/common';
import {NgTemplateOutlet} from '@angular/common';
import {WorkbenchPartAction, WorkbenchPartActionFn} from '../../workbench.model';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {WorkbenchPart} from '../workbench-part.model';
import {ComponentType} from '@angular/cdk/portal';

/**
 * Registers legacy part actions as toolbar items in the part toolbar.
 *
 * TODO [Angular 23] Remove backward compatiblity.
 *
 * @deprecated since version 21.0.0-beta.6. Will be removed in version 22.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPartActionRegistrationService {

  private readonly _injector = inject(Injector);

  /**
   * Registers specified part action as toolbar item in the part toolbar.
   */
  public registerLegacyPartAction(legacyPartActionFn: WorkbenchPartActionFn): Disposable {
    // Run in root injector to be independent of the invocation context.
    return runInInjectionContext(this._injector, () => {
      const tabbarContribution = contributePartToolbar('toolbar:workbench.part.tabbar');
      const toolbarContribution = contributePartToolbar('toolbar:workbench.part.toolbar');
      return {
        dispose: () => {
          tabbarContribution.dispose();
          toolbarContribution.dispose();
        },
      };
    });

    /**
     * Contributes the action to 'toolbar:workbench.part.toolbar' or 'toolbar:workbench.part.tabbar', depending on its alignment.
     */
    function contributePartToolbar(location: 'toolbar:workbench.part.toolbar' | 'toolbar:workbench.part.tabbar'): Disposable {
      return contributeMenu(location, toolbar => {
        const part = inject(ɵWorkbenchPart);

        const legacyPartAction = coercePartAction(legacyPartActionFn(part));
        if (!legacyPartAction) {
          return;
        }

        // Contribute to toolbar based on action alignment.
        const align = legacyPartAction.align ?? 'end';
        if (align === 'start' && location !== 'toolbar:workbench.part.tabbar') {
          return;
        }
        if (align === 'end' && location !== 'toolbar:workbench.part.toolbar') {
          return;
        }

        const componentDescriptor = coerceComponent(legacyPartAction, part);
        toolbar.addToolbarControl({
          component: componentDescriptor.component,
          bindings: componentDescriptor.bindings,
          providers: componentDescriptor.providers,
          injector: componentDescriptor.injector,
          cssClass: legacyPartAction.cssClass,
        });
      });
    }

    function coercePartAction(partActionLike: WorkbenchPartAction | ComponentType<unknown> | TemplateRef<unknown> | null): WorkbenchPartAction | null {
      if (!partActionLike) {
        return null;
      }
      if (partActionLike instanceof TemplateRef) {
        return {content: partActionLike};
      }
      if (typeof partActionLike === 'function') {
        return {content: partActionLike};
      }
      return partActionLike;
    }

    function coerceComponent(partAction: WorkbenchPartAction, part: WorkbenchPart): SciComponentDescriptor {
      if (partAction.content instanceof TemplateRef) {
        return {
          component: PartActionComponent,
          bindings: [
            inputBinding('template', signal(partAction.content)),
            inputBinding('context', signal({$implicit: part, ...partAction.inputs})),
          ],
          injector: partAction.injector,
        };
      }
      else {
        return {
          component: partAction.content,
          bindings: Object.entries(partAction.inputs ?? {}).map(([key, value]) => inputBinding(key, signal(value))),
          injector: partAction.injector,
        };
      }
    }
  }
}

@Component({
  selector: 'wb-part-action',
  styles: `:host {
    display: grid;
    place-content: center
  }`,
  template: '<ng-container *ngTemplateOutlet="template(); context: context(); injector: injector"/>',
  imports: [NgTemplateOutlet],
})
class PartActionComponent {

  public readonly template = input.required<TemplateRef<unknown>>();
  public readonly context = input<{[name: string]: unknown}>();

  protected readonly injector = inject(Injector);
}
