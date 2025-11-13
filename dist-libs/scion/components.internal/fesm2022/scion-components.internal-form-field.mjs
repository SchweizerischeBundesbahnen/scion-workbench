import * as i0 from '@angular/core';
import { input, inject, ElementRef, HostBinding, Component } from '@angular/core';
import { ConfigurableFocusTrapFactory } from '@angular/cdk/a11y';

/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
class SciFormFieldComponent {
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    direction = input('row', ...(ngDevMode ? [{ debugName: "direction" }] : []));
    _focusTrap;
    get isColumnDirection() {
        return this.direction() === 'column';
    }
    constructor() {
        const host = inject(ElementRef).nativeElement;
        const focusTrapFactory = inject(ConfigurableFocusTrapFactory);
        this._focusTrap = focusTrapFactory.create(host);
        this._focusTrap.enabled = false;
    }
    onLabelClick() {
        this._focusTrap.enabled = true;
        this._focusTrap.focusFirstTabbableElement();
        this._focusTrap.enabled = false;
    }
    ngOnDestroy() {
        this._focusTrap.destroy();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciFormFieldComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "21.0.0-rc.1", type: SciFormFieldComponent, isStandalone: true, selector: "sci-form-field", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, direction: { classPropertyName: "direction", publicName: "direction", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.column-direction": "this.isColumnDirection" } }, ngImport: i0, template: "<!--eslint-disable-next-line @angular-eslint/template/click-events-have-key-events,@angular-eslint/template/interactive-supports-focus,@angular-eslint/template/label-has-associated-control -->\n<label (click)=\"onLabelClick()\">{{label()}}:</label>\n<div class=\"content\">\n  <ng-content/>\n</div>\n", styles: [":host{display:inline-flex;flex-flow:row wrap}:host.column-direction{flex-flow:column}:host.column-direction>label{flex:none;align-self:flex-start}:host>label{flex:0 1 130px;align-self:center;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;-webkit-user-select:none;user-select:none;margin-right:1em;margin-bottom:.25em}:host>div.content{flex:auto;display:grid}@layer form-field{:host>div.content ::ng-deep input,:host>div.content ::ng-deep textarea,:host>div.content ::ng-deep select{all:unset;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:.5em;transition:border-color ease-in-out .15s,color ease-in-out .15s;background-color:var(--sci-color-background-input);color:var(--sci-color-text);appearance:auto}:host>div.content ::ng-deep input:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)),:host>div.content ::ng-deep textarea:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)),:host>div.content ::ng-deep select:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)){border-color:var(--sci-color-accent)}:host>div.content ::ng-deep input.ng-invalid.ng-touched,:host>div.content ::ng-deep textarea.ng-invalid.ng-touched,:host>div.content ::ng-deep select.ng-invalid.ng-touched{border-color:var(--sci-color-negative)}:host>div.content ::ng-deep input:disabled,:host>div.content ::ng-deep input:has(input:disabled),:host>div.content ::ng-deep input:has(select:disabled),:host>div.content ::ng-deep textarea:disabled,:host>div.content ::ng-deep textarea:has(input:disabled),:host>div.content ::ng-deep textarea:has(select:disabled),:host>div.content ::ng-deep select:disabled,:host>div.content ::ng-deep select:has(input:disabled),:host>div.content ::ng-deep select:has(select:disabled){color:var(--sci-color-text-subtlest);background-color:var(--sci-color-background-input-disabled)}:host>div.content ::ng-deep input:read-only,:host>div.content ::ng-deep textarea:read-only,:host>div.content ::ng-deep select:read-only{color:var(--sci-color-text-subtle)}:host>div.content ::ng-deep input>option,:host>div.content ::ng-deep textarea>option,:host>div.content ::ng-deep select>option{background-color:var(--sci-color-background-elevation);color:var(--sci-color-text)}:host>div.content ::ng-deep input>option:hover,:host>div.content ::ng-deep textarea>option:hover,:host>div.content ::ng-deep select>option:hover{background-color:var(--sci-color-background-elevation-hover)}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciFormFieldComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-form-field', template: "<!--eslint-disable-next-line @angular-eslint/template/click-events-have-key-events,@angular-eslint/template/interactive-supports-focus,@angular-eslint/template/label-has-associated-control -->\n<label (click)=\"onLabelClick()\">{{label()}}:</label>\n<div class=\"content\">\n  <ng-content/>\n</div>\n", styles: [":host{display:inline-flex;flex-flow:row wrap}:host.column-direction{flex-flow:column}:host.column-direction>label{flex:none;align-self:flex-start}:host>label{flex:0 1 130px;align-self:center;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;-webkit-user-select:none;user-select:none;margin-right:1em;margin-bottom:.25em}:host>div.content{flex:auto;display:grid}@layer form-field{:host>div.content ::ng-deep input,:host>div.content ::ng-deep textarea,:host>div.content ::ng-deep select{all:unset;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner);padding:.5em;transition:border-color ease-in-out .15s,color ease-in-out .15s;background-color:var(--sci-color-background-input);color:var(--sci-color-text);appearance:auto}:host>div.content ::ng-deep input:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)),:host>div.content ::ng-deep textarea:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)),:host>div.content ::ng-deep select:focus-within:not(:disabled):not(:has(input:disabled)):not(:has(select:disabled)){border-color:var(--sci-color-accent)}:host>div.content ::ng-deep input.ng-invalid.ng-touched,:host>div.content ::ng-deep textarea.ng-invalid.ng-touched,:host>div.content ::ng-deep select.ng-invalid.ng-touched{border-color:var(--sci-color-negative)}:host>div.content ::ng-deep input:disabled,:host>div.content ::ng-deep input:has(input:disabled),:host>div.content ::ng-deep input:has(select:disabled),:host>div.content ::ng-deep textarea:disabled,:host>div.content ::ng-deep textarea:has(input:disabled),:host>div.content ::ng-deep textarea:has(select:disabled),:host>div.content ::ng-deep select:disabled,:host>div.content ::ng-deep select:has(input:disabled),:host>div.content ::ng-deep select:has(select:disabled){color:var(--sci-color-text-subtlest);background-color:var(--sci-color-background-input-disabled)}:host>div.content ::ng-deep input:read-only,:host>div.content ::ng-deep textarea:read-only,:host>div.content ::ng-deep select:read-only{color:var(--sci-color-text-subtle)}:host>div.content ::ng-deep input>option,:host>div.content ::ng-deep textarea>option,:host>div.content ::ng-deep select>option{background-color:var(--sci-color-background-elevation);color:var(--sci-color-text)}:host>div.content ::ng-deep input>option:hover,:host>div.content ::ng-deep textarea>option:hover,:host>div.content ::ng-deep select>option:hover{background-color:var(--sci-color-background-elevation-hover)}}\n"] }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], direction: [{ type: i0.Input, args: [{ isSignal: true, alias: "direction", required: false }] }], isColumnDirection: [{
                type: HostBinding,
                args: ['class.column-direction']
            }] } });

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
 * Secondary entrypoint: '@scion/components.internal/form-field'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciFormFieldComponent };
//# sourceMappingURL=scion-components.internal-form-field.mjs.map
