import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuDescriptor, WorkbenchMenuFactory, WorkbenchMenuGroupDescriptor, WorkbenchMenuGroupFactory, WorkbenchMenuItemDescriptor} from './workbench-menu.factory';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from './workbench-client-menu.model';
import {MaybeAsync} from '../common/utility-types';
import {isObservable} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchToolbarFactory} from './ɵworkbench-toolbar.factory';
import {coerceObservable} from '@angular/cdk/coercion/private';

export class ɵWorkbenchMenuFactory implements WorkbenchMenuFactory {

  public readonly menuItems = [] as WorkbenchMenuItemLike[];

  /** @inheritDoc */
  public addMenuItem(label: MaybeAsync<string>, onSelect: () => boolean | void | Promise<boolean | void>): this;
  public addMenuItem(descriptor: WorkbenchMenuItemDescriptor): this;
  public addMenuItem(labelOrDescriptor: MaybeAsync<string> | WorkbenchMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): this {
    const descriptor = coerceMenuItemDescriptor(labelOrDescriptor, onSelect);

    // Construct actions toolbar.
    const actionsFactory = new ɵWorkbenchToolbarFactory();
    descriptor.actions?.(actionsFactory);

    // Add menu item.
    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: coerceObservable(descriptor.label),
      icon: descriptor.icon && coerceObservable(descriptor.icon),
      checked: descriptor.checked && coerceObservable(descriptor.checked),
      tooltip: descriptor.tooltip && coerceObservable(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: coerceObservable(descriptor.disabled ?? false),
      actions: actionsFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: descriptor.onSelect,
    }));

    // TODO [menu] throw error if icon and checked
    return this;
  }

  /** @inheritDoc */
  public addMenu(label: MaybeAsync<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this ;
  public addMenu(descriptor: WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this ;
  public addMenu(labelOrDescriptor: MaybeAsync<string> | WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(labelOrDescriptor);

    // Construct menu.
    const menuFactory = new ɵWorkbenchMenuFactory();
    menuFactoryFn(menuFactory);

    // Add menu.
    this.menuItems.push(new WorkbenchMenu({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: coerceObservable(descriptor.label),
      icon: descriptor.icon && coerceObservable(descriptor.icon),
      tooltip: descriptor.tooltip && coerceObservable(descriptor.tooltip),
      disabled: coerceObservable(descriptor.disabled ?? false),
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
      label: descriptor.label && coerceObservable(descriptor.label),
      collapsible: coerceCollapsible(descriptor),
      disabled: coerceObservable(descriptor.disabled ?? false),
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

function coerceMenuItemDescriptor(labelOrDescriptor: MaybeAsync<string> | WorkbenchMenuItemDescriptor, onSelect?: () => boolean | void | Promise<boolean | void>): WorkbenchMenuItemDescriptor {
  if (typeof labelOrDescriptor === 'string' || isObservable(labelOrDescriptor)) {
    return {label: labelOrDescriptor, onSelect: onSelect!};
  }
  return labelOrDescriptor;
}

function coerceMenuDescriptor(labelOrDescriptor: MaybeAsync<string> | WorkbenchMenuDescriptor): WorkbenchMenuDescriptor {
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
