import {WorkbenchMenuFactory, WorkbenchMenuGroupFactory} from './workbench-menu.factory';
import {WorkbenchMenuContributionLocation, WorkbenchMenuContributionOptions, WorkbenchMenuGroupContributionLocation, WorkbenchMenuOptions, WorkbenchMenuRef, WorkbenchToolbarContributionLocation, WorkbenchToolbarGroupContributionLocation} from './workbench-client-menu.model';
import {WorkbenchToolbarFactory, WorkbenchToolbarGroupFactory} from './workbench-toolbar.factory';
import {Disposable} from '../common/disposable';

export abstract class WorkbenchMenuService {

  public abstract contributeMenu(location: `menu:${string}` | WorkbenchMenuContributionLocation, menuFactoryFn: (menu: WorkbenchMenuFactory, context: Map<string, unknown>) => void, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `toolbar:${string}` | WorkbenchToolbarContributionLocation, menuFactoryFn: (toolbar: WorkbenchToolbarFactory, context: Map<string, unknown>) => void, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `group(menu):${string}` | WorkbenchMenuGroupContributionLocation, groupFactoryFn: (group: WorkbenchMenuGroupFactory, context: Map<string, unknown>) => void, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `group(toolbar):${string}` | WorkbenchToolbarGroupContributionLocation, groupFactoryFn: (group: WorkbenchToolbarGroupFactory, context: Map<string, unknown>) => void, options?: WorkbenchMenuContributionOptions): Disposable;

  public abstract open(name: `menu:${string}`, options: WorkbenchMenuOptions): WorkbenchMenuRef;
}
