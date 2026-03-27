import {WorkbenchMenuService} from './workbench-menu.service';
import {WorkbenchMenuContributionLocation, WorkbenchMenuContributionLocationLike, WorkbenchMenuContributionOptions, WorkbenchMenuContributionPosition, WorkbenchMenuFactoryFn, WorkbenchMenuFactoryFnLike, WorkbenchMenuGroupContributionLocation, WorkbenchMenuGroupFactoryFn, WorkbenchMenuItemLike, WorkbenchMenuItemProxyLike, WorkbenchMenuItems, WorkbenchMenuItemTransferableLike, WorkbenchMenuOptions, WorkbenchMenuOrigin, WorkbenchMenuRef, WorkbenchToolbarContributionLocation, WorkbenchToolbarFactoryFn, WorkbenchToolbarGroupContributionLocation, WorkbenchToolbarGroupFactoryFn} from './workbench-client-menu.model';
import {Disposable} from '../common/disposable';
import {UUID} from '@scion/toolkit/uuid';
import {Beans} from '@scion/toolkit/bean-manager';
import {MessageClient, MicrofrontendPlatform, PlatformState} from '@scion/microfrontend-platform';
import {ɵWorkbenchMenuFactory} from './ɵworkbench-menu.factory';
import {ɵWorkbenchToolbarFactory} from './ɵworkbench-toolbar.factory';
import {prune} from '../common/prune.util';
import {ɵWorkbenchMenuContributionConstructCommand, ɵWorkbenchMenuContributionRegisterCommand, ɵWorkbenchMenuItemLookupCommand, ɵWorkbenchMenuOpenCommand} from './workbench-client-menu-commands';
import {WorkbenchView} from '../view/workbench-view.model';
import {WorkbenchPart} from '../part/workbench-part.model';
import {WorkbenchDialog} from '../dialog/workbench-dialog.model';
import {WorkbenchNotification} from '../notification/workbench-notification.model';
import {expand, Observable, of, take} from 'rxjs';
import {WORKBENCH_ELEMENT, WorkbenchElement} from '@scion/workbench-client';
import {SciMenuOptions} from '@scion/sci-components/menu';
import {coerceElement} from '@angular/cdk/coercion';
import {finalize, map, switchMap, tap} from 'rxjs/operators';
import {parseMenuLocation} from './workbench-menu-location-parser';

export class ɵWorkbenchMenuService implements WorkbenchMenuService {

  private readonly _messageClient = Beans.get(MessageClient);

  /** @inheritDoc */
  public contributeMenu(location: `menu:${string}` | WorkbenchMenuContributionLocation, menuFactoryFn: WorkbenchMenuFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `toolbar:${string}` | WorkbenchToolbarContributionLocation, toolbarFactoryFn: WorkbenchToolbarFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `group(menu):${string}` | WorkbenchMenuGroupContributionLocation, groupFactoryFn: WorkbenchMenuGroupFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(location: `group(toolbar):${string}` | WorkbenchToolbarGroupContributionLocation, groupFactoryFn: WorkbenchToolbarGroupFactoryFn, options?: WorkbenchMenuContributionOptions): Disposable;
  public contributeMenu(locationLike: string | WorkbenchMenuContributionLocationLike, factoryFn: WorkbenchMenuFactoryFnLike, options?: WorkbenchMenuContributionOptions): Disposable {
    const {location, before, after, position} = typeof locationLike === 'string' ? {location: locationLike} as WorkbenchMenuContributionLocationLike : locationLike;

    const contributionId = UUID.randomUUID();
    const {scope} = parseMenuLocation(location);

    // Register contribution.
    void this._messageClient.publish<ɵWorkbenchMenuContributionRegisterCommand>(`workbench/menu/contribution/${contributionId}/register`, {
      location: location,
      requiredContext: new Map([...createEnvironmentContext(), ...options?.requiredContext ?? new Map()]),
      position: prune({before, after, position} as WorkbenchMenuContributionPosition, {pruneIfEmpty: true}),
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

      function createMenu(): ɵWorkbenchMenuFactory | ɵWorkbenchToolbarFactory {
        switch (scope) {
          case 'menu': {
            const menuFactory = new ɵWorkbenchMenuFactory();
            const menuFactoryFn = factoryFn as WorkbenchMenuFactoryFn | WorkbenchMenuGroupFactoryFn;
            menuFactoryFn(menuFactory, context);
            return menuFactory;
          }
          case 'toolbar': {
            const toolbarFactory = new ɵWorkbenchToolbarFactory();
            const toolbarFactoryFn = factoryFn as WorkbenchToolbarFactoryFn | WorkbenchToolbarGroupFactoryFn;
            toolbarFactoryFn(toolbarFactory, context);
            return toolbarFactory;
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
        } satisfies ɵWorkbenchMenuOpenCommand)
          .pipe(tap({complete: () => void subscription.unsubscribe()}))), // cancel subscription when closing the menu, i.e., the request terminates.
      )
      .subscribe();

    return {
      close: () => subscription.unsubscribe(),
      onClose: onClose => subscription.add(onClose),
    }
  }

  public menuContributions$(location: `menu:${string}` | `toolbar:${string}` | `group:${string}`, context: Map<string, unknown>): Observable<WorkbenchMenuItemProxyLike[]> {
    const command: ɵWorkbenchMenuItemLookupCommand = {
      location,
      context: new Map([...createEnvironmentContext(), ...context]),
    };
    return this._messageClient.request$<WorkbenchMenuItemTransferableLike[]>('workbench/menu/items', command)
      .pipe(map(message => WorkbenchMenuItems.fromTransferable(message.body!)));
  }
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

function coerceAnchor(anchor: HTMLElement | WorkbenchMenuOrigin | MouseEvent): ɵWorkbenchMenuOpenCommand['options']['anchor'] {
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

function coerceFilter(filter: SciMenuOptions['filter'] | undefined): ɵWorkbenchMenuOpenCommand['options']['filter'] | undefined {
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
