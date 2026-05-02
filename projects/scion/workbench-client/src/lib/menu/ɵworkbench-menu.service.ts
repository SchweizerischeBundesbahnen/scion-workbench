/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {WorkbenchMenuService} from './workbench-menu.service';
import {WorkbenchMenu, WorkbenchMenubarContributionLocation, WorkbenchMenubarFactoryFn, WorkbenchMenuContributionLocation, WorkbenchMenuContributionLocationLike, WorkbenchMenuContributionOptions, WorkbenchMenuContributionPosition, WorkbenchMenuFactoryFn, WorkbenchMenuFactoryFnLike, WorkbenchMenuItemLike, WorkbenchMenuItemProxyLike, WorkbenchMenuItems, WorkbenchMenuItemTransferableLike, WorkbenchMenuOptions, WorkbenchMenuOrigin, WorkbenchMenuRef, WorkbenchMenuTransferable, WorkbenchToolbarContributionLocation, WorkbenchToolbarFactoryFn} from './workbench-client-menu.model';
import {Disposable, MaybeObservable} from '@scion/toolkit/types';
import {UUID} from '@scion/toolkit/uuid';
import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {ɵWorkbenchMenuFactory} from './ɵworkbench-menu.factory';
import {ɵWorkbenchToolbarFactory} from './ɵworkbench-toolbar.factory';
import {prune} from '@scion/toolkit/util';
import {ɵWorkbenchMenuContributionConstructCommand, ɵWorkbenchMenuContributionRegisterCommand, ɵWorkbenchMenuItemLookupCommand, ɵWorkbenchMenuOpenCommand} from './workbench-client-menu-commands';
import {expand, Observable, of, take} from 'rxjs';
import {finalize, map, switchMap, tap} from 'rxjs/operators';
import {parseMenuLocation} from './workbench-menu-location-parser';
import {translate} from './workbench-menu-translate.util';
import {ɵWorkbenchMenubarFactory} from './ɵworkbench-menubar.factory';
import {WORKBENCH_ELEMENT, WorkbenchElement} from '../workbench.model';
import {installMenuAccelerators, WorkbenchMenuAcceleratorOptions} from './workbench-menu-accelerators';
import {provideMenuEnvironmentContext} from './workbench-menu-environment-provider';

export class ɵWorkbenchMenuService implements WorkbenchMenuService {

  private readonly _messageClient = Beans.get(MessageClient);

  /** @inheritDoc */
  public contributeMenu(location: `menu:${string}` | WorkbenchMenuContributionLocation, menuFactoryFn: WorkbenchMenuFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `toolbar:${string}` | WorkbenchToolbarContributionLocation, toolbarFactoryFn: WorkbenchToolbarFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `menubar:${string}` | WorkbenchMenubarContributionLocation, menubarFactoryFn: WorkbenchMenubarFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(locationLike: string | WorkbenchMenuContributionLocationLike, factoryFn: WorkbenchMenuFactoryFnLike, options?: WorkbenchMenuContributionOptions): Disposable {
    const {location, before, after, position} = typeof locationLike === 'string' ? {location: locationLike} as WorkbenchMenuContributionLocationLike : locationLike;

    const contributionId = UUID.randomUUID();
    const {scope} = parseMenuLocation(location);

    // Register contribution.
    void this._messageClient.publish<ɵWorkbenchMenuContributionRegisterCommand>(`workbench/menu/contribution/${contributionId}/register`, {
      location: location,
      requiredContext: new Map<string, unknown>([...provideMenuEnvironmentContext(), ...options?.requiredContext ?? new Map()]),
      position: prune({before, after, position} as WorkbenchMenuContributionPosition, {pruneIfEmpty: true}),
      metadata: options?.metadata,
      contributionInstant: options?.contributionInstant,
    });

    // Subscribe for menu construction requests.
    const subscription = this._messageClient.onMessage<ɵWorkbenchMenuContributionConstructCommand, WorkbenchMenuItemTransferableLike[]>(`workbench/menu/contribution/${contributionId}/construct`, request => {
      const {context} = request.body!;

      console.warn('>>> [ClientMenuService] instantiate menu factory', location, context);

      // Create the menu, re-creating it again when being invalidated.
      return of(createMenu())
        .pipe(
          expand(menu => menu.invalidate$.pipe(map(() => createMenu()), take(1), finalize(() => menu.destroy()))),
          switchMap(menu => WorkbenchMenuItems.toTransferable$(menu.menuItems)),
        );

      function createMenu(): ɵWorkbenchMenuFactory | ɵWorkbenchToolbarFactory | ɵWorkbenchMenubarFactory {
        switch (scope) {
          case 'menu': {
            const menuFactory = new ɵWorkbenchMenuFactory();
            const menuFactoryFn = factoryFn as WorkbenchMenuFactoryFn;
            menuFactoryFn(menuFactory, context);
            return menuFactory;
          }
          case 'toolbar': {
            const toolbarFactory = new ɵWorkbenchToolbarFactory();
            const toolbarFactoryFn = factoryFn as WorkbenchToolbarFactoryFn;
            toolbarFactoryFn(toolbarFactory, context);
            return toolbarFactory;
          }
          case 'menubar': {
            const menubarFactory = new ɵWorkbenchMenubarFactory();
            const menubarFactoryFn = factoryFn as WorkbenchMenubarFactoryFn;
            menubarFactoryFn(menubarFactory, context);
            return menubarFactory;
          }
        }
      }
    });

    const contributionRef = {
      dispose: () => {
        subscription.unsubscribe();
        void this._messageClient.publish(`workbench/menu/contribution/${contributionId}/unregister`);
      },
    };

    // Unregister menu contributions when stopping the platform, e.g., when closing the view, part, ..., or during hot code replacement.
    void MicrofrontendPlatform.whenState(PlatformState.Stopping).then(() => contributionRef.dispose());

    return contributionRef;
  }

  /** @inheritDoc */
  public open(menuLike: `menu:${string}` | WorkbenchMenuItemLike[], options: WorkbenchMenuOptions): WorkbenchMenuRef {
    // Prevent default if opening context menu.
    if (options.anchor instanceof MouseEvent && options.anchor.type === 'contextmenu') {
      options.anchor.preventDefault();
      options.anchor.stopPropagation();
    }

    const filter = coerceFilterDescriptor(options.filter);
    const menu = new WorkbenchMenu({
      id: UUID.randomUUID(),
      name: Array.isArray(menuLike) ? undefined : menuLike,
      minWidth: options.size?.minWidth,
      maxWidth: options.size?.maxWidth,
      maxHeight: options.size?.maxHeight,
      filter: filter && {
        placeholder: translate(filter.placeholder),
        notFoundText: translate(filter.notFoundText),
        focus: filter.focus,
      },
      cssClass: options.cssClass,
      children: Array.isArray(menuLike) ? menuLike : [],
    });

    const subscription = menu.toTransferable$()
      .pipe(
        map((menu: WorkbenchMenuTransferable): ɵWorkbenchMenuOpenCommand => ({
          menu: menu,
          anchor: coerceAnchor(options.anchor),
          align: options.align,
          workbenchElementId: Beans.get<WorkbenchElement>(WORKBENCH_ELEMENT).id,
          context: new Map<string, unknown>([...provideMenuEnvironmentContext(), ...options.context ?? new Map()]),
          metadata: options.metadata,
        })),
        switchMap(command => Beans.get(MessageClient).request$<void>('workbench/menu/open', command).pipe(tap({complete: (): void => subscription.unsubscribe()}))), // cancel subscription when closing the menu.
      )
      .subscribe();

    return {
      close: () => subscription.unsubscribe(),
      onClose: onClose => subscription.add(onClose),
    };
  }

  /** @inheritDoc */
  public installMenuAccelerators(location: `menu:${string}`, options?: WorkbenchMenuAcceleratorOptions): Disposable {
    return installMenuAccelerators(location, options);
  }

  /**
   * metadata: Arbitrary metadata to be associated with the operation.
   */
  public menuItems$(location: `menu:${string}` | `toolbar:${string}` | `menubar:${string}`, context: Map<string, unknown>, options?: {metadata?: {[key: string]: unknown}}): Observable<WorkbenchMenuItemProxyLike[]> {
    const command: ɵWorkbenchMenuItemLookupCommand = {
      location,
      context: new Map([...provideMenuEnvironmentContext(), ...context]),
      metadata: options?.metadata,
    };
    return this._messageClient.request$<WorkbenchMenuItemTransferableLike[]>('workbench/menu/items', command)
      .pipe(map(message => WorkbenchMenuItems.fromTransferable(message.body!)));
  }
}

function coerceAnchor(anchor: HTMLElement | WorkbenchMenuOrigin | MouseEvent): ɵWorkbenchMenuOpenCommand['anchor'] {
  if (anchor instanceof HTMLElement) {
    const {x, y, width, height} = anchor.getBoundingClientRect();
    return {x, y, width, height};
  }
  else if (anchor instanceof MouseEvent) {
    return {x: anchor.x, y: anchor.y};
  }
  else {
    return {x: anchor.x, y: anchor.y, width: anchor.width, height: anchor.height};
  }
}

function coerceFilterDescriptor(filter: WorkbenchMenuOptions['filter'] | undefined): {placeholder?: MaybeObservable<string>; notFoundText?: MaybeObservable<string>; focus?: boolean} | undefined {
  if (typeof filter === 'object') {
    return {
      placeholder: filter.placeholder,
      notFoundText: filter.notFoundText,
      focus: filter.focus,
    };
  }
  return filter === true ? {} : undefined;
}
