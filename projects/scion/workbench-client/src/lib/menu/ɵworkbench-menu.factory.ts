import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuDescriptor, WorkbenchMenuFactory, WorkbenchMenuGroupDescriptor, WorkbenchMenuGroupFactory, WorkbenchMenuItemDescriptor} from './workbench-menu.factory';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from './workbench-client-menu.model';
import {MaybeObservable} from '../common/utility-types';
import {isObservable} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchToolbarFactory} from './ɵworkbench-toolbar.factory';

export class ɵWorkbenchMenuFactory implements WorkbenchMenuFactory {

  public readonly menuItems = [] as WorkbenchMenuItemLike[];

  /** @inheritDoc */
  public addMenuItem(label: MaybeObservable<string>, onSelect: () => boolean | void | Promise<boolean | void>): this;
  public addMenuItem(descriptor: WorkbenchMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: MaybeObservable<string> | WorkbenchMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    // Construct actions toolbar.
    const actionsFactory = new ɵWorkbenchToolbarFactory();
    descriptor.actions?.(actionsFactory);

    // Add menu item.
    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: descriptor.label,
      icon: descriptor.icon,
      checked: descriptor.checked,
      tooltip: descriptor.tooltip,
      accelerator: descriptor.accelerator,
      disabled: descriptor.disabled ?? false,
      actions: actionsFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: async () => await descriptor.onSelect() ?? descriptor.checked === undefined, // Close if the callback returns true. Defaults to closing non-checkable menu items.
    }));

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(label: MaybeObservable<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this ;
  public addMenu(descriptor: WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeObservable<string> | WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    // Construct menu.
    const menuFactory = new ɵWorkbenchMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push(new WorkbenchMenu({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: descriptor.label,
      icon: descriptor.icon,
      tooltip: descriptor.tooltip,
      disabled: descriptor.disabled ?? false,
      cssClass: Arrays.coerce(descriptor.cssClass),
      children: menuFactory.menuItems,
      menu: {
        width: descriptor.menu?.width,
        minWidth: descriptor.menu?.minWidth,
        maxWidth: descriptor.menu?.maxWidth,
        maxHeight: descriptor.menu?.maxHeight,
        filter: descriptor.menu?.filter,
      },
    }));

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: WorkbenchMenuGroupFactory) => void): this;
  public addGroup(descriptor: WorkbenchMenuGroupDescriptor, groupFactoryFn?: (group: WorkbenchMenuGroupFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: WorkbenchMenuGroupFactory) => void) | WorkbenchMenuGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchMenuGroupFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    // Construct group.
    const groupFactory = new ɵWorkbenchMenuFactory();
    groupFactoryFn?.(groupFactory);

    // Add group.
    this.menuItems.push(new WorkbenchMenuGroup({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: descriptor.label,
      collapsible: coerceCollapsible(descriptor),
      disabled: descriptor.disabled ?? false,
      children: groupFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
    }));

    return this;
  }
}

function coerceCollapsible(groupDescriptor: WorkbenchMenuGroupDescriptor): {collapsed: boolean} | false {
  const collapsible = groupDescriptor.collapsible ?? false;
  if (!collapsible) {
    return false;
  }

  if (typeof groupDescriptor.collapsible === 'object') {
    return groupDescriptor.collapsible;
  }

  return {collapsed: false};
}

function coerceMenuItemDescriptor(labelOrDescriptor: MaybeObservable<string> | WorkbenchMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): WorkbenchMenuItemDescriptor {
  if (typeof labelOrDescriptor === 'string' || isObservable(labelOrDescriptor)) {
    return {label: labelOrDescriptor, onSelect: onSelect!};
  }
  return labelOrDescriptor;
}

function coerceMenuDescriptor(labelOrDescriptor: MaybeObservable<string> | WorkbenchMenuDescriptor): WorkbenchMenuDescriptor {
  if (typeof labelOrDescriptor === 'string' || isObservable(labelOrDescriptor)) {
    return {label: labelOrDescriptor};
  }
  return labelOrDescriptor;
}

function coerceGroupDescriptor(factoryOrDescriptor: ((group: WorkbenchMenuGroupFactory) => void) | WorkbenchMenuGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchMenuGroupFactory) => void): [WorkbenchMenuGroupDescriptor, ((group: WorkbenchMenuGroupFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}
