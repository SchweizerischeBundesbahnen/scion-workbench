/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, inject, Injectable, Injector, input, inputBinding, Provider, runInInjectionContext, signal, TemplateRef} from '@angular/core';
import {PartId} from '../../workbench.identifiers';
import {contributeMenu, Disposable} from '@scion/sci-components/menu';
import {WORKBENCH_ELEMENT} from '../../workbench-element-references';
import {SciComponentDescriptor} from '@scion/sci-components/common';
import {NgTemplateOutlet} from '@angular/common';
import {WorkbenchPartAction, WorkbenchPartActionFn} from '../../workbench.model';
import {WorkbenchPartRegistry} from '../workbench-part.registry';
import {ɵWorkbenchPart} from '../ɵworkbench-part.model';
import {WorkbenchPart} from '../workbench-part.model';
import {WORKBENCH_PART_CONTEXT} from '../workbench-part-context.provider';
import {ComponentType} from '@angular/cdk/portal';
import {noop} from 'rxjs';

/**
 * Registers legacy part actions as toolbar items in the part toolbar.
 *
 * TODO [Angular 23] Remove backward compatiblity.
 *
 * @deprecated since version 21.0.0-beta.6. Will be removed in version 22.
 */
@Injectable({providedIn: 'root'})
export class WorkbenchPartActionRegistrationService {

  private readonly _partRegistry = inject(WorkbenchPartRegistry);
  private readonly _injector = inject(Injector);

  /**
   * Registers specified part action as toolbar item in the part toolbar.
   */
  public registerLegacyPartAction(legacyPartActionFn: WorkbenchPartActionFn): Disposable {
    const injector = this._injector;
    const partRegistry = this._partRegistry;

    const contributionStart = contributePartToolbar('toolbar:workbench.part.secondary');
    const contributionEnd = contributePartToolbar('toolbar:workbench.part');

    return {
      dispose: () => {
        contributionStart.dispose();
        contributionEnd.dispose();
      },
    };

    /**
     * Contributes the action to 'toolbar:workbench.part' or 'toolbar:workbench.part.secondary', depending on its alignment.
     */
    function contributePartToolbar(location: 'toolbar:workbench.part' | 'toolbar:workbench.part.secondary'): Disposable {
      return contributeMenu(location, ((toolbar, context) => {
        const part = partRegistry.get(context.get('partId') as PartId); // TODO [menu] Remove once in correct injection context

        const providers: Provider[] = [
          {provide: ɵWorkbenchPart, useValue: part},
          {provide: WorkbenchPart, useExisting: ɵWorkbenchPart},
          {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchPart},
          injector.get(WORKBENCH_PART_CONTEXT, [], {optional: true}),
        ];

        const legacyPartAction = coercePartAction(runInInjectionContext(injector, () => legacyPartActionFn(part)));
        if (!legacyPartAction) {
          return;
        }

        // Contribute to toolbar based on action alignment.
        const align = legacyPartAction.align ?? 'end';
        if (align === 'start' && location !== 'toolbar:workbench.part.secondary') {
          return;
        }
        if (align === 'end' && location !== 'toolbar:workbench.part') {
          return;
        }

        toolbar.addToolbarItem({
          // TODO [menu] should not be icon nor label, but component (addToolbarComponent)
          icon: coerceComponent(legacyPartAction, {providers, part}),
          onSelect: noop, // not supported by part actions
          cssClass: legacyPartAction.cssClass,
        })
      }), {injector}); // Pass root injector to be independent of the invocation context.
    }

    function coercePartAction(partActionLike: WorkbenchPartAction | ComponentType<unknown> | TemplateRef<unknown> | null): WorkbenchPartAction | null {
      if (!partActionLike) {
        return null;
      }
      if (partActionLike instanceof TemplateRef) {
        return {content: partActionLike}
      }
      if (typeof partActionLike === 'function') {
        return {content: partActionLike}
      }
      return partActionLike;
    }

    function coerceComponent(partAction: WorkbenchPartAction, options: {part: WorkbenchPart, providers: Provider[]}): SciComponentDescriptor {
      if (partAction.content instanceof TemplateRef) {
        return {
          component: PartActionComponent,
          bindings: [
            inputBinding('template', signal(partAction.content)),
            inputBinding('context', signal({$implicit: options.part, ...partAction.inputs})),
          ],
          providers: options.providers,
          injector: partAction.injector,
        };
      }
      else {
        return {
          component: partAction.content,
          bindings: Object.entries(partAction.inputs ?? {}).map(([key, value]) => inputBinding(key, signal(value))),
          providers: options.providers,
          injector: partAction.injector,
        };
      }
    }
  }
}

@Component({
  selector: 'wb-part-action',
  template: '<ng-container *ngTemplateOutlet="template(); context: context()"/>',
  imports: [NgTemplateOutlet],
})
class PartActionComponent {

  public readonly template = input.required<TemplateRef<unknown>>();
  public readonly context = input<{[name: string]: unknown}>();
}
