/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {rejectWhenAttached, waitUntilAttached} from '../../helper/testing.util';
import {AppPO} from '../../app.po';
import {ViewPO} from '../../view.po';
import {SciCheckboxPO} from '../../@scion/components.internal/checkbox.po';
import {Locator} from '@playwright/test';
import {SciKeyValueFieldPO} from '../../@scion/components.internal/key-value-field.po';
import {MAIN_AREA} from '../../workbench.model';
import {WorkbenchViewPagePO} from './workbench-view-page.po';

/**
 * Page object to interact with {@link PerspectivePageComponent}.
 */
export class PerspectivePagePO implements WorkbenchViewPagePO {

  public readonly locator: Locator;
  public readonly view: ViewPO;

  constructor(appPO: AppPO, locateBy: {viewId?: string; cssClass?: string}) {
    this.view = appPO.view({viewId: locateBy?.viewId, cssClass: locateBy?.cssClass});
    this.locator = this.view.locator.locator('app-perspective-page');
  }

  public async registerPerspective(definition: PerspectiveDefinition): Promise<void> {
    // Enter perspective definition.
    await this.locator.locator('input.e2e-id').fill(definition.id);
    await new SciCheckboxPO(this.locator.locator('sci-checkbox.e2e-transient')).toggle(definition.transient === true);
    await this.enterData(definition.data);

    // Enter parts.
    await this.enterParts(definition.parts);

    // Enter views.
    await this.enterViews(definition.views);

    // Register perspective.
    await this.locator.locator('button.e2e-register').click();

    // Evaluate the response: resolve the promise on success, or reject it on error.
    await Promise.race([
      waitUntilAttached(this.locator.locator('output.e2e-register-success')),
      rejectWhenAttached(this.locator.locator('output.e2e-register-error')),
    ]);
  }

  private async enterData(data: {[key: string]: any} | undefined): Promise<void> {
    const keyValueField = new SciKeyValueFieldPO(this.locator.locator('sci-key-value-field.e2e-data'));
    await keyValueField.clear();
    await keyValueField.addEntries(data ?? {});
  }

  private async enterParts(parts: PerspectivePartDescriptor[]): Promise<void> {
    const partsLocator = await this.locator.locator('app-perspective-page-parts');
    for (const [i, part] of parts.entries()) {
      await partsLocator.locator('button.e2e-add').click();
      await partsLocator.locator('input.e2e-part-id').nth(i).fill(part.id);
      await new SciCheckboxPO(partsLocator.locator('sci-checkbox.e2e-part-activate').nth(i)).toggle(part.activate === true);
      if (i > 0) {
        await partsLocator.locator('select.e2e-part-align').nth(i).selectOption(part.align!);
        await partsLocator.locator('input.e2e-part-relative-to').nth(i).fill(part.relativeTo ?? '');
        await partsLocator.locator('input.e2e-part-ratio').nth(i).fill(part.ratio?.toString() ?? '');
      }
    }
  }

  private async enterViews(views: PerspectiveViewDescriptor[] = []): Promise<void> {
    const viewsLocator = await this.locator.locator('app-perspective-page-views');
    for (const [i, view] of views.entries()) {
      await viewsLocator.locator('button.e2e-add').click();
      await viewsLocator.locator('input.e2e-view-id').nth(i).fill(view.id);
      await viewsLocator.locator('input.e2e-view-part-id').nth(i).fill(view.partId);
      await viewsLocator.locator('input.e2e-view-position').nth(i).fill(view.position?.toString() ?? '');
      await new SciCheckboxPO(viewsLocator.locator('sci-checkbox.e2e-view-activate-view').nth(i)).toggle(view.activateView === true);
      await new SciCheckboxPO(viewsLocator.locator('sci-checkbox.e2e-view-activate-part').nth(i)).toggle(view.activatePart === true);
    }
  }
}

export interface PerspectiveDefinition {
  id: string;
  transient?: true;
  parts: PerspectivePartDescriptor[];
  views?: PerspectiveViewDescriptor[];
  data?: {[key: string]: any};
}

export interface PerspectivePartDescriptor {
  id: string | MAIN_AREA;
  relativeTo?: string;
  align?: 'left' | 'right' | 'top' | 'bottom';
  ratio?: number;
  activate?: boolean;
}

export interface PerspectiveViewDescriptor {
  id: string;
  partId: string;
  position?: number;
  activateView?: boolean;
  activatePart?: boolean;
}
