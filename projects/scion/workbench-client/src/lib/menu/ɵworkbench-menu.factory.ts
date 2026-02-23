import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuDescriptor, WorkbenchMenuFactory, WorkbenchMenuGroupDescriptor, WorkbenchMenuItemDescriptor} from './workbench-menu.factory';
import {WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from './workbench-client-menu.model';
import {Observable, Subject} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchToolbarFactory} from './ɵworkbench-toolbar.factory';
import {DestroyRef} from '../common/destroy-ref';
import {translate} from './workbench-menu-translate.util';

/**
 * Translation note: Texts are translated when added (not lazily using remote translatable) to avoid flickering when opening menus.
 */
export class ɵWorkbenchMenuFactory implements WorkbenchMenuFactory {

  private readonly _destroyRef = new DestroyRef();

  public readonly menuItems = [] as WorkbenchMenuItemLike[];
  public readonly invalidate$ = new Subject<void>();

  /** @inheritDoc */
  public addMenuItem(descriptor: WorkbenchMenuItemDescriptor): this {
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
      active: descriptor.active,
      tooltip: translate(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: descriptor.disabled,
      actions: actionsFactory.menuItems,
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      onSelect: async () => await descriptor.onSelect() as boolean | undefined ?? descriptor.checked === undefined, // Returning `true` will close the popover. Non-checkable items close by default.
    }));

    return this;
  }

  /** @inheritDoc */
  public addMenu(descriptor: WorkbenchMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      icon: descriptor.icon,
      disabled: descriptor.disabled,
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      menu: constructWorkbenchMenu(menuFactoryFn, descriptor.menu),
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
      glyphArea: descriptor.glyphArea,
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

function coerceGroupDescriptor(factoryOrDescriptor: ((group: WorkbenchMenuFactory) => void) | WorkbenchMenuGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchMenuFactory) => void): [WorkbenchMenuGroupDescriptor, ((group: WorkbenchMenuFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}

function coerceCollapsibleDescriptor(groupDescriptor: WorkbenchMenuGroupDescriptor): {collapsed: boolean} | undefined {
  const collapsible = groupDescriptor.collapsible;

  if (typeof collapsible === 'object') {
    return collapsible;
  }

  return collapsible === true ? {collapsed: false} : undefined;
}

export function constructWorkbenchMenu(menuFactoryFn?: (menu: WorkbenchMenuFactory) => void, menuDescriptor?: WorkbenchMenuDescriptor['menu']): WorkbenchMenuItem['_menuItem']['menu'] {
  if (!menuFactoryFn) {
    return undefined;
  }

  const menuFactory = new ɵWorkbenchMenuFactory();
  menuFactoryFn(menuFactory);

  return ({
    name: menuDescriptor?.name,
    width: menuDescriptor?.width,
    minWidth: menuDescriptor?.minWidth,
    maxWidth: menuDescriptor?.maxWidth,
    maxHeight: menuDescriptor?.maxHeight,
    filter: coerceFilterDescriptor(menuDescriptor),
    children: menuFactory.menuItems,
  });

  function coerceFilterDescriptor(menuDescriptor?: WorkbenchMenuDescriptor['menu']): {placeholder?: Observable<string>; notFoundText?: Observable<string>; focus?: boolean} | undefined {
    const filter = menuDescriptor?.filter;

    if (typeof filter === 'object') {
      return {
        placeholder: translate(filter.placeholder),
        notFoundText: translate(filter.notFoundText),
        focus: filter.focus,
      };
    }
    return filter === true ? {} : undefined;
  }
}
