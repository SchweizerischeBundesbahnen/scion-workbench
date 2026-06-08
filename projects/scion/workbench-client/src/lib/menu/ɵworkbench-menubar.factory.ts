import {WorkbenchMenuItem} from './workbench-client-menu.model';
import {Arrays, prune} from '@scion/toolkit/util';
import {WorkbenchMenuFactory} from './workbench-menu.factory';
import {Subject} from 'rxjs';
import {UUID} from '@scion/toolkit/uuid';
import {DestroyRef} from '../common/destroy-ref';
import {translate} from './workbench-menu-translate.util';
import {WorkbenchMenubarFactory, WorkbenchMenubarMenuDescriptor} from './workbench-menubar.factory';
import {constructWorkbenchMenu} from './ɵworkbench-menu.factory';

/**
 * Translation note: Texts are translated when added (not lazily using remote translatable) to avoid flickering when opening menus.
 */
export class ɵWorkbenchMenubarFactory implements WorkbenchMenubarFactory {

  private readonly _destroyRef = new DestroyRef();

  public readonly menuItems = [] as WorkbenchMenuItem[];
  public readonly invalidate$ = new Subject<void>();

  /** @inheritDoc */
  public addMenu(descriptor: WorkbenchMenubarMenuDescriptor, menuFactoryFn: (menu: WorkbenchMenuFactory) => void): this {
    this.menuItems.push(new WorkbenchMenuItem(prune({
      id: UUID.randomUUID(),
      name: descriptor.name,
      label: translate(descriptor.label),
      visible: descriptor.visible,
      cssClass: Arrays.coerce(descriptor.cssClass),
      attributes: descriptor.attributes,
      menu: constructWorkbenchMenu(menuFactoryFn, descriptor.menu),
    })));

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
