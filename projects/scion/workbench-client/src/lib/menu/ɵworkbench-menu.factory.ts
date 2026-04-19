import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuDescriptor, WorkbenchMenuFactory, WorkbenchMenuGroupDescriptor, WorkbenchMenuItemDescriptor} from './workbench-menu.factory';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from './workbench-client-menu.model';
import {MaybeObservable} from '../common/utility-types';
import {isObservable, Subject} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchToolbarFactory} from './ɵworkbench-toolbar.factory';
import {DestroyRef} from '../common/destroy-ref';
import {Translatable} from '../text/workbench-text-provider.model';
import {translate} from './workbench-menu-translate.util';

/**
 * Translation note: Texts are translated when added (not lazily using remote translatable) to avoid flickering when opening menus.
 */
export class ɵWorkbenchMenuFactory implements WorkbenchMenuFactory {

  private readonly _destroyRef = new DestroyRef();

  public readonly menuItems = [] as WorkbenchMenuItemLike[];
  public readonly invalidate$ = new Subject<void>();

  /** @inheritDoc */
  public addMenuItem(label: MaybeObservable<Translatable>, onSelect: () => boolean | void | Promise<boolean | void>): this;
  public addMenuItem(descriptor: WorkbenchMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: MaybeObservable<Translatable> | WorkbenchMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    // Construct actions toolbar.
    const actionsFactory = new ɵWorkbenchToolbarFactory();
    descriptor.actions?.(actionsFactory);

    // Add menu item.
    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      icon: descriptor.icon,
      checked: descriptor.checked,
      tooltip: translate(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: descriptor.disabled,
      actions: actionsFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      onSelect: async () => await descriptor.onSelect() ?? descriptor.checked === undefined, // Close if the callback returns true. Defaults to closing non-checkable menu items.
    }));

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(label: MaybeObservable<Translatable>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this ;
  public addMenu(descriptor: WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeObservable<Translatable> | WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);
    const filter = coerceFilterDescriptor(descriptor);

    // Construct menu.
    const menuFactory = new ɵWorkbenchMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push(new WorkbenchMenu({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      icon: descriptor.icon,
      disabled: descriptor.disabled,
      cssClass: Arrays.coerce(descriptor.cssClass),
      children: menuFactory.menuItems,
      menu: {
        width: descriptor.menu?.width,
        minWidth: descriptor.menu?.minWidth,
        maxWidth: descriptor.menu?.maxWidth,
        maxHeight: descriptor.menu?.maxHeight,
        filter: filter && {
          placeholder: translate(filter.placeholder),
          notFoundText: translate(filter.notFoundText),
        },
      },
    }));

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: WorkbenchMenuFactory) => void): this;
  public addGroup(descriptor: WorkbenchMenuGroupDescriptor, groupFactoryFn?: (group: WorkbenchMenuFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: WorkbenchMenuFactory) => void) | WorkbenchMenuGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchMenuFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    // Construct group.
    const groupFactory = new ɵWorkbenchMenuFactory();
    groupFactoryFn?.(groupFactory);

    // Construct actions toolbar.
    const actionsFactory = new ɵWorkbenchToolbarFactory();
    descriptor.actions?.(actionsFactory);

    // Add group.
    this.menuItems.push(new WorkbenchMenuGroup({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      collapsible: coerceCollapsibleDescriptor(descriptor),
      disabled: descriptor.disabled,
      actions: actionsFactory.menuItems,
      children: groupFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
    }));

    return this;
  }

  /** @inheritDoc */
  public invalidate(): void {
    this.invalidate$.next();
  }

  /** @inheritDoc */
  public onCleanup(onCleanup: () => void): void {
    this._destroyRef.onDestroy(onCleanup);
  }

  public destroy(): void {
    this._destroyRef.destroy();
  }
}

function coerceMenuItemDescriptor(labelOrDescriptor: MaybeObservable<string> | WorkbenchMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): WorkbenchMenuItemDescriptor {
  if (typeof labelOrDescriptor === 'string' || isObservable(labelOrDescriptor)) {
    return {label: labelOrDescriptor, onSelect: onSelect!};
  }
  return labelOrDescriptor;
}

function coerceMenuDescriptor(labelOrDescriptor: MaybeObservable<Translatable> | WorkbenchMenuDescriptor): WorkbenchMenuDescriptor {
  if (typeof labelOrDescriptor === 'string' || isObservable(labelOrDescriptor)) {
    return {label: labelOrDescriptor};
  }
  return labelOrDescriptor;
}

function coerceGroupDescriptor(factoryOrDescriptor: ((group: WorkbenchMenuFactory) => void) | WorkbenchMenuGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchMenuFactory) => void): [WorkbenchMenuGroupDescriptor, ((group: WorkbenchMenuFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}

function coerceFilterDescriptor(menuDescriptor: WorkbenchMenuDescriptor): {placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>} | undefined {
  const filter = menuDescriptor.menu?.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
    };
  }
  return filter === true ? {} : undefined;
}

function coerceCollapsibleDescriptor(groupDescriptor: WorkbenchMenuGroupDescriptor): {collapsed: boolean} | undefined {
  const collapsible = groupDescriptor.collapsible;

  if (typeof collapsible === 'object') {
    return collapsible;
  }

  return collapsible === true ? {collapsed: false} : undefined;
}
