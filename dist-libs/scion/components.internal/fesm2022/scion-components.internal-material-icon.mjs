import * as i0 from '@angular/core';
import { HostBinding, Directive } from '@angular/core';

/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Enables the host to render a Material ligature.
 *
 * Ligatures from following fonts are supported:
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined
 * - https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp
 * - https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Round|Material+Icons+Sharp
 */
class SciMaterialIconDirective {
    materialIcons = true;
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciMaterialIconDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "21.0.0-rc.1", type: SciMaterialIconDirective, isStandalone: true, selector: "[sciMaterialIcon]", host: { properties: { "class.material-icons": "this.materialIcons", "class.material-icons-outlined": "this.materialIcons", "class.material-icons-round": "this.materialIcons", "class.material-icons-sharp": "this.materialIcons", "class.material-symbols-sharp": "this.materialIcons", "class.material-symbols-outlined": "this.materialIcons", "class.material-symbols-rounded": "this.materialIcons" } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciMaterialIconDirective, decorators: [{
            type: Directive,
            args: [{ selector: '[sciMaterialIcon]' }]
        }], propDecorators: { materialIcons: [{
                type: HostBinding,
                args: ['class.material-icons']
            }, {
                type: HostBinding,
                args: ['class.material-icons-outlined']
            }, {
                type: HostBinding,
                args: ['class.material-icons-round']
            }, {
                type: HostBinding,
                args: ['class.material-icons-sharp']
            }, {
                type: HostBinding,
                args: ['class.material-symbols-sharp']
            }, {
                type: HostBinding,
                args: ['class.material-symbols-outlined']
            }, {
                type: HostBinding,
                args: ['class.material-symbols-rounded']
            }] } });

/*
 * Copyright (c) 2018-2013 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/*
 * Secondary entrypoint: '@scion/components.internal/material-icon'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciMaterialIconDirective };
//# sourceMappingURL=scion-components.internal-material-icon.mjs.map
