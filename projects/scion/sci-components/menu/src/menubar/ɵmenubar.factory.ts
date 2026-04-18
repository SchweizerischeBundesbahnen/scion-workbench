import {isSignal, Signal} from '@angular/core';
import {Arrays} from '@scion/toolkit/util';
import {SciMenu} from '../menu.model';
import {ɵSciMenuFactory} from '../menu/ɵmenu.factory';
import {coerceSignal, MaybeSignal} from '@scion/sci-components/common';
import {Translatable} from '@scion/sci-components/text';
import {translate} from '../menu-translate.util';
import {SciMenubarFactory, SciMenubarMenuDescriptor} from './menubar.factory';
import {SciMenuFactory} from '../menu/menu.factory';

/**
 * Translation note: Texts are translated when added (not lazily when rendered) to simplify filtering.
 */
export class ɵSciMenubarFactory implements SciMenubarFactory {

  public readonly menuItems = [] as SciMenu[];

  /** @inheritDoc */
  public addMenu(label: MaybeSignal<Translatable>, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(descriptor: SciMenubarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeSignal<Translatable> | SciMenubarMenuDescriptor, menuFactoryFn: (menu: SciMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    // Construct menu.
    const menuFactory = new ɵSciMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push({
      type: 'menu',
      name: descriptor.name,
      labelText: translate(descriptor.label),
      menu: {
        width: descriptor.menu?.width,
        minWidth: descriptor.menu?.minWidth,
        maxWidth: descriptor.menu?.maxWidth,
        maxHeight: descriptor.menu?.maxHeight,
        filter: coerceFilterDescriptor(descriptor),
      },
      children: menuFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
    } satisfies SciMenu);

    return this;
  }
}

function coerceMenuDescriptor(labelOrDescriptor: MaybeSignal<string> | SciMenubarMenuDescriptor): SciMenubarMenuDescriptor {
  if (typeof labelOrDescriptor === 'string' || isSignal(labelOrDescriptor)) {
    return {label: labelOrDescriptor};
  }
  return labelOrDescriptor;
}

function coerceFilterDescriptor(menuDescriptor: SciMenubarMenuDescriptor): {placeholder?: Signal<Translatable>; notFoundText?: Signal<Translatable>} | undefined {
  const filter = menuDescriptor.menu?.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: coerceSignal(filter.placeholder),
      notFoundText: coerceSignal(filter.notFoundText),
    };
  }
  return filter === true ? {} : undefined;
}
