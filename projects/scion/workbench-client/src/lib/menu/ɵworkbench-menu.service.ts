import {WorkbenchMenuService} from './workbench-menu.service';
import {WorkbenchMenuFactory, WorkbenchMenuGroupFactory} from './workbench-menu.factory';
import {WorkbenchToolbarFactory, WorkbenchToolbarGroupFactory} from './workbench-toolbar.factory';
import {WorkbenchMenuContributionLocation, WorkbenchMenuContributionLocationLike, WorkbenchMenuContributionOptions, WorkbenchMenuContributionPosition, WorkbenchMenuGroupContributionLocation, WorkbenchMenuItemLike, WorkbenchMenuItemProxyLike, WorkbenchMenuItems, WorkbenchMenuItemTransferableLike, WorkbenchMenuOptions, WorkbenchMenuOrigin, WorkbenchMenuRef, WorkbenchToolbarContributionLocation, WorkbenchToolbarGroupContributionLocation} from './workbench-client-menu.model';
import {Disposable} from '../common/disposable';
import {UUID} from '@scion/toolkit/uuid';
import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {ɵWorkbenchMenuFactory} from './ɵworkbench-menu.factory';
import {ɵWorkbenchToolbarFactory} from './ɵworkbench-toolbar.factory';
import {prune} from '../common/prune.util';
import {ɵWorkbenchClientMenuContributionCreateCommand, ɵWorkbenchClientMenuContributionRegisterCommand, ɵWorkbenchClientMenuItemLookupCommand, ɵWorkbenchClientMenuOpenCommand} from './workbench-client-menu-commands';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {WorkbenchDialog} from '../dialog/workbench-dialog.model';
import {WorkbenchNotification} from '../notification/workbench-notification.model';
import {EMPTY, expand, Observable, of, take} from 'rxjs';
import {WORKBENCH_ELEMENT, WorkbenchElement} from '@scion/workbench-client';
import {SciMenuOptions} from '@scion/sci-components/menu';
import {coerceElement} from '@angular/cdk/coercion';
import {map, switchMap, tap} from 'rxjs/operators';

export class ɵWorkbenchMenuService implements WorkbenchMenuService {

  private readonly _messageClient = Beans.get(MessageClient);

  /** @inheritDoc */
  public contributeMenu(location: `menu:${string}` | WorkbenchMenuContributionLocation, menuFactoryFn: (menu: WorkbenchMenuFactory, context: Map<string, unknown>) => void | Observable<unknown>, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `toolbar:${string}` | WorkbenchToolbarContributionLocation, menuFactoryFn: (toolbar: WorkbenchToolbarFactory, context: Map<string, unknown>) => void | Observable<unknown>, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `group(menu):${string}` | WorkbenchMenuGroupContributionLocation, groupFactoryFn: (group: WorkbenchMenuGroupFactory, context: Map<string, unknown>) => void | Observable<unknown>, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `group(toolbar):${string}` | WorkbenchToolbarGroupContributionLocation, groupFactoryFn: (group: WorkbenchToolbarGroupFactory, context: Map<string, unknown>) => void | Observable<unknown>, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(locationLike: string | WorkbenchMenuContributionLocationLike, factoryFn: Function, options?: WorkbenchMenuContributionOptions): Disposable {
    const {location, before, after, position} = typeof locationLike === 'string' ? {location: locationLike} as WorkbenchMenuContributionLocationLike : locationLike;

    const contributionId = UUID.randomUUID();
    const scope = location.startsWith('menu:') || location.startsWith('group(menu):') ? 'menu' : 'toolbar';

    // Register contribution.
    void this._messageClient.publish<ɵWorkbenchClientMenuContributionRegisterCommand>(`workbench/menu/contribution/${contributionId}/register`, {
      scope,
      location: normalizeLocation(location),
      requiredContext: new Map([...createEnvironmentContext(), ...options?.requiredContext ?? new Map()]),
      position: prune({before, after, position} as WorkbenchMenuContributionPosition, {pruneIfEmpty: true}),
    });

    // Subscribe for menu construction requests.
    const subscription = this._messageClient.onMessage<ɵWorkbenchClientMenuContributionCreateCommand, WorkbenchMenuItemTransferableLike[]>(`workbench/menu/contribution/${contributionId}/create`, request => {
      const {context} = request.body!;

      console.warn('>>> [ClientTS] menu factory', location, context);

      return of(createMenu())
        .pipe(
          expand(({notifier$}) => notifier$.pipe(take(1), map(() => createMenu()))),
          switchMap(({menuItems}) => WorkbenchMenuItems.toTransferable$(menuItems)),
        );

      function createMenu(): {menuItems: WorkbenchMenuItemLike[]; notifier$: Observable<unknown>} {
        switch (scope) {
          case 'menu': {
            const fn = factoryFn as (menu: WorkbenchMenuFactory | WorkbenchMenuGroupFactory, context: Map<string, unknown>) => void | Observable<unknown>;
            const factory = new ɵWorkbenchMenuFactory();
            const notifier$ = fn(factory, context);

            return {
              menuItems: factory.menuItems,
              notifier$: notifier$ instanceof Observable ? notifier$ : EMPTY,
            };
          }
          case 'toolbar': {
            const fn = factoryFn as (menu: WorkbenchToolbarFactory | WorkbenchToolbarGroupFactory, context: Map<string, unknown>) => void | Observable<unknown>;
            const factory = new ɵWorkbenchToolbarFactory();
            const notifier$ = fn(factory, context);

            return {
              menuItems: factory.menuItems,
              notifier$: notifier$ instanceof Observable ? notifier$ : EMPTY,
            };
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
  public open(menuLike: `menu:${string}` | WorkbenchMenuItemLike[], options: WorkbenchMenuOptions & {focus?: boolean}): WorkbenchMenuRef {
    // Prevent default if opening context menu.
    if (options.anchor instanceof MouseEvent && options.anchor.type === 'contextmenu') {
      options.anchor.preventDefault();
      options.anchor.stopPropagation();
    }

    const menu$: Observable<`menu:${string}` | WorkbenchMenuItemTransferableLike[]> = Array.isArray(menuLike) ? WorkbenchMenuItems.toTransferable$(menuLike) : of(menuLike);

    const subscription = menu$
      .pipe(
        switchMap(menu => this._messageClient.request$<void>(`workbench/menu/open`, {
          menu: menu,
          options: prune({
            anchor: coerceAnchor(options.anchor),
            align: options.align,
            size: {
              width: options.size?.width,
              minWidth: options.size?.minWidth,
              maxWidth: options.size?.maxWidth,
            },
            filter: coerceFilter(options.filter),
            focus: options.focus,
            cssClass: options.cssClass,
          }),
          context: new Map([...createEnvironmentContext(), ...options.context ?? new Map()]),
          workbenchElementId: Beans.get<WorkbenchElement>(WORKBENCH_ELEMENT).id,
        } satisfies ɵWorkbenchClientMenuOpenCommand)
          .pipe(tap({complete: () => void subscription.unsubscribe()}))), // cancel subscription when closing the menu, i.e., the request terminates.
      )
      .subscribe();

    return {
      close: () => subscription.unsubscribe(),
      onClose: onClose => subscription.add(onClose),
    }
  }

  public menuContributions$(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): Observable<WorkbenchMenuItemProxyLike[]> {
    const command: ɵWorkbenchClientMenuItemLookupCommand = {
      location,
      context: new Map([...createEnvironmentContext(), ...context]),
    };
    return this._messageClient.request$<WorkbenchMenuItemTransferableLike[]>('workbench/menu/items', command)
      .pipe(map(message => WorkbenchMenuItems.fromTransferable(message.body!)));
  }
}

function normalizeLocation(location: `menu:${string}` | `toolbar:${string}` | `group(menu):${string}` | `group(toolbar):${string}`): `menu:${string}` | `toolbar:${string}` | `group:${string}` {
  const regex = /^group\((menu|toolbar)\):(?<name>.+)/;
  const match = regex.exec(location);
  if (match) {
    return `group:${match.groups!['name']}`;
  }
  return location as `menu:${string}` | `toolbar:${string}`;
}

function createEnvironmentContext(): Map<string, unknown> {
  const view = Beans.opt(WorkbenchView);
  if (view) {
    return new Map<string, unknown>().set('viewId', view.id);
  }

  const part = Beans.opt(WorkbenchPart);
  if (part) {
    return new Map<string, unknown>().set('partId', part.id);
  }

  const dialog = Beans.opt(WorkbenchDialog);
  if (dialog) {
    return new Map<string, unknown>().set('dialogId', dialog.id);
  }

  const notification = Beans.opt(WorkbenchNotification);
  if (notification) {
    return new Map<string, unknown>().set('notificationId', notification.id);
  }

  return new Map();
}

function coerceAnchor(anchor: HTMLElement | WorkbenchMenuOrigin | MouseEvent): ɵWorkbenchClientMenuOpenCommand['options']['anchor'] {
  if (anchor instanceof HTMLElement) {
    const {x, y, width, height} = coerceElement(anchor).getBoundingClientRect();
    return {x, y, width, height};
  }
  else if (anchor instanceof MouseEvent) {
    return {x: anchor.x, y: anchor.y};
  }
  else {
    return {x: anchor.x, y: anchor.y, width: anchor.width, height: anchor.height};
  }
}

function coerceFilter(filter: SciMenuOptions['filter'] | undefined): ɵWorkbenchClientMenuOpenCommand['options']['filter'] | undefined {
  if (filter === undefined) {
    return undefined;
  }
  if (typeof filter === 'boolean') {
    return filter;
  }
  return {
    placeholder: filter.placeholder,
    notFoundText: filter.notFoundText,
  };
}
