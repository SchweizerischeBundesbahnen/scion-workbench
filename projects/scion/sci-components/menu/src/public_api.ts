/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/*
 * Secondary entrypoint: '@scion/components/menu'
 *
 * @see https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */
export {SciMenuService, type SciMenuRef, type SciMenuOptions, type SciMenuOrigin} from './menu.service';
export {ɵSciMenuService} from './ɵmenu.service';
export {type SciMenuFactory, type SciMenuItemDescriptor, type SciMenuDescriptor, type  SciMenuGroupDescriptor, type SciMenuGroupFactory} from './menu/menu.factory';
export {type SciToolbarFactory, type SciToolbarItemDescriptor, type SciToolbarMenuDescriptor, type  SciToolbarGroupDescriptor, type SciToolbarGroupFactory} from './toolbar/toolbar.factory';
export {SciMenuAdapter} from './menu-adapter';
export {contributeMenu} from './menu-contribution';
export {type SciMenuContribution, type SciMenuContributionLocation, type SciMenuContributionPosition, type SciMenuGroupContributionLocation, type SciToolbarContributionLocation, type SciToolbarGroupContributionLocation, type SciMenuContributionLocationLike, type SciMenuFactoryFn, type SciToolbarFactoryFn, type SciMenuGroupFactoryFn, type SciToolbarGroupFactoryFn, type SciMenuFactoryFnLike, type SciMenuContributionOptions} from './menu-contribution.model';
export {type Disposable} from './common/disposable';
export {SciToolbarComponent} from './toolbar/toolbar.component';
export {type SciMenuItem, type SciMenu, type SciMenuGroup, type SciMenuItemLike} from './menu.model';
export {SciMenuContextProvider} from './menu-context-provider';
export {provideSciMenuService} from './ɵmenu.service';
export {installMenuAccelerators, type SciMenuAcceleratorOptions} from './menu-accelerators';
