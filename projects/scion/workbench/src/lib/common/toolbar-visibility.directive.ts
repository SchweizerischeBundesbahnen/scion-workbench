/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Directive, inject} from '@angular/core';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';

/**
 * Displays the toolbar based on the `scion.workbench.appearance.toolbar.visibility` setting.
 *
 * Use with `workbench.toolbar-visibility` SCSS mixin.
 *
 * Usage:
 * ```html
 * <sci-toolbar name="toolbar:main" wbToolbarVisibility/>
 * ```
 *
 * ```css
 * @use 'workbench.mixin';
 *
 * :host {
 *   &:hover {
 *     --on-hover: true;
 *   }
 *
 *   &:focus-within {
 *     --on-focus: true;
 *   }
 *
 *   sci-toolbar {
 *     @include workbench.toolbar-visibility(on-hover, on-focus);
 *   }
 * }
 * ```
 *
 * @see workbench.mixin.scss
 */
@Directive({
  selector: 'sci-toolbar[wbToolbarVisibility]',
  host: {
    '[attr.data-visibility]': `workbenchLayoutService.toolbarVisibility() === 'always' ? 'always' : null`,
  },
})
export class ToolbarVisibilityDirective {

  protected readonly workbenchLayoutService = inject(WorkbenchLayoutService);
}
