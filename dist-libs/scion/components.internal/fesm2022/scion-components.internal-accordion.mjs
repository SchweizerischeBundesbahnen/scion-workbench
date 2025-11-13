import * as i0 from '@angular/core';
import { inject, TemplateRef, input, Directive, ElementRef, ChangeDetectorRef, DestroyRef, viewChild, contentChildren, HostBinding, Component } from '@angular/core';
import { transition, style, animate, trigger } from '@angular/animations';
import { CdkAccordion, CdkAccordionItem } from '@angular/cdk/accordion';
import { debounceTime } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { SciMaterialIconDirective } from '@scion/components.internal/material-icon';
import { fromResize$ } from '@scion/toolkit/observable';
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
 * Use this directive to model an accordion item for {SciAccordionComponent}.
 * The host element of this modelling directive must be a <ng-template>.
 *
 * ---
 * Example usage:
 *
 * <sci-accordion>
 *   @for (item of items$ | async; track item.id) {
 *     <!-- item -->
 *     <ng-template sciAccordionItem [key]="item.id" [panel]="panel">
 *       ...
 *     </ng-template>
 *
 *     <!-- item panel -->
 *     <ng-template #panel>
 *       ...
 *     </ng-template>
 *   }
 * </sci-accordion>
 */
class SciAccordionItemDirective {
    template = inject(TemplateRef);
    /**
     * Provide template(s) to be rendered as actions of this list item.
     */
    panel = input.required(...(ngDevMode ? [{ debugName: "panel" }] : []));
    /**
     * Optional key to identify this item and is used as key for the {TrackBy} function.
     */
    key = input(...(ngDevMode ? [undefined, { debugName: "key" }] : []));
    /**
     * Indicates whether to expand this item.
     */
    expanded = input(...(ngDevMode ? [undefined, { debugName: "expanded" }] : []));
    /**
     * Specifies CSS class(es) added to the <section> and <wb-view> elements, e.g. used for e2e testing.
     */
    cssClass = input(...(ngDevMode ? [undefined, { debugName: "cssClass" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciAccordionItemDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "17.1.0", version: "21.0.0-rc.1", type: SciAccordionItemDirective, isStandalone: true, selector: "ng-template[sciAccordionItem]", inputs: { panel: { classPropertyName: "panel", publicName: "panel", isSignal: true, isRequired: true, transformFunction: null }, key: { classPropertyName: "key", publicName: "key", isSignal: true, isRequired: false, transformFunction: null }, expanded: { classPropertyName: "expanded", publicName: "expanded", isSignal: true, isRequired: false, transformFunction: null }, cssClass: { classPropertyName: "cssClass", publicName: "cssClass", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciAccordionItemDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[sciAccordionItem]' }]
        }], propDecorators: { panel: [{ type: i0.Input, args: [{ isSignal: true, alias: "panel", required: true }] }], key: [{ type: i0.Input, args: [{ isSignal: true, alias: "key", required: false }] }], expanded: [{ type: i0.Input, args: [{ isSignal: true, alias: "expanded", required: false }] }], cssClass: [{ type: i0.Input, args: [{ isSignal: true, alias: "cssClass", required: false }] }] } });

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
 * Component that shows items in an accordion.
 *
 * An accordion item is contributed as content child in the form of a `<ng-template>` decorated with `sciAccordionItem` directive,
 * and its panel modelled in the form of a `<ng-template>` and given as input to its `sciAccordionItem` directive.
 *
 * Accordion panel content is added to a CSS grid container with a single column, filling remaining space vertically and horizontally.
 *
 * ---
 * Example of a simple accordion:
 *
 * <sci-accordion>
 *   @for (item of items$ | async; track item.id) {
 *     <!-- item -->
 *     <ng-template sciAccordionItem [key]="item.id" [panel]="panel">
 *       ...
 *     </ng-template>
 *
 *     <!-- item panel -->
 *     <ng-template #panel>
 *       ...
 *     </ng-template>
 *   }
 * </sci-accordion>
 */
class SciAccordionComponent {
    /**
     * Whether the accordion should allow multiple expanded accordion items simultaneously.
     */
    multi = input(false, ...(ngDevMode ? [{ debugName: "multi" }] : []));
    /**
     * Specifies the style of the accordion.
     */
    variant = input('bubble', ...(ngDevMode ? [{ debugName: "variant" }] : []));
    _host = inject(ElementRef).nativeElement;
    /** Workaround for setting the filled state on initialization: https://github.com/angular/angular/issues/22560#issuecomment-473958144 */
    _cd = inject(ChangeDetectorRef, { skipSelf: true });
    _destroyRef = inject(DestroyRef);
    _cdkAccordion = viewChild.required(CdkAccordion, { read: ElementRef });
    items = contentChildren(SciAccordionItemDirective, ...(ngDevMode ? [{ debugName: "items" }] : []));
    get isBubbleVariant() {
        return this.variant() === 'bubble';
    }
    get isSolidVariant() {
        return this.variant() === 'solid';
    }
    filled = false;
    ngOnInit() {
        this.computeFilledStateOnDimensionChange();
    }
    trackByFn = (index, item) => {
        return item.key() ?? item;
    };
    onToggle(item) {
        item.toggle();
    }
    /**
     * Computes whether this accordion fills the boundaries of this component.
     * It does this on each dimension change and sets the CSS class 'filled'
     * accordingly.
     */
    computeFilledStateOnDimensionChange() {
        combineLatest([
            fromResize$(this._host),
            fromResize$(this._cdkAccordion().nativeElement),
        ])
            .pipe(debounceTime(5), // debounce dimension changes because the animation for expanding/collapsing a panel continuously emits resize events.
        takeUntilDestroyed(this._destroyRef))
            .subscribe(() => {
            this.filled = this._host.clientHeight <= this._cdkAccordion().nativeElement.offsetHeight;
            this._cd.detectChanges();
        });
    }
    /**
     * Returns animation metadata to expand accordion panel.
     */
    static provideEnterAnimation() {
        return [
            transition(':enter', [
                style({ opacity: 0, height: 0, overflow: 'hidden' }),
                animate('125ms ease-out', style({ opacity: 1, height: '*' })),
            ]),
        ];
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciAccordionComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "21.0.0-rc.1", type: SciAccordionComponent, isStandalone: true, selector: "sci-accordion", inputs: { multi: { classPropertyName: "multi", publicName: "multi", isSignal: true, isRequired: false, transformFunction: null }, variant: { classPropertyName: "variant", publicName: "variant", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.bubble": "this.isBubbleVariant", "class.solid": "this.isSolidVariant", "class.filled": "this.filled" } }, queries: [{ propertyName: "items", predicate: SciAccordionItemDirective, isSignal: true }], viewQueries: [{ propertyName: "_cdkAccordion", first: true, predicate: CdkAccordion, descendants: true, read: ElementRef, isSignal: true }], ngImport: i0, template: "<div cdkAccordion [multi]=\"multi()\" class=\"accordion\">\n  @for (item of items(); track trackByFn($index, item)) {\n    <section class=\"accordion-item e2e-accordion-item\"\n             [class.e2e-expanded]=\"cdkAccordionItem.expanded\"\n             [ngClass]=\"item.cssClass()\"\n             cdkAccordionItem #cdkAccordionItem=\"cdkAccordionItem\"\n             [expanded]=\"item.expanded() ?? false\">\n      <button (click)=\"onToggle(cdkAccordionItem)\" class=\"e2e-accordion-item-header\">\n        <ng-container *ngTemplateOutlet=\"item.template\"></ng-container>\n        <button [class.e2e-expand]=\"!cdkAccordionItem.expanded\"\n                [class.e2e-collapse]=\"cdkAccordionItem.expanded\"\n                sciMaterialIcon>\n          {{cdkAccordionItem.expanded ? 'expand_less' : 'expand_more'}}\n        </button>\n      </button>\n      @if (cdkAccordionItem.expanded) {\n        <section @enter>\n          <ng-container *ngTemplateOutlet=\"item.panel()\"></ng-container>\n        </section>\n      }\n    </section>\n  }\n</div>\n", styles: [":host{display:block;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner)}:host:not(.filled) section.accordion-item:last-child{border-bottom:1px solid var(--sci-color-border)}:host section.accordion-item{display:flex;flex-direction:column}:host section.accordion-item:has(*:focus-visible){outline:1px solid var(--sci-color-accent)}:host section.accordion-item:not(:first-child){border-top:1px solid var(--sci-color-border)}:host section.accordion-item>button{all:unset;display:inline-grid;grid-template-columns:1fr auto;grid-column-gap:.5em;align-items:center;padding:1em}:host section.accordion-item>section{display:grid;grid-template-columns:100%;gap:.5em}:host.solid section.accordion-item>section{margin:0 1em 1em}:host.bubble section.accordion-item>section{position:relative;background-color:var(--sci-color-gray-100);border-radius:var(--sci-corner);border:1px solid var(--sci-color-border);padding:1em;margin:0 .5em .5em}:host.bubble section.accordion-item>section:before,:host.bubble section.accordion-item>section:after{content:\"\";display:inline-block;position:absolute;border:8px solid transparent}:host.bubble section.accordion-item>section:before{top:-8px;left:42px;border-top-width:0;border-bottom-color:var(--sci-color-border)}:host.bubble section.accordion-item>section:after{top:-7px;left:42px;border-top-width:0;border-bottom-color:var(--sci-color-gray-100)}\n"], dependencies: [{ kind: "directive", type: NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "directive", type: CdkAccordion, selector: "cdk-accordion, [cdkAccordion]", inputs: ["multi"], exportAs: ["cdkAccordion"] }, { kind: "directive", type: CdkAccordionItem, selector: "cdk-accordion-item, [cdkAccordionItem]", inputs: ["expanded", "disabled"], outputs: ["closed", "opened", "destroyed", "expandedChange"], exportAs: ["cdkAccordionItem"] }, { kind: "directive", type: SciMaterialIconDirective, selector: "[sciMaterialIcon]" }], animations: [
            trigger('enter', SciAccordionComponent.provideEnterAnimation()),
        ] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.0.0-rc.1", ngImport: i0, type: SciAccordionComponent, decorators: [{
            type: Component,
            args: [{ selector: 'sci-accordion', imports: [
                        NgClass,
                        NgTemplateOutlet,
                        CdkAccordion,
                        CdkAccordionItem,
                        SciMaterialIconDirective,
                    ], animations: [
                        trigger('enter', SciAccordionComponent.provideEnterAnimation()),
                    ], template: "<div cdkAccordion [multi]=\"multi()\" class=\"accordion\">\n  @for (item of items(); track trackByFn($index, item)) {\n    <section class=\"accordion-item e2e-accordion-item\"\n             [class.e2e-expanded]=\"cdkAccordionItem.expanded\"\n             [ngClass]=\"item.cssClass()\"\n             cdkAccordionItem #cdkAccordionItem=\"cdkAccordionItem\"\n             [expanded]=\"item.expanded() ?? false\">\n      <button (click)=\"onToggle(cdkAccordionItem)\" class=\"e2e-accordion-item-header\">\n        <ng-container *ngTemplateOutlet=\"item.template\"></ng-container>\n        <button [class.e2e-expand]=\"!cdkAccordionItem.expanded\"\n                [class.e2e-collapse]=\"cdkAccordionItem.expanded\"\n                sciMaterialIcon>\n          {{cdkAccordionItem.expanded ? 'expand_less' : 'expand_more'}}\n        </button>\n      </button>\n      @if (cdkAccordionItem.expanded) {\n        <section @enter>\n          <ng-container *ngTemplateOutlet=\"item.panel()\"></ng-container>\n        </section>\n      }\n    </section>\n  }\n</div>\n", styles: [":host{display:block;border:1px solid var(--sci-color-border);border-radius:var(--sci-corner)}:host:not(.filled) section.accordion-item:last-child{border-bottom:1px solid var(--sci-color-border)}:host section.accordion-item{display:flex;flex-direction:column}:host section.accordion-item:has(*:focus-visible){outline:1px solid var(--sci-color-accent)}:host section.accordion-item:not(:first-child){border-top:1px solid var(--sci-color-border)}:host section.accordion-item>button{all:unset;display:inline-grid;grid-template-columns:1fr auto;grid-column-gap:.5em;align-items:center;padding:1em}:host section.accordion-item>section{display:grid;grid-template-columns:100%;gap:.5em}:host.solid section.accordion-item>section{margin:0 1em 1em}:host.bubble section.accordion-item>section{position:relative;background-color:var(--sci-color-gray-100);border-radius:var(--sci-corner);border:1px solid var(--sci-color-border);padding:1em;margin:0 .5em .5em}:host.bubble section.accordion-item>section:before,:host.bubble section.accordion-item>section:after{content:\"\";display:inline-block;position:absolute;border:8px solid transparent}:host.bubble section.accordion-item>section:before{top:-8px;left:42px;border-top-width:0;border-bottom-color:var(--sci-color-border)}:host.bubble section.accordion-item>section:after{top:-7px;left:42px;border-top-width:0;border-bottom-color:var(--sci-color-gray-100)}\n"] }]
        }], propDecorators: { multi: [{ type: i0.Input, args: [{ isSignal: true, alias: "multi", required: false }] }], variant: [{ type: i0.Input, args: [{ isSignal: true, alias: "variant", required: false }] }], _cdkAccordion: [{ type: i0.ViewChild, args: [i0.forwardRef(() => CdkAccordion), { ...{ read: ElementRef }, isSignal: true }] }], items: [{ type: i0.ContentChildren, args: [i0.forwardRef(() => SciAccordionItemDirective), { isSignal: true }] }], isBubbleVariant: [{
                type: HostBinding,
                args: ['class.bubble']
            }], isSolidVariant: [{
                type: HostBinding,
                args: ['class.solid']
            }], filled: [{
                type: HostBinding,
                args: ['class.filled']
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
 * Secondary entrypoint: '@scion/components.internal/accordion'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */

/**
 * Generated bundle index. Do not edit.
 */

export { SciAccordionComponent, SciAccordionItemDirective };
//# sourceMappingURL=scion-components.internal-accordion.mjs.map
