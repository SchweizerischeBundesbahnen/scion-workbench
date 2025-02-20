/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

/**
 * Angular standardizes component-less auxiliary routes by adding the `ɵEmptyOutletComponent` component,
 * but only for routes registered via {@link ROUTES} DI token or passed to {@link Router#resetConfig}.
 *
 * Consequently, auxiliary routes that the workbench dynamically registers based on the current workbench
 * state must also be standardized. However, we do not use Angular's {@link ɵEmptyOutletComponent} component
 * as it does not fill the content to the available space, required for view content.
 *
 * For more information, see the `standardizeConfig` function in Angular.
 */
@Component({
  templateUrl: './empty-outlet.component.html',
  styleUrls: ['./empty-outlet.component.scss'],
  imports: [RouterOutlet],
})
export class ɵEmptyOutletComponent {
}
