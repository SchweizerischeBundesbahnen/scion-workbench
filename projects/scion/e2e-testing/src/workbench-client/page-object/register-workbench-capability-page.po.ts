/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {coerceArray, rejectWhenAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewTabPO} from '../../view-tab.po';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {WorkbenchPerspectiveCapability as _WorkbenchPerspectiveCapability, WorkbenchPerspectiveCapabilityPart, WorkbenchPerspectiveCapabilityView, WorkbenchPerspectiveExtensionCapability as _WorkbenchPerspectiveExtensionCapability, WorkbenchPopupCapability as _WorkbenchPopupCapability, WorkbenchViewCapability as _WorkbenchViewCapability} from '@scion/workbench-client';
import {Capability} from '@scion/microfrontend-platform';
import {SciRouterOutletPO} from './sci-router-outlet.po';
import {WorkbenchPerspectiveCapabilityInitialPart} from '../../../../workbench-client/src/lib/perspective/workbench-perspective-capability';

/**
 * Playwright's test runner fails to compile when importing runtime types from `@scion/workbench` or `@scion/microfrontend-platform`, because
 * it requires ESM to be configured to run the E2E tests. We wait for better IDE support before configuring ESM for this project.
 *
 * Unlike classes or enums, interfaces can be referenced because they do not exist at runtime.
 * For that reason, we re-declare workbench capability interfaces and replace their `type` property (enum) with a string literal.
 */
export type WorkbenchViewCapability = Omit<_WorkbenchViewCapability, 'type'> & {type: 'view'; properties: {pinToStartPage?: boolean}};
export type WorkbenchPopupCapability = Omit<_WorkbenchPopupCapability, 'type'> & {type: 'popup'; properties: {pinToStartPage?: boolean}};
export type WorkbenchPerspectiveCapability = Omit<_WorkbenchPerspectiveCapability, 'type'> & {type: 'perspective'};
export type WorkbenchPerspectiveExtensionCapability = Omit<_WorkbenchPerspectiveExtensionCapability, 'type'> & {type: 'perspective-extension'};

/**
 * Page object to interact with {@link RegisterWorkbenchCapabilityPageComponent}.
 */
export class RegisterWorkbenchCapabilityPagePO {

  public readonly locator: Locator;
  public readonly outlet: SciRouterOutletPO;
  public readonly viewTab: ViewTabPO;

  constructor(appPO: AppPO, public viewId: string) {
    this.viewTab = appPO.view({viewId}).viewTab;
    this.outlet = new SciRouterOutletPO(appPO, {name: this.viewId});
    this.locator = this.outlet.frameLocator.locator('app-register-workbench-capability-page');
  }

  /**
   * Registers the given workbench capability.
   *
   * This method exists as a convenience method to not have to enter all fields separately.
   *
   * Returns a Promise that resolves to the registered capability upon successful registration, or that rejects on registration error.
   */
  public async registerCapability<T extends WorkbenchViewCapability | WorkbenchPopupCapability | WorkbenchPerspectiveCapability | WorkbenchPerspectiveExtensionCapability>(capability: T): Promise<Capability> {
    if (capability.type !== undefined) {
      await this.locator.locator('select.e2e-type').selectOption(capability.type);
    }
    if (capability.qualifier !== undefined) {
      const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-qualifier'));
      await keyValueField.clear();
      await keyValueField.addEntries(capability.qualifier);
    }
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
    if ((capability as WorkbenchViewCapability | WorkbenchPopupCapability).properties.path !== undefined) {
      await this.locator.locator('input.e2e-path').fill((capability as WorkbenchViewCapability | WorkbenchPopupCapability).properties.path);
    }
    if ((capability as WorkbenchViewCapability | WorkbenchPopupCapability).properties.cssClass !== undefined) {
      await this.locator.locator('input.e2e-class').fill(coerceArray((capability as WorkbenchViewCapability | WorkbenchPopupCapability).properties.cssClass).join(' '));
    }
    if (capability.type === 'view') {
      await this.enterViewCapabilityProperties(capability as WorkbenchViewCapability);
    }
    else if (capability.type === 'popup') {
      await this.enterPopupCapabilityProperties(capability as WorkbenchPopupCapability);
    }
    else if (capability.type === 'perspective') {
      await this.enterPerspectiveCapabilityProperties(capability as WorkbenchPerspectiveCapability);
    }
    else if (capability.type === 'perspective-extension') {
      await this.enterPerspectiveExtensionCapabilityProperties(capability as WorkbenchPerspectiveExtensionCapability);
    }

    await this.clickRegister();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    const responseLocator = this.locator.locator('output.e2e-register-response');
    const errorLocator = this.locator.locator('output.e2e-register-error');
    await Promise.race([
      responseLocator.waitFor({state: 'attached'}),
      rejectWhenAttached(errorLocator),
    ]);

    return JSON.parse(await responseLocator.locator('div.e2e-capability').innerText());
  }

  private async enterViewCapabilityProperties(capability: WorkbenchViewCapability): Promise<void> {
    if (capability.properties.title !== undefined) {
      await this.locator.locator('input.e2e-title').fill(capability.properties.title);
    }
    if (capability.properties.heading !== undefined) {
      await this.locator.locator('input.e2e-heading').fill(capability.properties.heading);
    }
    if (capability.properties.closable !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-closable')).toggle(capability.properties.closable);
    }
    if (capability.properties.showSplash !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-show-splash')).toggle(capability.properties.showSplash);
    }
    if (capability.properties.pinToStartPage !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-pin-to-startpage')).toggle(capability.properties.pinToStartPage);
    }
  }

  private async enterPopupCapabilityProperties(capability: WorkbenchPopupCapability): Promise<void> {
    const size = capability.properties.size;

    if (size?.width !== undefined) {
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
    if (capability.properties.pinToStartPage !== undefined) {
      await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-pin-to-startpage')).toggle(capability.properties.pinToStartPage);
    }
  }

  private async enterPerspectiveCapabilityProperties(capability: WorkbenchPerspectiveCapability): Promise<void> {
    const label = capability.properties.data?.label;
    if (label !== undefined && typeof label === 'string') {
      await this.locator.locator('input.e2e-label').fill(label);
    }
    await this.addPerspectiveParts(capability.properties.parts);
  }

  public async addPerspectiveParts(parts: [WorkbenchPerspectiveCapabilityInitialPart, ...WorkbenchPerspectiveCapabilityPart[]]): Promise<void> {
    const addButton = this.locator.locator('.actions button.e2e-add');
    const lastPartIdInput = this.locator.locator('input.e2e-part-id').last();
    const lastRelativeToInput = this.locator.locator('input.e2e-part-relativeTo').last();
    const lastAlignInput = this.locator.locator('select.e2e-part-align').last();
    const lastPartRatioInput = this.locator.locator('input.e2e-part-ratio').last();

    for (const part of parts) {
      await addButton.click();
      if (part.id !== undefined) {
        await lastPartIdInput.fill(part.id);
      }
      if ('relativeTo' in part && part.relativeTo !== undefined) {
        await lastRelativeToInput.fill(part.relativeTo);
      }
      if ('align' in part) {
        await lastAlignInput.selectOption(part.align);
      }
      if ('ratio' in part && part.ratio !== undefined) {
        await lastPartRatioInput.fill(`${part.ratio}`);
      }
    }
  }

  public async clearPerspectiveParts(): Promise<void> {
    await this.locator.locator('actions button.e2e-clear').click();
  }

  private async enterPerspectiveExtensionCapabilityProperties(capability: WorkbenchPerspectiveExtensionCapability): Promise<void> {
    if (capability.properties.perspective !== undefined) {
      const keyValueFieldPO = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-perspective-qualifier'));
      await keyValueFieldPO.clear();
      await keyValueFieldPO.addEntries(capability.properties.perspective);
    }

    await this.addPerspectiveViews(capability.properties.views);
  }

  public async addPerspectiveViews(views: WorkbenchPerspectiveCapabilityView[]): Promise<void> {
    const addButton = this.locator.locator('.actions button.e2e-add');
    const viewQualifierInput = this.locator.locator('sci-key-value-field.e2e-perspective-view-qualifier').last();
    const partIdInput = this.locator.locator('input.e2e-perspective-view-part-id').last();
    const lastPositionInput = this.locator.locator('input.e2e-perspective-view-position').last();
    const lastActiveInput = this.locator.locator('sci-checkbox.e2e-perspective-view-active').last();

    for (const view of views) {
      await addButton.click();
      if (view.qualifier !== undefined) {
        const keyValueFieldPO = new SciKeyValueFieldPO(viewQualifierInput);
        await keyValueFieldPO.addEntries(view.qualifier);
      }
      if (view.partId !== undefined) {
        await partIdInput.fill(view.partId);
      }
      if (view.position !== undefined) {
        await lastPositionInput.fill(`${view.position}`);
      }
      if (view.active !== undefined) {
        await new SciCheckboxPO(lastActiveInput).toggle(view.active);
      }
    }
  }

  private async clickRegister(): Promise<void> {
    await this.locator.locator('button.e2e-register').click();
  }
}
