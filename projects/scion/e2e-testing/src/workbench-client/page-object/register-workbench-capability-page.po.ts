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
import {DockingArea, RelativeTo, ViewId, WorkbenchDialogCapability as _WorkbenchDialogCapability, WorkbenchMessageBoxCapability as _WorkbenchMessageBoxCapability, WorkbenchPartCapability as _WorkbenchPartCapability, WorkbenchPartRef, WorkbenchPerspectiveCapabilityV2 as _WorkbenchPerspectiveCapability, WorkbenchPopupCapability as _WorkbenchPopupCapability, WorkbenchViewCapability as _WorkbenchViewCapability} from '@scion/workbench-client';
import {Capability} from '@scion/microfrontend-platform';
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
export type WorkbenchPartCapability = Omit<_WorkbenchPartCapability, 'type'> & {type: 'part'; properties?: {path?: string | '<null>' | '<undefined>'}};
export type WorkbenchViewCapability = Omit<_WorkbenchViewCapability, 'type'> & {type: 'view'; properties: {pinToDesktop?: boolean; path: string | '<null>' | '<undefined>'}};
export type WorkbenchPopupCapability = Omit<_WorkbenchPopupCapability, 'type'> & {type: 'popup'; properties: {pinToDesktop?: boolean; path: string | '<null>' | '<undefined>'}};
export type WorkbenchDialogCapability = Omit<_WorkbenchDialogCapability, 'type'> & {type: 'dialog'; properties: {path: string | '<null>' | '<undefined>'}};
export type WorkbenchMessageBoxCapability = Omit<_WorkbenchMessageBoxCapability, 'type'> & {type: 'messagebox'; properties: {path: string | '<null>' | '<undefined>'}};

type DockedPartRef = WorkbenchPartRef & {position: DockingArea};
type RelativePartRef = WorkbenchPartRef & {position: RelativeTo};

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
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
    await keyValueField.clear();
    await keyValueField.addEntries(capability.qualifier);

    // Capability Params
    const requiredParams = capability.params?.filter(param => param.required && !param.transient).map(param => param.name);
    const optionalParams = capability.params?.filter(param => !param.required && !param.transient).map(param => param.name);
    const transientParams = capability.params?.filter(param => param.transient).map(param => param.name);
    if (requiredParams?.length) {
      await this.locator.locator('input.e2e-required-params').fill(requiredParams.join(','));
    }
    if (optionalParams?.length) {
      await this.locator.locator('input.e2e-optional-params').fill(optionalParams.join(','));
    }
    if (transientParams?.length) {
      await this.locator.locator('input.e2e-transient-params').fill(transientParams.join(','));
    }
    if (capability.private !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-private')).toggle(capability.private);
    }

    // Capability Properties.
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

  private async enterPerspectiveCapabilityProperties(capability: WorkbenchPerspectiveCapability): Promise<void> {
    // Enter perspective data.
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-data'));
    await keyValueField.clear();
    await keyValueField.addEntries(capability.properties.data ?? {});

    await this.enterParts(capability);
    await this.enterDockedParts(capability);
  }

  private async enterParts(capability: WorkbenchPerspectiveCapability): Promise<void> {
    const partsLocator = this.locator.locator('section.e2e-parts');
    const parts = (capability.properties.parts as WorkbenchPartRef[]).filter(part => typeof part.position !== 'string') as Array<RelativePartRef>;
    for (const [partIndex, part] of parts.entries()) {
      await this.locator.locator('button.e2e-add-part').click();

      await partsLocator.locator('input.e2e-part-id').nth(partIndex).fill(part.id);
      await partsLocator.locator('input.e2e-qualifier').nth(partIndex).fill(toMatrixNotation(part.qualifier));

      if (partIndex > 0) {
        await partsLocator.locator('input.e2e-relative-to').nth(partIndex).fill(part.position.relativeTo ?? '');
        await partsLocator.locator('select.e2e-align').nth(partIndex).selectOption(part.position.align);
        await partsLocator.locator('input.e2e-ratio').nth(partIndex).fill(`${part.position.ratio ?? ''}`);

        if (part.active !== undefined) {
          await new SciCheckboxPO(partsLocator.locator('sci-checkbox.e2e-activate-part').nth(partIndex)).toggle(part.active);
        }

        if (part.cssClass !== undefined) {
          await partsLocator.locator('app-multi-value-input.e2e-class input').nth(partIndex).fill(coerceArray(part.cssClass).join(' '));
        }
      }
    }
  }

  private async enterDockedParts(capability: WorkbenchPerspectiveCapability): Promise<void> {
    const partsLocator = this.locator.locator('section.e2e-docked-parts');
    const parts = (capability.properties.parts as WorkbenchPartRef[]).filter(part => typeof part.position === 'string') as Array<DockedPartRef>;
    for (const [partIndex, part] of parts.entries()) {
      await this.locator.locator('button.e2e-add-docked-part').click();

      await partsLocator.locator('input.e2e-part-id').nth(partIndex).fill(part.id);
      await partsLocator.locator('input.e2e-qualifier').nth(partIndex).fill(toMatrixNotation(part.qualifier));

      await partsLocator.locator('select.e2e-dock-to').nth(partIndex).selectOption(part.position);

      if (part.active !== undefined) {
        await new SciCheckboxPO(partsLocator.locator('sci-checkbox.e2e-activate-part').nth(partIndex)).toggle(part.active);
      }

      if (part.ɵactivityId !== undefined) {
        await partsLocator.locator('input.e2e-activity-id').nth(partIndex).fill(part.ɵactivityId);
      }

      if (part.cssClass !== undefined) {
        await partsLocator.locator('app-multi-value-input.e2e-class input').nth(partIndex).fill(coerceArray(part.cssClass).join(' '));
      }
    }
  }

  private async enterPartCapabilityProperties(capability: WorkbenchPartCapability): Promise<void> {
    if (capability.properties?.path !== undefined) {
      await this.locator.locator('input.e2e-path').fill(capability.properties.path ?? '');
    }
    if (capability.properties?.title !== undefined) {
      await this.locator.locator('input.e2e-title').fill(`${capability.properties.title ?? ''}`);
    }
    if (capability.properties?.extras?.icon !== undefined) {
      await this.locator.locator('input.e2e-icon').fill(capability.properties.extras.icon);
    }
    if (capability.properties?.extras?.label !== undefined) {
      await this.locator.locator('input.e2e-label').fill(capability.properties.extras.label);
    }
    if (capability.properties?.extras?.tooltip !== undefined) {
      await this.locator.locator('input.e2e-tooltip').fill(capability.properties.extras.tooltip);
    }

    // Enter views.
    for (const [viewIndex, view] of (capability.properties?.views ?? []).entries()) {
      await this.locator.locator('button.e2e-add-view').click();

      const viewsLocator = this.locator.locator('section.e2e-views');
      await viewsLocator.locator('input.e2e-qualifier').nth(viewIndex).fill(toMatrixNotation(view.qualifier));
      await viewsLocator.locator('input.e2e-params').nth(viewIndex).fill(toMatrixNotation(view.params));
      if (view.active !== undefined) {
        await new SciCheckboxPO(viewsLocator.locator('sci-checkbox.e2e-activate-view').nth(viewIndex)).toggle(view.active);
      }
      await viewsLocator.locator('app-multi-value-input.e2e-class input').nth(viewIndex).fill(coerceArray(view.cssClass).join(' '));
    }

    if (capability.properties?.cssClass !== undefined) {
      await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(capability.properties.cssClass).join(' '));
    }
  }

  private async enterViewCapabilityProperties(capability: WorkbenchViewCapability): Promise<void> {
    await this.locator.locator('input.e2e-path').fill(capability.properties.path);

    if (capability.properties.cssClass !== undefined) {
      await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(capability.properties.cssClass).join(' '));
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
      await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(capability.properties.cssClass).join(' '));
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
      await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(capability.properties.cssClass).join(' '));
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
      await this.locator.locator('app-multi-value-input.e2e-class input').fill(coerceArray(capability.properties.cssClass).join(' '));
    }
  }

  private async clickRegister(): Promise<void> {
    await this.locator.locator('button.e2e-register').click();
  }
}
