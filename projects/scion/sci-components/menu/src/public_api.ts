/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
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
export {SciMenuAdapter, type SciMenuAdapterChain} from './menu-adapter.model';
export {contributeMenu} from './menu-contribution';
export {type SciMenuContribution, type SciMenuContributionLocation, type SciToolbarContributionLocation, type SciMenubarContributionLocation, type SciMenuContributionLocationLike, type SciMenuContributionPosition, type SciToolbarContributionPosition, type SciMenubarContributionPosition, type SciMenuContributionPositionLike, type SciMenuFactoryFn, type SciToolbarFactoryFn, type SciMenubarFactoryFn, type SciMenuFactoryFnLike, type SciMenuContributionOptions} from './menu-contribution.model';
export {type Disposable} from './common/disposable';
export {type SciMenuItem, type SciMenu, type SciMenuGroup, type SciMenuItemLike} from './menu.model';
export {SciMenuContextProvider} from './menu-context-provider';
export {SciMenuAcceleratorTargetProvider} from './menu-accelerator-target-provider';
export {provideMenuService} from './ɵmenu.service';
export {installMenuAccelerators, type SciMenuAcceleratorOptions} from './menu-accelerators';

export * from './toolbar/public_api';
export * from './menubar/public_api';
export * from './menu/public_api';
