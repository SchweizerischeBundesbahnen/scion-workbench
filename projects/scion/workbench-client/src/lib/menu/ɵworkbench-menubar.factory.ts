import {MaybeObservable} from '@scion/toolkit/types';
import {WorkbenchMenu} from './workbench-client-menu.model';
import {Arrays} from '@scion/toolkit/util';
import {WorkbenchMenuFactory} from './workbench-menu.factory';
import {isObservable, Subject} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {ɵWorkbenchMenuFactory} from './ɵworkbench-menu.factory';
import {DestroyRef} from '../common/destroy-ref';
import {Translatable} from '../text/workbench-text-provider.model';
import {translate} from './workbench-menu-translate.util';
import {WorkbenchMenubarFactory, WorkbenchMenubarMenuDescriptor} from './workbench-menubar.factory';

/**
 * Translation note: Texts are translated when added (not lazily using remote translatable) to avoid flickering when opening menus.
 */
export class ɵWorkbenchMenubarFactory implements WorkbenchMenubarFactory {

  private readonly _destroyRef = new DestroyRef();

  public readonly menuItems = [] as WorkbenchMenu[];
  public readonly invalidate$ = new Subject<void>();

  /** @inheritDoc */
  public addMenu(label: MaybeObservable<string>, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;
  public addMenu(descriptor: WorkbenchMenubarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this;
  public addMenu(labelOrDescriptor: MaybeObservable<string> | WorkbenchMenubarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
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
      width: descriptor.width,
      minWidth: descriptor.minWidth,
      maxWidth: descriptor.maxWidth,
      maxHeight: descriptor.maxHeight,
      filter: filter && {
        placeholder: translate(filter.placeholder),
        notFoundText: translate(filter.notFoundText),
        focus: filter.focus,
      },
      cssClass: Arrays.coerce(descriptor.cssClass),
      children: menuFactory.menuItems,
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

function coerceMenuDescriptor(labelOrDescriptor: MaybeObservable<string> | WorkbenchMenubarMenuDescriptor): WorkbenchMenubarMenuDescriptor {
  if (typeof labelOrDescriptor === 'string' || isObservable(labelOrDescriptor)) {
    return {label: labelOrDescriptor};
  }
  return labelOrDescriptor;
}

function coerceFilterDescriptor(menuDescriptor: WorkbenchMenubarMenuDescriptor): {placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>; focus?: boolean} | undefined {
  const filter = menuDescriptor.filter;

  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
      focus: filter.focus,
    };
  }
  return filter === true ? {} : undefined;
}
