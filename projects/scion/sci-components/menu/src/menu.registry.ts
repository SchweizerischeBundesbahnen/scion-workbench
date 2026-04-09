import {Disposable} from './common/disposable';
import {SciMenuContribution, SciMenuContributionLocationLike, SciMenuContributionOptions, SciMenuFactoryFnLike} from './menu-contribution.model';
import {SciMenuItemLike} from './menu.model';
import {SciMenuOptions, SciMenuRef} from './menu.service';
import {ɵSciMenuRegistry} from './ɵmenu.registry';
import {Injectable, Injector, Signal} from '@angular/core';

@Injectable({providedIn: 'root', useClass: ɵSciMenuRegistry})
export abstract class SciMenuRegistry {

  public abstract contributeMenu(locationLike: SciMenuContributionLocationLike, factoryFn: SciMenuFactoryFnLike, options: SciMenuContributionOptions): Disposable;

  public abstract menuContributions(location: Signal<`menu:${string}` | `toolbar:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuContribution[]>;

  public abstract menuItems(location: Signal<`menu:${string}` | `toolbar:${string}`>, context: Signal<Map<string, unknown>>, options: {injector?: Injector; metadata?: {[key: string]: unknown}}): Signal<SciMenuItemLike[]>;

  public abstract openMenu(menu: `menu:${string}` | SciMenuItemLike[], options: SciMenuOptions): SciMenuRef;
}
