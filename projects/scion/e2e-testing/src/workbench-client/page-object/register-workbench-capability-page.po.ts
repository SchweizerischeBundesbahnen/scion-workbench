/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached, toMatrixNotation, waitUntilAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {DockingArea, RelativeTo, ViewId, ViewParamDefinition, WorkbenchDialogCapability as _WorkbenchDialogCapability, WorkbenchMessageBoxCapability as _WorkbenchMessageBoxCapability, WorkbenchPartCapability as _WorkbenchPartCapability, WorkbenchPartRef, WorkbenchPerspectiveCapability as _WorkbenchPerspectiveCapability, WorkbenchPopupCapability as _WorkbenchPopupCapability, WorkbenchViewCapability as _WorkbenchViewCapability} from '@scion/workbench-client';
import {ActivatorCapability as _ActivatorCapability, Capability} from '@scion/microfrontend-platform';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {MicrofrontendViewPagePO} from '../../workbench/page-object/workbench-view-page.po';
import {ViewPO} from '../../view.po';

/**
 * Playwright's test runner fails to compile when importing runtime types from `@scion/workbench` or `@scion/microfrontend-platform`, because
 * it requires ESM to be configured to run the E2E tests. We wait for better IDE support before configuring ESM for this project.
 *
 * Unlike classes or enums, interfaces can be referenced because they do not exist at runtime.
 * For that reason, we re-declare workbench capability interfaces and replace their `type` property (enum) with a string literal.
 */
export type WorkbenchPerspectiveCapability = Omit<_WorkbenchPerspectiveCapability, 'type'> & {type: 'perspective'};
export type WorkbenchPartCapability = Omit<_WorkbenchPartCapability, 'type'> & {type: 'part'};
export type WorkbenchViewCapability = Omit<_WorkbenchViewCapability, 'type'> & {type: 'view'; properties: {pinToDesktop?: boolean}};
export type WorkbenchPopupCapability = Omit<_WorkbenchPopupCapability, 'type'> & {type: 'popup'; properties: {pinToDesktop?: boolean}};
export type WorkbenchDialogCapability = Omit<_WorkbenchDialogCapability, 'type'> & {type: 'dialog'};
export type WorkbenchMessageBoxCapability = Omit<_WorkbenchMessageBoxCapability, 'type'> & {type: 'messagebox'};
export type ActivatorCapability = Omit<_ActivatorCapability, 'type'> & {type: 'activator'};

/**
 * Page object to interact with {@link RegisterWorkbenchCapabilityPageComponent}.
 */
export class RegisterWorkbenchCapabilityPagePO implements MicrofrontendViewPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly view: ViewPO;

  constructor(appPO: AppPO, locateBy: {viewId?: ViewId; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy.viewId, cssClass: locateBy.cssClass});
    this.outlet = new SciRouterOutletPO(appPO, {name: locateBy.viewId, cssClass: locateBy.cssClass});
    this.locator = this.outlet.frameLocator.locator('app-register-workbench-capability-page');
  }

  /**
   * Registers the given workbench capability.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves to the registered capability upon successful registration, or that rejects on registration error.
   */
  public async registerCapability<T extends WorkbenchPerspectiveCapability | WorkbenchPartCapability | WorkbenchViewCapability | WorkbenchPopupCapability | WorkbenchDialogCapability | WorkbenchMessageBoxCapability>(capability: T): Promise<T & Capability> {
    // Capability Type
    await this.locator.locator('select.e2e-type').selectOption(capability.type);

    // Capability Qualifier
    const qualifierField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await qualifierField.clear();
    await qualifierField.addEntries(capability.qualifier);

    // Capability Params
    await this.enterParams(capability);

    // Capability Visibility
    if (capability.private !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-private')).toggle(capability.private);
    }

    // Capability Properties
    switch (capability.type) {
      case 'perspective':
        await this.enterPerspectiveCapabilityProperties(capability);
        break;
      case 'part':
        await this.enterPartCapabilityProperties(capability);
        break;
      case 'view':
        await this.enterViewCapabilityProperties(capability);
        break;
      case 'popup':
        await this.enterPopupCapabilityProperties(capability);
        break;
      case 'dialog':
        await this.enterDialogCapabilityProperties(capability);
        break;
      case 'messagebox':
        await this.enterMessageBoxCapabilityProperties(capability);
        break;
    }

    await this.clickRegister();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this.locator.locator('output.e2e-register-response');
    const errorLocator = this.locator.locator('output.e2e-register-error');
    await Promise.race([
      waitUntilAttached(responseLocator),
      rejectWhenAttached(errorLocator),
    ]);

    return JSON.parse(await responseLocator.locator('div.e2e-capability').innerText()) as T & Capability;
  }

  private async enterParams(capability: Capability): Promise<void> {
    const paramsLocator = this.locator.locator('app-capability-params');
    for (const [paramIndex, param] of (capability.params ?? []).entries()) {
      await paramsLocator.locator('button.e2e-add-param').click();

      await paramsLocator.locator('input.e2e-name').nth(paramIndex).fill(param.name);
      await new SciCheckboxPO(paramsLocator.locator('sci-checkbox.e2e-required').nth(paramIndex)).toggle(param.required);

      if (param.deprecated === true || typeof param.deprecated === 'object') {
        await new SciCheckboxPO(paramsLocator.locator('sci-checkbox.e2e-deprecated').nth(paramIndex)).toggle(true);
      }
      if (typeof param.deprecated === 'object') {
        await paramsLocator.locator('input.e2e-deprecated-message').nth(paramIndex).fill(param.deprecated.message ?? '');
        await paramsLocator.locator('input.e2e-deprecated-use-instead').nth(paramIndex).fill(param.deprecated.useInstead ?? '');
      }

      const transient = (param as ViewParamDefinition).transient;
      if (transient !== undefined) {
        await new SciCheckboxPO(paramsLocator.locator('sci-checkbox.e2e-transient').nth(paramIndex)).toggle(transient);
      }
    }
  }

  private async enterPerspectiveCapabilityProperties(capability: WorkbenchPerspectiveCapability): Promise<void> {
    // Enter perspective data.
    const dataField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-data'));
    await dataField.clear();
    await dataField.addEntries(capability.properties.data ?? {});

    await this.enterParts(capability);
    await this.enterDockedParts(capability);
  }

  private async enterParts(capability: WorkbenchPerspectiveCapability): Promise<void> {
    const partsLocator = this.locator.locator('section.e2e-parts');
    const parts = (capability.properties.parts as WorkbenchPartRef[]).filter((part): part is WorkbenchPartRef & {position: RelativeTo} => typeof part.position !== 'string');
    for (const [partIndex, part] of parts.entries()) {
      await this.locator.locator('button.e2e-add-part').click();

      await partsLocator.locator('input.e2e-part-id').nth(partIndex).fill(part.id);
      await partsLocator.locator('input.e2e-qualifier').nth(partIndex).fill(toMatrixNotation(part.qualifier));
      await partsLocator.locator('input.e2e-params').nth(partIndex).fill(toMatrixNotation(part.params));
      await partsLocator.locator('input.e2e-class').nth(partIndex).fill(coerceArray(part.cssClass).join(' '));

      if (part.active !== undefined) {
        await new SciCheckboxPO(partsLocator.locator('sci-checkbox.e2e-activate-part').nth(partIndex)).toggle(part.active);
      }

      if (partIndex > 0) {
        await partsLocator.locator('input.e2e-relative-to').nth(partIndex).fill(part.position.relativeTo ?? '');
        await partsLocator.locator('select.e2e-align').nth(partIndex).selectOption(part.position.align);
        await partsLocator.locator('input.e2e-ratio').nth(partIndex).fill(`${part.position.ratio ?? ''}`);
      }
    }
  }

  private async enterDockedParts(capability: WorkbenchPerspectiveCapability): Promise<void> {
    const partsLocator = this.locator.locator('section.e2e-docked-parts');
    const parts = (capability.properties.parts as WorkbenchPartRef[]).filter((part): part is WorkbenchPartRef & {position: DockingArea} => typeof part.position === 'string');
    for (const [partIndex, part] of parts.entries()) {
      await this.locator.locator('button.e2e-add-docked-part').click();

      await partsLocator.locator('input.e2e-part-id').nth(partIndex).fill(part.id);
      await partsLocator.locator('input.e2e-qualifier').nth(partIndex).fill(toMatrixNotation(part.qualifier));
      await partsLocator.locator('input.e2e-params').nth(partIndex).fill(toMatrixNotation(part.params));
      await partsLocator.locator('select.e2e-dock-to').nth(partIndex).selectOption(part.position);
      await partsLocator.locator('input.e2e-activity-id').nth(partIndex).fill(part.ɵactivityId ?? '');
      await partsLocator.locator('input.e2e-class').nth(partIndex).fill(coerceArray(part.cssClass).join(' '));

      if (part.active !== undefined) {
        await new SciCheckboxPO(partsLocator.locator('sci-checkbox.e2e-activate-part').nth(partIndex)).toggle(part.active);
      }
    }
  }

  private async enterPartCapabilityProperties(capability: WorkbenchPartCapability): Promise<void> {
    await this.locator.locator('input.e2e-path').fill(capability.properties?.path ?? '');
    await this.locator.locator('input.e2e-title').fill(capability.properties?.title === false ? '<boolean>false</boolean>' : capability.properties?.title ?? '');
    await this.locator.locator('input.e2e-icon').fill(capability.properties?.extras?.icon ?? '');
    await this.locator.locator('input.e2e-label').fill(capability.properties?.extras?.label ?? '');
    await this.locator.locator('input.e2e-tooltip').fill(capability.properties?.extras?.tooltip ?? '');
    await this.locator.locator('input.e2e-resolve').fill(toMatrixNotation(capability.properties?.resolve));
    await this.locator.locator('input.e2e-class').fill(coerceArray(capability.properties?.cssClass).join(' '));

    if (capability.properties?.showSplash !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-show-splash')).toggle(capability.properties.showSplash);
    }

    // Enter views.
    for (const [viewIndex, view] of (capability.properties?.views ?? []).entries()) {
      await this.locator.locator('button.e2e-add-view').click();

      const viewsLocator = this.locator.locator('section.e2e-views');
      await viewsLocator.locator('input.e2e-qualifier').nth(viewIndex).fill(toMatrixNotation(view.qualifier));
      await viewsLocator.locator('input.e2e-params').nth(viewIndex).fill(toMatrixNotation(view.params));
      await viewsLocator.locator('input.e2e-class').nth(viewIndex).fill(coerceArray(view.cssClass).join(' '));

      if (view.active !== undefined) {
        await new SciCheckboxPO(viewsLocator.locator('sci-checkbox.e2e-activate-view').nth(viewIndex)).toggle(view.active);
      }
    }
  }

  private async enterViewCapabilityProperties(capability: WorkbenchViewCapability): Promise<void> {
    await this.locator.locator('input.e2e-path').fill(capability.properties.path);

    if (capability.properties.cssClass !== undefined) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(capability.properties.cssClass).join(' '));
    }
    if (capability.properties.title !== undefined) {
      await this.locator.locator('input.e2e-title').fill(capability.properties.title);
    }
    if (capability.properties.heading !== undefined) {
      await this.locator.locator('input.e2e-heading').fill(capability.properties.heading);
    }
    if (capability.properties.resolve !== undefined) {
      await this.locator.locator('input.e2e-resolve').fill(toMatrixNotation(capability.properties.resolve));
    }
    if (capability.properties.closable !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-closable')).toggle(capability.properties.closable);
    }
    if (capability.properties.lazy !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-lazy')).toggle(capability.properties.lazy);
    }
    if (capability.properties.showSplash !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-show-splash')).toggle(capability.properties.showSplash);
    }
    if (capability.properties.pinToDesktop !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-pin-to-desktop')).toggle(capability.properties.pinToDesktop);
    }
  }

  private async enterPopupCapabilityProperties(capability: WorkbenchPopupCapability): Promise<void> {
    await this.locator.locator('input.e2e-path').fill(capability.properties.path);

    const size = capability.properties.size;
    if (size?.width) {
      await this.locator.locator('input.e2e-width').fill(size.width);
    }
    if (size?.height) {
      await this.locator.locator('input.e2e-height').fill(size.height);
    }
    if (size?.minWidth) {
      await this.locator.locator('input.e2e-min-width').fill(size.minWidth);
    }
    if (size?.maxWidth) {
      await this.locator.locator('input.e2e-max-width').fill(size.maxWidth);
    }
    if (size?.minHeight) {
      await this.locator.locator('input.e2e-min-height').fill(size.minHeight);
    }
    if (size?.maxHeight) {
      await this.locator.locator('input.e2e-max-height').fill(size.maxHeight);
    }
    if (capability.properties.showSplash !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-show-splash')).toggle(capability.properties.showSplash);
    }
    if (capability.properties.pinToDesktop !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-pin-to-desktop')).toggle(capability.properties.pinToDesktop);
    }
    if (capability.properties.cssClass !== undefined) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(capability.properties.cssClass).join(' '));
    }
  }

  private async enterDialogCapabilityProperties(capability: WorkbenchDialogCapability): Promise<void> {
    await this.locator.locator('input.e2e-path').fill(capability.properties.path);

    const size = capability.properties.size;
    if (size?.width) {
      await this.locator.locator('input.e2e-width').fill(size.width);
    }
    if (size?.height) {
      await this.locator.locator('input.e2e-height').fill(size.height);
    }
    if (size?.minWidth) {
      await this.locator.locator('input.e2e-min-width').fill(size.minWidth);
    }
    if (size?.maxWidth) {
      await this.locator.locator('input.e2e-max-width').fill(size.maxWidth);
    }
    if (size?.minHeight) {
      await this.locator.locator('input.e2e-min-height').fill(size.minHeight);
    }
    if (size?.maxHeight) {
      await this.locator.locator('input.e2e-max-height').fill(size.maxHeight);
    }
    if (capability.properties.title !== undefined) {
      await this.locator.locator('input.e2e-title').fill(capability.properties.title);
    }
    if (capability.properties.resolve !== undefined) {
      await this.locator.locator('input.e2e-resolve').fill(toMatrixNotation(capability.properties.resolve));
    }
    if (capability.properties.closable !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-closable')).toggle(capability.properties.closable);
    }
    if (capability.properties.resizable !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-resizable')).toggle(capability.properties.resizable);
    }
    if (capability.properties.padding !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-padding')).toggle(capability.properties.padding);
    }
    if (capability.properties.showSplash !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-show-splash')).toggle(capability.properties.showSplash);
    }
    if (capability.properties.cssClass !== undefined) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(capability.properties.cssClass).join(' '));
    }
  }

  private async enterMessageBoxCapabilityProperties(capability: WorkbenchMessageBoxCapability): Promise<void> {
    await this.locator.locator('input.e2e-path').fill(capability.properties.path);

    const size = capability.properties.size;
    if (size?.width) {
      await this.locator.locator('input.e2e-width').fill(size.width);
    }
    if (size?.height) {
      await this.locator.locator('input.e2e-height').fill(size.height);
    }
    if (size?.minWidth) {
      await this.locator.locator('input.e2e-min-width').fill(size.minWidth);
    }
    if (size?.maxWidth) {
      await this.locator.locator('input.e2e-max-width').fill(size.maxWidth);
    }
    if (size?.minHeight) {
      await this.locator.locator('input.e2e-min-height').fill(size.minHeight);
    }
    if (size?.maxHeight) {
      await this.locator.locator('input.e2e-max-height').fill(size.maxHeight);
    }
    if (capability.properties.showSplash !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-show-splash')).toggle(capability.properties.showSplash);
    }
    if (capability.properties.cssClass !== undefined) {
      await this.locator.locator('input.e2e-class').fill(coerceArray(capability.properties.cssClass).join(' '));
    }
  }

  private async clickRegister(): Promise<void> {
    await this.locator.locator('button.e2e-register').click();
  }
}
