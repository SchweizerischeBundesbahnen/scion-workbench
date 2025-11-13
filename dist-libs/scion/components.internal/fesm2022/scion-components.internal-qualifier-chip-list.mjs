import * as i0 from '@angular/core';
import { input, ChangeDetectionStrategy, Component } from '@angular/core';
import { KeyValuePipe } from '@angular/common';

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/**
 * Displays the type and qualifier of a capability as chips.
 *
 * ## Styling
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-qualifier-chip-list` component, the following CSS variables can be set directly on the component.
 *
 * - --sci-qualifier-chip-list-type-background-color: Sets the background color of the type chip
 * - --sci-qualifier-chip-list-qualifier-background-color: Sets the background color of the qualifier chip
 *
 * ```css
 * sci-qualifier-chip-list {
 *   --sci-qualifier-chip-list-type-background-color: gray;
 * }
 * ```
 */
class SciQualifierChipListComponent {
    type = input(...(ngDevMode ? [undefined, { debugName: "type" }] : []));
    qualifier = input(...(ngDevMode ? [undefined, { debugName: "qualifier" }] : []));
    /**
     * Compares qualifier entries by their position in the object.
     */
    qualifierKeyCompareFn = (a, b) => {
        const keys = Object.keys(this.qualifier() ?? {});
        return keys.indexOf(a.key) - keys.indexOf(b.key);
    };
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciQualifierChipListComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.0-rc.1", type: SciQualifierChipListComponent, isStandalone: true, selector: "sci-qualifier-chip-list", inputs: { type: { classPropertyName: "type", publicName: "type", isSignal: true, isRequired: false, transformFunction: null }, qualifier: { classPropertyName: "qualifier", publicName: "qualifier", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "<ul>\n  @if (type()) {\n    <li class=\"type\">\n      <span class=\"type e2e-type\">{{type()}}</span>\n    </li>\n  }\n  @for (entry of (qualifier() ?? {}) | keyvalue:qualifierKeyCompareFn; track entry) {\n    <li class=\"e2e-qualifier-entry\">\n      <span class=\"key e2e-key\">{{entry.key}}</span>\n      <span class=\"value e2e-value\">{{entry.value}}</span>\n    </li>\n  }\n</ul>\n", styles: ["@charset \"UTF-8\";:host>ul{list-style:none;padding:0;margin:0;display:flex}:host>ul>li{border:1px solid var(--sci-color-border);background-color:var(--sci-qualifier-chip-list-qualifier-background-color, initial);color:var(--sci-color-text);border-radius:var(--sci-corner-small);padding:.25em .5em;font-size:smaller;-webkit-user-select:none;user-select:none;margin-bottom:.25em}:host>ul>li:not(:last-child){margin-right:.25em}:host>ul>li{display:flex;flex-direction:column;align-items:center;padding:.25em 1em}:host>ul>li>span.key{color:var(--sci-color-text-subtle)}:host>ul>li:before{display:block;content:\"\\abqualifier\\bb\";font-size:smaller;margin-bottom:.75em;color:var(--sci-color-text-subtlest)}:host>ul>li.type{border:1px solid var(--sci-color-border);background-color:var(--sci-qualifier-chip-list-type-background-color, var(--sci-color-gray-100));color:var(--sci-color-text);border-radius:var(--sci-corner-small);padding:.25em .5em;font-size:smaller;-webkit-user-select:none;user-select:none;margin-bottom:.25em}:host>ul>li.type:not(:last-child){margin-right:.25em}:host>ul>li.type{min-width:75px}:host>ul>li.type>span.type{font-size:1.5em;font-variant:small-caps;font-weight:700}:host>ul>li.type:before{content:\"\\abtype\\bb\";color:var(--sci-color-text-subtlest)}\n"], dependencies: [{ kind: "pipe", type: KeyValuePipe, name: "keyvalue" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciQualifierChipListComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-qualifier-chip-list', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        KeyValuePipe,
                    ], template: "<ul>\n  @if (type()) {\n    <li class=\"type\">\n      <span class=\"type e2e-type\">{{type()}}</span>\n    </li>\n  }\n  @for (entry of (qualifier() ?? {}) | keyvalue:qualifierKeyCompareFn; track entry) {\n    <li class=\"e2e-qualifier-entry\">\n      <span class=\"key e2e-key\">{{entry.key}}</span>\n      <span class=\"value e2e-value\">{{entry.value}}</span>\n    </li>\n  }\n</ul>\n", styles: ["@charset \"UTF-8\";:host>ul{list-style:none;padding:0;margin:0;display:flex}:host>ul>li{border:1px solid var(--sci-color-border);background-color:var(--sci-qualifier-chip-list-qualifier-background-color, initial);color:var(--sci-color-text);border-radius:var(--sci-corner-small);padding:.25em .5em;font-size:smaller;-webkit-user-select:none;user-select:none;margin-bottom:.25em}:host>ul>li:not(:last-child){margin-right:.25em}:host>ul>li{display:flex;flex-direction:column;align-items:center;padding:.25em 1em}:host>ul>li>span.key{color:var(--sci-color-text-subtle)}:host>ul>li:before{display:block;content:\"\\abqualifier\\bb\";font-size:smaller;margin-bottom:.75em;color:var(--sci-color-text-subtlest)}:host>ul>li.type{border:1px solid var(--sci-color-border);background-color:var(--sci-qualifier-chip-list-type-background-color, var(--sci-color-gray-100));color:var(--sci-color-text);border-radius:var(--sci-corner-small);padding:.25em .5em;font-size:smaller;-webkit-user-select:none;user-select:none;margin-bottom:.25em}:host>ul>li.type:not(:last-child){margin-right:.25em}:host>ul>li.type{min-width:75px}:host>ul>li.type>span.type{font-size:1.5em;font-variant:small-caps;font-weight:700}:host>ul>li.type:before{content:\"\\abtype\\bb\";color:var(--sci-color-text-subtlest)}\n"] }]
        }], propDecorators: { type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: false }] }], qualifier: [{ type: i0.Input, args: [{ isSignal: true, alias: "qualifier", required: false }] }] } });

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
/*
 * Secondary entrypoint: '@scion/components.internal/qualifier-chip-list'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciQualifierChipListComponent };
//# sourceMappingURL=scion-components.internal-qualifier-chip-list.mjs.map
