/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms from the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Locator} from '@playwright/test';
import {coerceArray, commandsToPath, toMatrixNotation} from '../../../helper/testing.util';
import {PartDescriptor, PartNavigationDescriptor, ViewDescriptor, ViewNavigationDescriptor} from './layout.model';
import {SciCheckboxPO} from '../../../@scion/components.internal/checkbox.po';

export const LayoutPages = {

  /**
   * Enters parts into {@link AddPartsComponent}.
   */
  enterParts: async (locator: Locator, parts: PartDescriptor[]): Promise<void> => {
    for (const [i, part] of parts.entries()) {
      await locator.locator('button.e2e-add').click();
      await locator.locator('input.e2e-part-id').nth(i).fill(part.id);
      await new SciCheckboxPO(locator.locator('sci-checkbox.e2e-activate-part').nth(i)).toggle(part.activate === true);
      if (part.relativeTo !== undefined) {
        await locator.locator('input.e2e-relative-to').nth(i).fill(part.relativeTo ?? '');
      }
      if (part.align !== undefined) {
        await locator.locator('select.e2e-align').nth(i).selectOption(part.align ?? null);
      }
      if (part.ratio !== undefined) {
        await locator.locator('input.e2e-ratio').nth(i).fill(`${part.ratio ?? ''}`);
      }
    }
  },

  /**
   * Enters views into {@link AddViewsComponent}.
   */
  enterViews: async (locator: Locator, views: ViewDescriptor[] = []): Promise<void> => {
    for (const [i, view] of views.entries()) {
      await locator.locator('button.e2e-add').click();
      await locator.locator('input.e2e-view-id').nth(i).fill(view.id);
      await locator.locator('input.e2e-part-id').nth(i).fill(view.partId);
      await locator.locator('input.e2e-position').nth(i).fill(view.position?.toString() ?? '');
      await locator.locator('input.e2e-class').nth(i).fill(coerceArray(view.cssClass).join(' '));
      await new SciCheckboxPO(locator.locator('sci-checkbox.e2e-activate-view').nth(i)).toggle(view.activateView === true);
      await new SciCheckboxPO(locator.locator('sci-checkbox.e2e-activate-part').nth(i)).toggle(view.activatePart === true);
    }
  },

  /**
   * Enters part navigations into {@link NavigatePartsComponent}.
   */
  enterPartNavigations: async (locator: Locator, partNavigations: PartNavigationDescriptor[] = []): Promise<void> => {
    for (const [i, partNavigation] of partNavigations.entries()) {
      await locator.locator('button.e2e-add').click();
      await locator.locator('input.e2e-part-id').nth(i).fill(partNavigation.id);
      await locator.locator('input.e2e-commands').nth(i).fill(commandsToPath(partNavigation.commands));
      await locator.locator('input.e2e-hint').nth(i).fill(partNavigation.hint ?? '');
      await locator.locator('input.e2e-data').nth(i).fill(toMatrixNotation(partNavigation.data));
      await locator.locator('input.e2e-state').nth(i).fill(toMatrixNotation(partNavigation.state));
      await locator.locator('input.e2e-class').nth(i).fill(coerceArray(partNavigation.cssClass).join(' '));
    }
  },

  /**
   * Enters view navigations into {@link NavigateViewsComponent}.
   */
  enterViewNavigations: async (locator: Locator, viewNavigations: ViewNavigationDescriptor[] = []): Promise<void> => {
    for (const [i, viewNavigation] of viewNavigations.entries()) {
      await locator.locator('button.e2e-add').click();
      await locator.locator('input.e2e-view-id').nth(i).fill(viewNavigation.id);
      await locator.locator('input.e2e-commands').nth(i).fill(commandsToPath(viewNavigation.commands));
      await locator.locator('input.e2e-hint').nth(i).fill(viewNavigation.hint ?? '');
      await locator.locator('input.e2e-data').nth(i).fill(toMatrixNotation(viewNavigation.data));
      await locator.locator('input.e2e-state').nth(i).fill(toMatrixNotation(viewNavigation.state));
      await locator.locator('input.e2e-class').nth(i).fill(coerceArray(viewNavigation.cssClass).join(' '));
    }
  },
} as const;
