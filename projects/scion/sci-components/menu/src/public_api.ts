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
export {type SciMenu, type SciMenuItemDescriptor, type SciMenuDescriptor, type  SciMenuGroupDescriptor, type SciMenuGroup} from './menu/menu.model';
export {type SciToolbar, type SciToolbarItemDescriptor, type SciToolbarMenuDescriptor, type  SciToolbarGroupDescriptor, type SciToolbarGroup} from './toolbar/toolbar.model';
export {SciMenuAdapter} from './menu-adapter';
export {contributeMenu} from './menu-contribution';
export {type Disposable} from './common/disposable';
export {SciToolbarComponent} from './toolbar/toolbar.component';
export {type SciMenuItemContribution, type SciMenuContribution, type SciMenuGroupContribution, type SciMenuContributions} from './menu-contribution.model';
export {SciMenuContextProvider} from './menu-context-provider';
export {provideSciMenuService} from './ɵmenu.service';
