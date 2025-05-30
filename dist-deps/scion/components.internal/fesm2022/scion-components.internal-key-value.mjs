import * as i0 from '@angular/core';
import { input, computed, untracked, ChangeDetectionStrategy, Component } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { Dictionaries } from '@scion/toolkit/util';

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
 * Displays key-value pairs of an object.
 */
class SciKeyValueComponent {
    object = input();
    flattenedProperties = computed(() => {
        const object = this.object() ?? {};
        return untracked(() => this.flattenObject(object));
    });
    /**
     * Compares qualifier entries by their position in the object.
     */
    keyCompareFn = (a, b) => {
        const keys = Object.keys(this.flattenedProperties());
        return keys.indexOf(a.key) - keys.indexOf(b.key);
    };
    flattenObject(property, path = []) {
        if (property instanceof Map) {
            return this.flattenObject(Dictionaries.coerce(property), path);
        }
        return Object.entries(property).reduce((acc, [key, value]) => {
            if (typeof value === 'object' && value !== null) {
                return { ...acc, ...this.flattenObject(value, [...path, key]) };
            }
            else {
                const propName = [...path, key].join('.');
                return { ...acc, ...{ [propName]: value } };
            }
        }, {});
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciKeyValueComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.0.0", type: SciKeyValueComponent, isStandalone: true, selector: "sci-key-value", inputs: { object: { classPropertyName: "object", publicName: "object", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@for (property of flattenedProperties() | keyvalue:keyCompareFn; track property) {\n  <span class=\"key\"><span class=\"e2e-key\">{{property.key}}</span>:</span>\n  <span class=\"value e2e-value\">{{property.value}}</span>\n}\n", styles: [":host{display:grid;grid-template-columns:max-content 3fr;grid-column-gap:1em;grid-row-gap:.5em;grid-auto-rows:auto}:host>span.key{overflow:hidden;text-overflow:ellipsis}:host>span.value{overflow:hidden;text-overflow:ellipsis}\n"], dependencies: [{ kind: "pipe", type: KeyValuePipe, name: "keyvalue" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciKeyValueComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-key-value', changeDetection: ChangeDetectionStrategy.OnPush, imports: [
                        KeyValuePipe,
                    ], template: "@for (property of flattenedProperties() | keyvalue:keyCompareFn; track property) {\n  <span class=\"key\"><span class=\"e2e-key\">{{property.key}}</span>:</span>\n  <span class=\"value e2e-value\">{{property.value}}</span>\n}\n", styles: [":host{display:grid;grid-template-columns:max-content 3fr;grid-column-gap:1em;grid-row-gap:.5em;grid-auto-rows:auto}:host>span.key{overflow:hidden;text-overflow:ellipsis}:host>span.value{overflow:hidden;text-overflow:ellipsis}\n"] }]
        }] });

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
 * Secondary entrypoint: '@scion/components.internal/key-value'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciKeyValueComponent };
//# sourceMappingURL=scion-components.internal-key-value.mjs.map
