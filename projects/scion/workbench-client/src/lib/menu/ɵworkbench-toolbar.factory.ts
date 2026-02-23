import {WorkbenchToolbarButtonDescriptor, WorkbenchToolbarFactory, WorkbenchToolbarGroupDescriptor, WorkbenchToolbarMenuDescriptor} from './workbench-toolbar.factory';
import {WorkbenchMenuGroup, WorkbenchMenuItem, WorkbenchMenuItemLike} from './workbench-client-menu.model';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuDescriptor, WorkbenchMenuFactory} from './workbench-menu.factory';
import {Subject} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {constructWorkbenchMenu} from './ɵworkbench-menu.factory';
import {DestroyRef} from '../common/destroy-ref';
import {translate} from './workbench-menu-translate.util';

/**
 * Translation note: Texts are translated when added (not lazily using remote translatable) to avoid flickering when opening menus.
 */
export class ɵWorkbenchToolbarFactory implements WorkbenchToolbarFactory {

  private readonly _destroyRef = new DestroyRef();

  public readonly menuItems = [] as WorkbenchMenuItemLike[];
  public readonly invalidate$ = new Subject<void>();

  /** @inheritDoc */
  public addToolbarButton(descriptor: WorkbenchToolbarButtonDescriptor): this {
    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      icon: descriptor.icon,
      checked: descriptor.checked,
      tooltip: translate(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: descriptor.disabled,
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      onSelect: async () => await descriptor.onSelect() as boolean | undefined ?? descriptor.checked === undefined, // Returning `true` will close the popover. Non-checkable items close by default.
    }));

    return this;
  }

  /** @inheritDoc */
  public addToolbarSplitButton(descriptor: WorkbenchToolbarButtonDescriptor & {menu?: WorkbenchMenuDescriptor['menu']}, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      icon: descriptor.icon,
      checked: descriptor.checked,
      tooltip: translate(descriptor.tooltip),
      accelerator: descriptor.accelerator,
      disabled: descriptor.disabled,
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      menu: constructWorkbenchMenu(menuFactoryFn, descriptor.menu),
      onSelect: async () => await descriptor.onSelect() as boolean | undefined ?? descriptor.checked === undefined, // Returning `true` will close the popover. Non-checkable items close by default.
    }));

    return this;
  }

  /** @inheritDoc */
  public addToolbarMenu(descriptor: WorkbenchToolbarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    this.menuItems.push(new WorkbenchMenuItem({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      icon: descriptor.icon,
      tooltip: translate(descriptor.tooltip),
      disabled: descriptor.disabled,
      visualMenuHint: descriptor.visualMenuHint ?? true,
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      menu: constructWorkbenchMenu(menuFactoryFn, descriptor.menu),
    }));

    return this;
  }

  /** @inheritDoc */
  public addGroup(groupFactoryFn: (group: WorkbenchToolbarFactory) => void): this;
  public addGroup(descriptor: WorkbenchToolbarGroupDescriptor, groupFactoryFn?: (group: WorkbenchToolbarFactory) => void): this;
  public addGroup(factoryOrDescriptor: ((group: WorkbenchToolbarFactory) => void) | WorkbenchToolbarGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchToolbarFactory) => void): this {
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

function coerceGroupDescriptor(factoryOrDescriptor: ((group: WorkbenchToolbarFactory) => void) | WorkbenchToolbarGroupDescriptor, factoryIfDescriptor?: (group: WorkbenchToolbarFactory) => void): [WorkbenchToolbarGroupDescriptor, ((group: WorkbenchToolbarFactory) => void) | undefined] {
  if (typeof factoryOrDescriptor === 'function') {
    return [{}, factoryOrDescriptor];
  }
  return [factoryOrDescriptor, factoryIfDescriptor];
}
