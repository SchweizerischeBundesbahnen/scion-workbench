import {WorkbenchMenubarContributionLocation, WorkbenchMenubarFactoryFn, WorkbenchMenuContributionLocation, WorkbenchMenuContributionOptions, WorkbenchMenuFactoryFn, WorkbenchMenuOptions, WorkbenchMenuRef, WorkbenchToolbarContributionLocation, WorkbenchToolbarFactoryFn} from './workbench-client-menu.model';
import {Disposable} from '../common/disposable';
import {WorkbenchMenuAcceleratorOptions} from './workbench-menu-accelerators';

export abstract class WorkbenchMenuService {

  public abstract contributeMenu(location: `menu:${string}` | WorkbenchMenuContributionLocation, menuFactoryFn: WorkbenchMenuFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `toolbar:${string}` | WorkbenchToolbarContributionLocation, toolbarFactoryFn: WorkbenchToolbarFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public abstract contributeMenu(location: `menubar:${string}` | WorkbenchMenubarContributionLocation, menubarFactoryFn: WorkbenchMenubarFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;

  public abstract open(name: `menu:${string}`, options: WorkbenchMenuOptions): WorkbenchMenuRef;

  public abstract installMenuAccelerators(location: `menu:${string}`, options?: WorkbenchMenuAcceleratorOptions): Disposable;
}
