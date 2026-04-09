import {MaybeObservable} from '../common/utility-types';
import {WorkbenchToolbarFactory, WorkbenchToolbarGroupDescriptor, WorkbenchToolbarGroupFactory, WorkbenchToolbarItemDescriptor, WorkbenchToolbarMenuDescriptor} from './workbench-toolbar.factory';
import {WorkbenchMenu, WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from './workbench-client-menu.model';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuFactory} from './workbench-menu.factory';
import {isObservable, Subject} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchMenuFactory} from './ɵworkbench-menu.factory';
import {DestroyRef} from '../common/destroy-ref';
import {Translatable} from '../text/workbench-text-provider.model';
import {translate} from './workbench-menu-translate.util';

/**
 * Translation note: Texts are translated when added (not lazily using remote translatable) to avoid flickering when opening menus.
 */
export class ɵWorkbenchToolbarFactory implements WorkbenchToolbarFactory {

  private readonly _destroyRef = new DestroyRef();

  public readonly menuItems = [] as WorkbenchMenuItemLike[];
  public readonly invalidate$ = new Subject<void>();

  /** @inheritDoc */
  public addToolbarItem(icon: MaybeObservable<string>, onSelect: () => void): this;
  public addToolbarItem(descriptor: WorkbenchToolbarItemDescriptor): this;
  public addToolbarItem(iconOrDescriptor: MaybeObservable<string> | WorkbenchToolbarItemDescriptor, onSelect?: () => void): this {
    const descriptor = coerceToolbarItemDescriptor(iconOrDescriptor, onSelect);

    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      icon: descriptor.icon,
      checked: descriptor.checked,
      tooltip: translate(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: descriptor.disabled,
      actions: [],
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      onSelect: async () => await descriptor.onSelect() ?? descriptor.checked === undefined, // Close if the callback returns true. Defaults to closing non-checkable menu items.
    }));

    return this;
  }

  /** @inheritDoc */
  public addMenu(icon: MaybeObservable<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;
  public addMenu(descriptor: WorkbenchToolbarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;
  public addMenu(iconOrDescriptor: MaybeObservable<string> | WorkbenchToolbarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    const descriptor = coerceMenuDescriptor(iconOrDescriptor);
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
      tooltip: translate(descriptor.tooltip),
      disabled: descriptor.disabled,
      visualMenuHint: descriptor.visualMenuHint ?? true,
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
      disabled: descriptor.disabled,
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

function coerceFilterDescriptor(menuDescriptor: WorkbenchToolbarMenuDescriptor): {placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>} | undefined {
  const filter = menuDescriptor.menu?.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
    };
  }
  return filter === true ? {} : undefined;
}
