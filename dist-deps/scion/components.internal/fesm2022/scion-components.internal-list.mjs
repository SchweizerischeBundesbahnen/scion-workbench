import * as i0 from '@angular/core';
import { input, inject, TemplateRef, Directive, ElementRef, HostBinding, Component, output, viewChildren, viewChild, contentChildren, Injector, HostListener } from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { Arrays } from '@scion/toolkit/util';
import { NgTemplateOutlet, NgClass } from '@angular/common';
import { SciMaterialIconDirective } from '@scion/components.internal/material-icon';
import { SciFilterFieldComponent } from '@scion/components.internal/filter-field';
import { map, filter } from 'rxjs/operators';
import { SciViewportComponent } from '@scion/components/viewport';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
 * Use this directive to model a list item for {SciListComponent}.
 * The host element of this modelling directive must be a <ng-template>.
 *
 * ---
 * Example usage:
 *
 * <sci-list (filter)="onFilter($event)">
 *   @for (item of items$ | async; track item.id) {
 *     <ng-template sciListItem>
 *       <app-list-item [item]="item"></app-list-item>
 *     </ng-template>
 *   }
 * </sci-list>
 */
class SciListItemDirective {
    /**
     * Optional key to identify this item and is used to emit selection and internally as key for the {TrackBy} function.
     */
    key = input();
    /**
     * Provide template(s) to be rendered as actions of this list item.
     */
    actions = input([], { transform: (actions) => Arrays.coerce(actions) });
    template = inject(TemplateRef);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciListItemDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "20.0.0", type: SciListItemDirective, isStandalone: true, selector: "ng-template[sciListItem]", inputs: { key: { classPropertyName: "key", publicName: "key", isSignal: true, isRequired: false, transformFunction: null }, actions: { classPropertyName: "actions", publicName: "actions", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciListItemDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[sciListItem]' }]
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
class SciListItemComponent {
    listItem = input.required();
    style = input.required();
    active = input(false);
    _host = inject(ElementRef).nativeElement;
    tabindex = -1;
    get isActive() {
        return this.active();
    }
    get optionStyle() {
        return this.style() === 'option-item';
    }
    /**
     * @implements FocusableOption
     */
    focus(origin) {
        this._host.focus();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciListItemComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.0.0", type: SciListItemComponent, isStandalone: true, selector: "sci-list-item", inputs: { listItem: { classPropertyName: "listItem", publicName: "listItem", isSignal: true, isRequired: true, transformFunction: null }, style: { classPropertyName: "style", publicName: "style", isSignal: true, isRequired: true, transformFunction: null }, active: { classPropertyName: "active", publicName: "active", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "attr.tabindex": "this.tabindex", "class.active": "this.isActive", "class.option": "this.optionStyle" } }, ngImport: i0, template: "<!-- radio button for option items -->\n@if (optionStyle) {\n  <span class=\"option\" sciMaterialIcon>\n    {{active() ? 'radio_button_checked' : 'radio_button_unchecked'}}\n  </span>\n}\n\n<!-- item -->\n<div class=\"item e2e-item\">\n  <ng-container *ngTemplateOutlet=\"listItem().template\"></ng-container>\n</div>\n\n<!-- actions -->\n@if (listItem().actions().length) {\n  <ul class=\"actions e2e-actions\">\n    @for (action of listItem().actions(); track action) {\n      <li class=\"e2e-action\">\n        <ng-container *ngTemplateOutlet=\"action\"></ng-container>\n      </li>\n    }\n  </ul>\n}\n", styles: [":host{display:flex;align-items:center;outline:none;padding:var(--sci-list-item-padding, 1em)}:host>span.option{flex:none;margin-right:.5em;-webkit-user-select:none;user-select:none}:host>div.item{flex:auto;text-overflow:ellipsis;overflow:hidden}:host>ul.actions{flex:none;display:flex;list-style:none;margin:0;padding:0;visibility:hidden}:host:hover>ul.actions,:host:focus-within>ul.actions{visibility:visible}:host.active>div.main,:host.active>span.option{color:var(--sci-color-accent)}\n"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: SciMaterialIconDirective, selector: "[sciMaterialIcon]" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciListItemComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-list-item', imports: [
                        NgTemplateOutlet,
                        SciMaterialIconDirective,
                    ], template: "<!-- radio button for option items -->\n@if (optionStyle) {\n  <span class=\"option\" sciMaterialIcon>\n    {{active() ? 'radio_button_checked' : 'radio_button_unchecked'}}\n  </span>\n}\n\n<!-- item -->\n<div class=\"item e2e-item\">\n  <ng-container *ngTemplateOutlet=\"listItem().template\"></ng-container>\n</div>\n\n<!-- actions -->\n@if (listItem().actions().length) {\n  <ul class=\"actions e2e-actions\">\n    @for (action of listItem().actions(); track action) {\n      <li class=\"e2e-action\">\n        <ng-container *ngTemplateOutlet=\"action\"></ng-container>\n      </li>\n    }\n  </ul>\n}\n", styles: [":host{display:flex;align-items:center;outline:none;padding:var(--sci-list-item-padding, 1em)}:host>span.option{flex:none;margin-right:.5em;-webkit-user-select:none;user-select:none}:host>div.item{flex:auto;text-overflow:ellipsis;overflow:hidden}:host>ul.actions{flex:none;display:flex;list-style:none;margin:0;padding:0;visibility:hidden}:host:hover>ul.actions,:host:focus-within>ul.actions{visibility:visible}:host.active>div.main,:host.active>span.option{color:var(--sci-color-accent)}\n"] }]
        }], propDecorators: { tabindex: [{
                type: HostBinding,
                args: ['attr.tabindex']
            }], isActive: [{
                type: HostBinding,
                args: ['class.active']
            }], optionStyle: [{
                type: HostBinding,
                args: ['class.option']
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
/**
 * Component that contains a list of items or options which can be optionally filtered and associated with actions.
 *
 * List items are contributed as content children in the form of a `<ng-template>` decorated with `sciListItem` directive.
 * Actions are modelled in the form of a `<ng-template>` and are inputs for respective `sciListItem` directive.
 *
 * ---
 * Example of a simple list:
 *
 * <sci-list (filter)="onFilter($event)">
 *   @for (item of items$ | async; track item.id) {
 *     <ng-template sciListItem>
 *       ...
 *     </ng-template>
 *   }
 * </sci-list>
 *
 *
 * ---
 * Example of a list with actions:
 *
 * <sci-list (filter)="onFilter($event)">
 *   @for (item of items$ | async; track item.id) {
 *     <!-- list item -->
 *     <ng-template sciListItem [actions]="delete_action">
 *       ...
 *     </ng-template>
 *
 *     <!-- action -->
 *     <ng-template #delete_action>
 *       <button class="material-icons" (click)="onDelete(item.id)">delete</button>
 *     </ng-template>
 *     }
 * </sci-list>
 *
 * ## Styling
 *
 * To customize the default look of SCION components or support different themes, configure the `@scion/components` SCSS module in `styles.scss`.
 * To style a specific `sci-list` component, the following CSS variables can be set directly on the component.
 *
 * - --sci-list-item-padding: Sets the padding of a list item.
 *
 * ```css
 * sci-list {
 *   --sci-list-item-padding: 0;
 * }
 * ```
 */
class SciListComponent {
    /**
     * Specifies where to position the filter field.
     * If not specified, does not display the filter field.
     */
    filterPosition = input();
    /**
     * Specifies whether to render list items or option items.
     */
    style = input('list-item');
    /**
     * Sets focus order in sequential keyboard navigation.
     * If not specified, the focus order is according to the position in the document (tabindex=0).
     */
    tabindex = input();
    /**
     * Emits selected item key on selection change.
     */
    selection = output();
    /**
     * Emits filter text on filter change.
     */
    filter = output();
    _listItemComponents = viewChildren(SciListItemComponent);
    _filterField = viewChild(SciFilterFieldComponent);
    _focusKeyManager;
    listItems = contentChildren(SciListItemDirective);
    componentTabindex = -1; // component itself is not focusable in sequential keyboard navigation, but tabindex (if any) set to filter field
    constructor() {
        this._focusKeyManager = new FocusKeyManager(this._listItemComponents, inject(Injector));
        this._focusKeyManager.change
            .pipe(map(index => this.listItems()[index]), filter(Boolean), filter(listItem => !!listItem.key()), takeUntilDestroyed())
            .subscribe((listItem) => {
            this.selection.emit(listItem.key());
        });
    }
    onKeydown(event) {
        this._focusKeyManager.onKeydown(event);
    }
    focus() {
        this._filterField()?.focus();
    }
    onItemClick(item) {
        this._focusKeyManager.setActiveItem(item);
    }
    onFilter(filterText) {
        this._focusKeyManager.setActiveItem(-1);
        this.filter.emit(filterText);
    }
    onAnyKey(event) {
        this._filterField()?.focusAndApplyKeyboardEvent(event);
    }
    get activeItem() {
        return this._focusKeyManager.activeItem ?? null;
    }
    trackByFn = (index, item) => {
        return item.key() ?? item;
    };
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciListComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.0.0", type: SciListComponent, isStandalone: true, selector: "sci-list", inputs: { filterPosition: { classPropertyName: "filterPosition", publicName: "filterPosition", isSignal: true, isRequired: false, transformFunction: null }, style: { classPropertyName: "style", publicName: "style", isSignal: true, isRequired: false, transformFunction: null }, tabindex: { classPropertyName: "tabindex", publicName: "tabindex", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selection: "selection", filter: "filter" }, host: { listeners: { "keydown": "onKeydown($event)", "focus": "focus()" }, properties: { "attr.tabindex": "this.componentTabindex" } }, queries: [{ propertyName: "listItems", predicate: SciListItemDirective, isSignal: true }], viewQueries: [{ propertyName: "_listItemComponents", predicate: SciListItemComponent, descendants: true, isSignal: true }, { propertyName: "_filterField", first: true, predicate: SciFilterFieldComponent, descendants: true, isSignal: true }], ngImport: i0, template: "@if (filterPosition() === 'top') {\n  <ng-container *ngTemplateOutlet=\"filter_template\"/>\n}\n\n<!-- viewport and list items -->\n<sci-viewport (keydown)=\"onAnyKey($event)\">\n  @for (listItem of listItems(); track trackByFn($index, listItem)) {\n    <sci-list-item #item\n                   [listItem]=\"listItem\"\n                   [style]=\"style()\"\n                   [active]=\"activeItem === item\"\n                   (click)=\"onItemClick(item)\"/>\n  }\n</sci-viewport>\n\n@if (filterPosition() === 'bottom') {\n  <ng-container *ngTemplateOutlet=\"filter_template\"/>\n}\n\n<ng-template #filter_template>\n  <sci-filter-field (filter)=\"onFilter($event)\" [ngClass]=\"filterPosition()!\" [tabindex]=\"tabindex() ?? 0\"/>\n</ng-template>\n", styles: [":host{display:flex;flex-direction:column;outline:none}:host>sci-filter-field{flex:none}:host>sci-filter-field.top{margin-bottom:.3em}:host>sci-filter-field.bottom{margin-top:.3em}:host>sci-viewport{flex:1 1 0;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner)}:host>sci-viewport::part(content){display:flex;flex-direction:column}:host>sci-viewport sci-list-item:not(:first-child){border-top:1px solid var(--sci-color-border)}:host>sci-viewport sci-list-item:last-child{border-bottom:1px solid var(--sci-color-border)}\n"], dependencies: [{ kind: "component", type: SciViewportComponent, selector: "sci-viewport", inputs: ["scrollbarStyle"], outputs: ["scroll"] }, { kind: "component", type: SciListItemComponent, selector: "sci-list-item", inputs: ["listItem", "style", "active"] }, { kind: "component", type: SciFilterFieldComponent, selector: "sci-filter-field", inputs: ["tabindex", "placeholder", "disabled"], outputs: ["filter"] }, { kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0", ngImport: i0, type: SciListComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-list', imports: [
                        SciViewportComponent,
                        SciListItemComponent,
                        SciFilterFieldComponent,
                        NgClass,
                        NgTemplateOutlet,
                    ], template: "@if (filterPosition() === 'top') {\n  <ng-container *ngTemplateOutlet=\"filter_template\"/>\n}\n\n<!-- viewport and list items -->\n<sci-viewport (keydown)=\"onAnyKey($event)\">\n  @for (listItem of listItems(); track trackByFn($index, listItem)) {\n    <sci-list-item #item\n                   [listItem]=\"listItem\"\n                   [style]=\"style()\"\n                   [active]=\"activeItem === item\"\n                   (click)=\"onItemClick(item)\"/>\n  }\n</sci-viewport>\n\n@if (filterPosition() === 'bottom') {\n  <ng-container *ngTemplateOutlet=\"filter_template\"/>\n}\n\n<ng-template #filter_template>\n  <sci-filter-field (filter)=\"onFilter($event)\" [ngClass]=\"filterPosition()!\" [tabindex]=\"tabindex() ?? 0\"/>\n</ng-template>\n", styles: [":host{display:flex;flex-direction:column;outline:none}:host>sci-filter-field{flex:none}:host>sci-filter-field.top{margin-bottom:.3em}:host>sci-filter-field.bottom{margin-top:.3em}:host>sci-viewport{flex:1 1 0;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner)}:host>sci-viewport::part(content){display:flex;flex-direction:column}:host>sci-viewport sci-list-item:not(:first-child){border-top:1px solid var(--sci-color-border)}:host>sci-viewport sci-list-item:last-child{border-bottom:1px solid var(--sci-color-border)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { componentTabindex: [{
                type: HostBinding,
                args: ['attr.tabindex']
            }], onKeydown: [{
                type: HostListener,
                args: ['keydown', ['$event']]
            }], focus: [{
                type: HostListener,
                args: ['focus']
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
 * Secondary entrypoint: '@scion/components.internal/list'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciListComponent, SciListItemDirective };
//# sourceMappingURL=scion-components.internal-list.mjs.map
