import {WorkbenchMenuContributionLocation, WorkbenchMenuContributionOptions, WorkbenchMenuFactoryFn, WorkbenchMenuGroupContributionLocation, WorkbenchMenuGroupFactoryFn, WorkbenchMenuOptions, WorkbenchMenuRef, WorkbenchToolbarContributionLocation, WorkbenchToolbarFactoryFn, WorkbenchToolbarGroupContributionLocation, WorkbenchToolbarGroupFactoryFn} from './workbench-client-menu.model';
import {Disposable} from '../common/disposable';

export abstract class WorkbenchMenuService {

  public abstract contributeMenu(location: `menu:${string}` | WorkbenchMenuContributionLocation, menuFactoryFn: WorkbenchMenuFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `toolbar:${string}` | WorkbenchToolbarContributionLocation, toolbarFactoryFn: WorkbenchToolbarFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `group(menu):${string}` | WorkbenchMenuGroupContributionLocation, groupFactoryFn: WorkbenchMenuGroupFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `group(toolbar):${string}` | WorkbenchToolbarGroupContributionLocation, groupFactoryFn: WorkbenchToolbarGroupFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;

  public abstract open(name: `menu:${string}`, options: WorkbenchMenuOptions): WorkbenchMenuRef;
}
