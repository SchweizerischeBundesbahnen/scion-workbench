import {Disposable} from './common/disposable';
import {SciMenuContribution, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFnLike} from './menu-contribution.model';
import {SciMenuItemLike} from './menu.model';
import {SciMenuOptions, SciMenuRef} from './menu.service';
import {ɵSciMenuRegistry} from './ɵmenu.registry';
import {Injectable, Injector, Signal} from '@angular/core';
import {SciKeyboardAccelerator} from './menu-accelerators';

@Injectable({providedIn: 'root', useClass: ɵSciMenuRegistry})
export abstract class SciMenuRegistry {

  public abstract contributeMenu(locationLike: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions): Disposable;

  public abstract menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}` | `menubar:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuContribution[]>;

  public abstract menuItems(location: Signal<`menu:${string}` | `toolbar:${string}` | `menubar:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike[]>;

  public abstract openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef;

  /**
   * Gets accelerators of currently used menu items, optionally filtered by context.
   *
   * An accelerator matches if its menu item's context is the same as, a subset of, or has extra values compared to the given context. It never matches if a context value is different.
   *
   * IMPORTANT: Unlike {@link menuItems}, this method is based on currently used menu items, not available contributions.
   * If a contribution is not used in the application, its accelerators are not returned.
   */
  public abstract accelerators(context: Signal<Map<string, unknown>>): Signal<SciKeyboardAccelerator[]>;
}
