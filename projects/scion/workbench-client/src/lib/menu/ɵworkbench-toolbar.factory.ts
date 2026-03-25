import {MaybeObservable} from '../common/utility-types';
import {WorkbenchToolbarFactory, WorkbenchToolbarGroupDescriptor, WorkbenchToolbarGroupFactory, WorkbenchToolbarItemDescriptor, WorkbenchToolbarMenuDescriptor} from './workbench-toolbar.factory';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from './workbench-client-menu.model';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuFactory} from './workbench-menu.factory';
import {isObservable} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchMenuFactory} from './ɵworkbench-menu.factory';

export class ɵWorkbenchToolbarFactory implements WorkbenchToolbarFactory {

  public readonly menuItems = [] as WorkbenchMenuItemLike[];

  /** @inheritDoc */
  public addToolbarItem(icon: MaybeObservable<string>, onSelect: () => void): this;
  public addToolbarItem(descriptor: WorkbenchToolbarItemDescriptor): this;
  public addToolbarItem(iconOrDescriptor: MaybeObservable<string> | WorkbenchToolbarItemDescriptor, onSelect?: () => void): this {
    const descriptor = coerceToolbarItemDescriptor(iconOrDescriptor, onSelect);

    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: descriptor.label,
      icon: descriptor.icon,
      checked: descriptor.checked,
      tooltip: descriptor.tooltip,
      accelerator: descriptor.accelerator,
      disabled: descriptor.disabled ?? false,
      actions: [],
      cssClass: Arrays.coerce(descriptor.cssClass),
      onSelect: async () => {
        descriptor.onSelect();
        return false;
      },
    }));

    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: MaybeObservable<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;
  public addMenu(descriptor: WorkbenchToolbarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;
  public addMenu(iconOrDescriptor: MaybeObservable<string> | WorkbenchToolbarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);

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
      visualMenuHint: descriptor.visualMenuHint ?? true,
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
  public addGroup(groupFactoryFn: (group: WorkbenchToolbarGroupFactory) => void): this;
  public addGroup(descriptor: WorkbenchToolbarGroupDescriptor, groupFactoryFn?: (group: WorkbenchToolbarGroupFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: WorkbenchToolbarGroupFactory) => void) | WorkbenchToolbarGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchToolbarGroupFactory) => void): this {
    const [descriptor, groupFactoryFn] = coerceGroupDescriptor(factoryOrDescriptor, factoryIfDescriptor);

    // Construct group.
    const groupFactory = new ɵWorkbenchToolbarFactory();
    groupFactoryFn?.(groupFactory);

    // Add group.
    this.menuItems.push(new WorkbenchMenuGroup({
      id: UUID.randomUUID(),
      name: descriptor.name,
      disabled: descriptor.disabled ?? false,
      children: groupFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
    }));

    return this;
  }
}

function coerceToolbarItemDescriptor(iconOrDescriptor: MaybeObservable<string> | WorkbenchToolbarItemDescriptor, onSelect?: () => void): WorkbenchToolbarItemDescriptor {
  if (typeof iconOrDescriptor === 'string' || isObservable(iconOrDescriptor)) {
    return {icon: iconOrDescriptor, onSelect: onSelect!};
  }
  return iconOrDescriptor;
}

function coerceMenuDescriptor(iconOrDescriptor: MaybeObservable<string> | WorkbenchToolbarMenuDescriptor): WorkbenchToolbarMenuDescriptor {
  if (typeof iconOrDescriptor === 'string' || isObservable(iconOrDescriptor)) {
    return {icon: iconOrDescriptor};
  }
  return iconOrDescriptor;
}

function coerceGroupDescriptor(factoryOrDescriptor: ((group: WorkbenchToolbarGroupFactory) => void) | WorkbenchToolbarGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchToolbarGroupFactory) => void): [WorkbenchToolbarGroupDescriptor, ((group: WorkbenchToolbarGroupFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}
