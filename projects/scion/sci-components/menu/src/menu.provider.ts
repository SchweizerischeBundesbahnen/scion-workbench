import {SciMenu} from './menu.model';
import {ɵSciMenu} from './ɵmenu';
import {inject} from '@angular/core';
import {SciMenuRegistry} from './menu.registry';

// export function provideWorkbenchMenu(name: string, menuFactoryFn: (menu: SciMenu) => SciMenu, options?: ProvideMenuOptions): Disposable {
// }



export function provideMenu(name: string, menuFactoryFn: (menu: SciMenu) => SciMenu, options?: ProvideMenuOptions): Disposable {
  const menuRegistry = inject(SciMenuRegistry);

  const menu = menuFactoryFn(new ɵSciMenu()) as ɵSciMenu;
  menuRegistry.registerMenu(name, menu);

  return {
    dispose: () => menuRegistry.unregisterMenu(name, menu),
  };
}

export interface ProvideMenuOptions {
  canMatch?: () => boolean;
}

/**
 * Represents an object that can be disposed of to free up resources.
 */
export interface Disposable {
  /**
   * Disposes of the object, releasing any allocated resources.
   */
  dispose(): void;
}
