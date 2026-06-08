/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchToolbarFactory} from '@scion/workbench-client';
import {inject, Injector, isSignal, runInInjectionContext} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {SciMenuDescriptor, SciMenuFactory, SciToolbarButtonDescriptor, SciToolbarControlDescriptor, SciToolbarFactory, SciToolbarGroupDescriptor, SciToolbarMenuDescriptor} from '@scion/components/menu';
import {coerceWorkbenchMenuDescriptor, WorkbenchClientMenuFactoryDelegate} from './workbench-client-menu-factory-delegate';
import {MaybeSignal, SciComponentDescriptor, toLazyObservable} from '@scion/components/common';

/**
 * Represents a {@link SciToolbarFactory} that delegates to {@link WorkbenchToolbarFactory} of `@scion/workbench-client`.
 */
export class WorkbenchClientToolbarFactoryDelegate implements SciToolbarFactory {

  private readonly _injector = inject(Injector);

  constructor(private readonly _delegate: WorkbenchToolbarFactory) {
  }

  /** @inheritDoc */
  public addToolbarButton(descriptor: SciToolbarButtonDescriptor): this {
    this._delegate.addToolbarButton({
      name: descriptor.name,
      label: toLazyObservable(getLabelIfText(descriptor.label)),
      icon: toLazyObservable(getIconIfLigature(descriptor.icon)),
      checked: toLazyObservable(descriptor.checked),
      tooltip: toLazyObservable(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: toLazyObservable(descriptor.disabled),
      visible: toLazyObservable(descriptor.visible),
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      onSelect: () => runInInjectionContext(this._injector, descriptor.onSelect),
    });

    return this;
  }

  /** @inheritDoc */
  public addToolbarSplitButton(descriptor: SciToolbarButtonDescriptor & {menu?: SciMenuDescriptor['menu']}, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    this._delegate.addToolbarSplitButton({
      name: descriptor.name,
      label: toLazyObservable(getLabelIfText(descriptor.label)),
      icon: toLazyObservable(getIconIfLigature(descriptor.icon)),
      checked: toLazyObservable(descriptor.checked),
      tooltip: toLazyObservable(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: toLazyObservable(descriptor.disabled),
      visible: toLazyObservable(descriptor.visible),
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      onSelect: () => runInInjectionContext(this._injector, descriptor.onSelect),
      menu: coerceWorkbenchMenuDescriptor(descriptor.menu),
    }, menu => menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu)));

    return this;
  }

  /** @inheritDoc */
  public addToolbarMenu(descriptor: SciToolbarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    this._delegate.addToolbarMenu({
      name: descriptor.name,
      label: toLazyObservable(getLabelIfText(descriptor.label)),
      icon: toLazyObservable(getIconIfLigature(descriptor.icon)),
      tooltip: toLazyObservable(descriptor.tooltip),
      disabled: toLazyObservable(descriptor.disabled),
      visible: toLazyObservable(descriptor.visible),
      visualMenuIndicator: descriptor.visualMenuIndicator,
      cssClass: descriptor.cssClass,
      attributes: descriptor.attributes,
      menu: coerceWorkbenchMenuDescriptor(descriptor.menu),
    }, menu => menuFactoryFn(new WorkbenchClientMenuFactoryDelegate(menu)));

    return this;
  }

  /** @inheritDoc */
  public addToolbarControl(descriptor: SciToolbarControlDescriptor): this {
    throw Error('[MenuDefinitionError] Control not supported in microfrontend toolbar.');
  }

  /** @inheritDoc */
  public addToolbarSplitControl(descriptor: SciToolbarControlDescriptor & {menu?: SciMenuDescriptor['menu']}, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    throw Error('[MenuDefinitionError] Control not supported in microfrontend toolbar.');
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: SciToolbarFactory) => void): this;
  public addGroup(descriptor: SciToolbarGroupDescriptor, groupFactoryFn?: (group: SciToolbarFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: SciToolbarFactory) => void) | SciToolbarGroupDescriptor, factoryIfDescriptor?: (group: SciToolbarFactory) => void): this {
    const [descriptor, groupFactoryFn] = typeof factoryOrDescriptor === 'function' ? [{}, factoryOrDescriptor] : [factoryOrDescriptor, factoryIfDescriptor];

    this._delegate.addGroup({
      name: descriptor.name,
      disabled: toLazyObservable(descriptor.disabled),
      visible: toLazyObservable(descriptor.visible),
      cssClass: descriptor.cssClass,
    }, (group: WorkbenchToolbarFactory): void => {
      groupFactoryFn?.(new WorkbenchClientToolbarFactoryDelegate(group));
    });

    return this;
  }
}

function getLabelIfText(label: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor | undefined): MaybeSignal<string> | undefined {
  if (!label) {
    return undefined;
  }
  if (typeof label === 'string' || isSignal(label)) {
    return label;
  }

  throw Error('[MenuDefinitionError] Component not supported as label in microfrontend menu.');
}

function getIconIfLigature(icon: MaybeSignal<string> | ComponentType<unknown> | SciComponentDescriptor | undefined): MaybeSignal<string> | undefined {
  if (!icon) {
    return undefined;
  }
  if (typeof icon === 'string' || isSignal(icon)) {
    return icon;
  }

  throw Error('[MenuDefinitionError] Component not supported as icon in microfrontend menu.');
}
