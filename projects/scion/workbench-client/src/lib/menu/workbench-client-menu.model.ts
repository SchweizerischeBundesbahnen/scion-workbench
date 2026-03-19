import {MaybeAsync, OneOf} from '../common/utility-types';
import {combineLatest, firstValueFrom, isObservable, Observable, of, Subscription, take} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {shareReplay, tap} from 'rxjs/operators';
import {prune} from '../common/prune.util';

export class WorkbenchMenuItem {

  private readonly _messageClient = Beans.get(MessageClient);

  public readonly id: string;
  public readonly type = 'menu-item';
  public readonly name?: `menuitem:${string}`;
  public readonly label?: Observable<string>;
  public readonly icon?: Observable<string>;
  public readonly tooltip?: Observable<string>;
  public readonly accelerator?: string[];
  public readonly disabled: Observable<boolean>;
  public readonly checked?: Observable<boolean>;
  public readonly actions: WorkbenchMenuItemLike[];
  public readonly cssClass?: string[];
  public readonly position?: WorkbenchMenuContributionPosition;

  private readonly _onSelect?: () => boolean | void | Promise<boolean | void>;

  constructor(menuItem: {
    id: string;
    name?: `menuitem:${string}`;
    label?: MaybeAsync<string>;
    icon?: MaybeAsync<string>;
    tooltip?: MaybeAsync<string>;
    accelerator?: string[];
    disabled: MaybeAsync<boolean> | boolean;
    checked?: MaybeAsync<boolean>;
    actions: WorkbenchMenuItemLike[];
    cssClass?: string[];
    position?: WorkbenchMenuContributionPosition;
    onSelect?: () => boolean | void | Promise<boolean | void>;
  }) {
    this.id = menuItem.id;
    this.name = menuItem.name;
    this.label = toObservableProxy(menuItem.label, {property: `${this.id}-label`});
    this.icon = toObservableProxy(menuItem.icon, {property: `${this.id}-icon`});
    this.tooltip = toObservableProxy(menuItem.tooltip, {property: `${this.id}-tooltip`});
    this.accelerator = menuItem.accelerator;
    this.disabled = toObservableProxy(menuItem.disabled, {property: `${this.id}-disabled`});
    this.checked = toObservableProxy(menuItem.checked, {property: `${this.id}-checked`});
    this.actions = menuItem.actions;
    this.cssClass = menuItem.cssClass;
    this.position = menuItem.position;
    this._onSelect = menuItem.onSelect;
  }

  public installSelectHandler(): Subscription {
    if (!this._onSelect) {
      throw Error('[MenuError] Illegal state. No select handler');
    }
    return this._messageClient.onMessage<void, boolean | void>(`workbench/menu/${this.id}/select`, this._onSelect);
  }

  public select(): Promise<boolean> {
    return firstValueFrom(this._messageClient.request$<boolean>(`workbench/menu/${this.id}/select`).pipe(mapToBody()), {defaultValue: this.checked === undefined}); // Defaults to closing non-checkable menu items.
  }
}

export class WorkbenchMenu {

  public readonly id: string;
  public readonly type = 'menu';
  public readonly name?: `menu:${string}`;
  public readonly label?: Observable<string>;
  public readonly icon?: Observable<string>;
  public readonly tooltip?: Observable<string>;
  public readonly disabled: Observable<boolean>;
  public readonly visualMenuHint?: boolean;
  public readonly position?: WorkbenchMenuContributionPosition;
  public readonly cssClass?: string[];
  public readonly children: WorkbenchMenuItemLike[];
  public readonly menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };

  constructor(menu: {
    id: string;
    name?: `menu:${string}`;
    label?: MaybeAsync<string>;
    icon?: MaybeAsync<string>;
    tooltip?: MaybeAsync<string>;
    disabled: MaybeAsync<boolean>;
    visualMenuHint?: boolean;
    position?: WorkbenchMenuContributionPosition;
    cssClass?: string[];
    children: WorkbenchMenuItemLike[];
    menu: {
      width?: string;
      minWidth?: string;
      maxWidth?: string;
      maxHeight?: string;
      filter?: boolean | {placeholder?: string; notFoundText?: string};
    }
  }) {
    this.id = menu.id;
    this.name = menu.name;
    this.label = toObservableProxy(menu.label, {property: `${this.id}-label`});
    this.icon = toObservableProxy(menu.icon, {property: `${this.id}-icon`});
    this.tooltip = toObservableProxy(menu.tooltip, {property: `${this.id}-tooltip`});
    this.disabled = toObservableProxy(menu.disabled, {property: `${this.id}-disabled`});
    this.visualMenuHint = menu.visualMenuHint;
    this.position = menu.position;
    this.cssClass = menu.cssClass;
    this.children = menu.children;
    this.menu = menu.menu;
  }
}

export class WorkbenchMenuGroup {

  public readonly id: string;
  public readonly type = 'group';
  public readonly name?: `group:${string}`;
  public readonly label?: Observable<string>;
  public readonly disabled: Observable<boolean>;
  public readonly collapsible?: {collapsed: boolean} | false;
  public readonly position?: WorkbenchMenuContributionPosition;
  public readonly children: WorkbenchMenuItemLike[];
  public readonly cssClass?: string[];

  constructor(group: {
    id: string;
    name?: `group:${string}`;
    label?: MaybeAsync<string>;
    disabled: MaybeAsync<boolean>;
    collapsible?: {collapsed: boolean} | false;
    position?: WorkbenchMenuContributionPosition;
    children: WorkbenchMenuItemLike[];
    cssClass?: string[];
  }) {
    this.id = group.id;
    this.name = group.name;
    this.label = toObservableProxy(group.label, {property: `${this.id}-label`});
    this.collapsible = group.collapsible;
    this.position = group.position;
    this.disabled = toObservableProxy(group.disabled, {property: `${this.id}-disabled`});
    this.children = group.children;
    this.cssClass = group.cssClass;
  }
}

export type WorkbenchMenuContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `group:${string}`;
  position?: 'start' | 'end';
}>;

export type WorkbenchMenuContributionLocation = {location: `menu:${string}`} & WorkbenchMenuContributionPosition;

export type WorkbenchToolbarContributionLocation = {location: `toolbar:${string}`} & WorkbenchMenuContributionPosition;

export type WorkbenchMenuGroupContributionLocation = {location: `group(menu):${string}`} & WorkbenchMenuContributionPosition;

export type WorkbenchToolbarGroupContributionLocation = {location: `group(toolbar):${string}`} & WorkbenchMenuContributionPosition;

export type WorkbenchMenuContributionLocationLike = WorkbenchMenuContributionLocation | WorkbenchToolbarContributionLocation | WorkbenchMenuGroupContributionLocation | WorkbenchToolbarGroupContributionLocation;

export type WorkbenchMenuItemLike = WorkbenchMenuItem | WorkbenchMenu | WorkbenchMenuGroup;

export interface WorkbenchMenuOpenOptions {
  anchor: WorkbenchMenuOrigin,
  /**
   * Controls where to align the menu relative to the menu anchor, unless there is not enough space available in that area. Defaults to `south`.
   */
  align?: 'vertical' | 'horizontal';

  size?: {
    width?: string
    minWidth?: string;
    maxWidth?: string;
  };
  filter?: boolean | {placeholder?: string; notFoundText?: string};
  focus?: boolean;
  cssClass?: string[];
}

export type WorkbenchMenuOrigin = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export interface WorkbenchMenuContributionOptions {
  requiredContext?: Map<string, unknown>;
}

export interface WorkbenchMenuOptions {
  /**
   * Controls where to open the menu.
   *
   * Can be an HTML element or a coordinate. The coordinate is relative to the page viewport.
   *
   * Supported coordinate pairs:
   * - x/y: Relative to the top/left corner of the page viewport.
   * - top/left: Same as x/y.
   * - top/right: Relative to the top/right corner of the page viewport.
   * - bottom/left: Relative to the bottom/left corner of the page viewport.
   * - bottom/right: Relative to the bottom/right corner of the page viewport.
   */
  anchor: HTMLElement | WorkbenchMenuOrigin | MouseEvent;
  context?: Map<string, unknown>;
  /**
   * Controls where to align the menu relative to the menu anchor, unless there is not enough space available in that area. Defaults to `south`.
   */
  align?: 'vertical' | 'horizontal';

  size?: {
    width?: string
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
  };
  filter?: boolean | {placeholder?: string; notFoundText?: string};
  cssClass?: string[];
}

export interface WorkbenchMenuRef {
  close(): void;

  /**
   * Registers a close callback.  Returns a cleanup function that can be invoked to unregister the callback.
   *
   * The callback is immediately called if registering a callback and the menu is already closed.
   */
  onClose: (fn: () => void) => void;
}

function toObservableProxy<T>(source: MaybeAsync<NonNullable<T>>, config: {property: string}): Observable<NonNullable<T>>;
function toObservableProxy<T>(source: MaybeAsync<T> | undefined, config: {property: string}): Observable<NonNullable<T>> | undefined;
function toObservableProxy<T>(source: MaybeAsync<T> | undefined, config: {property: string}): Observable<T> | undefined {
  if (source === undefined) {
    return undefined;
  }

  // If an observable, it is a value provider and values must be sent thorugh wire.
  if (isObservable(source)) {
    return new Observable(observer => {
      // Mirror the source plus publish emissions as a side effect.

      let subscribing = true;
      const subscription = source
        .pipe(tap(value => {
          if (!subscribing) {
            console.log(`>>> send update from observable proxy [${config.property}=${value}`);
            void Beans.get(MessageClient).publish(`workbench/menu/property/${config.property}`, value);
          }
        })) // TODO [menu] ONLY EMIT UPON SUBSCRIPTION IF NOT SYNC
        .subscribe(observer);
      subscribing = false;

      return () => subscription.unsubscribe();
    });
  }

  // Create observable with given initial value plus subscribing to remote changes.
  return new Observable(observer => {
    observer.next(source);
    const subscription = Beans.get(MessageClient).observe$<T>(`workbench/menu/property/${config.property}`).pipe(mapToBody()).subscribe(observer);
    return () => subscription.unsubscribe();
  });
}

export type WorkbenchMenuItemTransferableLike = WorkbenchMenuItemTransferable | WorkbenchMenuTransferable | WorkbenchMenuGroupTransferable;

export interface WorkbenchMenuItemTransferable {
  id: string;
  type: 'menu-item'
  name?: `menuitem:${string}`;
  label?: string;
  icon?: string;
  tooltip?: string;
  accelerator?: string[];
  disabled: boolean;
  checked?: boolean;
  actions: WorkbenchMenuItemTransferableLike[];
  cssClass?: string[];
  position?: WorkbenchMenuContributionPosition;
}

export interface WorkbenchMenuTransferable {
  id: string;
  type: 'menu'
  name?: `menu:${string}`;
  label?: string;
  icon?: string;
  tooltip?: string;
  disabled: boolean;
  visualMenuHint?: boolean;
  position?: WorkbenchMenuContributionPosition;
  menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: boolean | {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string[];
  children: WorkbenchMenuItemTransferableLike[];
}

export interface WorkbenchMenuGroupTransferable {
  id: string;
  type: 'group'
  name?: `group:${string}`;
  label?: string;
  collapsible?: {collapsed: boolean} | false;
  position?: WorkbenchMenuContributionPosition;
  disabled: boolean;
  children: WorkbenchMenuItemTransferableLike[];
  cssClass?: string[];
}

// WorkbenchMenuItemLike <> TWorkbenchClientMenuItemLike
export namespace WorkbenchMenuItems {

  export function fromTransferable(transferable: WorkbenchMenuItemTransferableLike[]): WorkbenchMenuItemLike[] {
    return transferable.map((transferable: WorkbenchMenuItemTransferableLike): WorkbenchMenuItemLike => {
      switch (transferable.type) {
        case 'menu-item': {
          return new WorkbenchMenuItem({
            id: transferable.id,
            name: transferable.name,
            label: transferable.label,
            icon: transferable.icon,
            tooltip: transferable.tooltip,
            accelerator: transferable.accelerator,
            disabled: transferable.disabled,
            checked: transferable.checked,
            actions: WorkbenchMenuItems.fromTransferable(transferable.actions),
            cssClass: transferable.cssClass,
            position: transferable.position,
          });
        }
        case 'menu': {
          return new WorkbenchMenu({
            id: transferable.id,
            name: transferable.name,
            label: transferable.label,
            icon: transferable.icon,
            tooltip: transferable.tooltip,
            disabled: transferable.disabled,
            visualMenuHint: transferable.visualMenuHint,
            position: transferable.position,
            menu: {
              width: transferable.menu.width,
              minWidth: transferable.menu.minWidth,
              maxWidth: transferable.menu.maxWidth,
              maxHeight: transferable.menu.maxHeight,
              filter: transferable.menu.filter,
            },
            cssClass: transferable.cssClass,
            children: WorkbenchMenuItems.fromTransferable(transferable.children),
          });
        }
        case 'group': {
          return new WorkbenchMenuGroup({
            id: transferable.id,
            name: transferable.name,
            label: transferable.label,
            collapsible: transferable.collapsible,
            position: transferable.position,
            disabled: transferable.disabled,
            cssClass: transferable.cssClass,
            children: WorkbenchMenuItems.fromTransferable(transferable.children),
          });
        }
      }
    });
  }

  export function toTransferable$(menuItems: WorkbenchMenuItemLike[]): Observable<WorkbenchMenuItemTransferableLike[]> {
    const menuItems$ = menuItems.map((menuItem: WorkbenchMenuItemLike): Observable<WorkbenchMenuItemTransferableLike> => {
      switch (menuItem.type) {
        case 'menu-item': {
          return new Observable<WorkbenchMenuItemTransferable>(observer => {
            const subscriptions = new Subscription();

            // Resolve data from observables.
            const resolve$ = combineLatest({
              label: menuItem.label ?? of(undefined),
              icon: menuItem.icon ?? of(undefined),
              checked: menuItem.checked ?? of(undefined),
              tooltip: menuItem.tooltip ?? of(undefined),
              disabled: menuItem.disabled,
              actions: WorkbenchMenuItems.toTransferable$(menuItem.actions),
            }).pipe(shareReplay({refCount: true, bufferSize: 1}));

            // Emit the initial snapshot; updates are sent by obervable proxies.
            subscriptions.add(resolve$
              .pipe(take(1))
              .subscribe(({label, icon, checked, tooltip, disabled, actions}) => {
                observer.next(prune({
                  id: menuItem.id,
                  type: 'menu-item',
                  name: menuItem.name,
                  label: label,
                  icon: icon,
                  checked: checked,
                  tooltip: tooltip,
                  accelerator: menuItem.accelerator,
                  disabled: disabled,
                  actions: actions,
                  cssClass: menuItem.cssClass,
                  position: menuItem.position,
                } satisfies WorkbenchMenuItemTransferable));
              }));

            // Keep resolved data observable active for observable proxies to send updates.
            subscriptions.add(resolve$.subscribe());

            // Install selection handler.
            subscriptions.add(menuItem.installSelectHandler());

            return () => subscriptions.unsubscribe();
          });
        }
        case 'menu': {
          return new Observable<WorkbenchMenuTransferable>(observer => {
            const subscriptions = new Subscription();

            // Resolve data from observables.
            const resolve$ = combineLatest({
              label: menuItem.label ?? of(undefined),
              icon: menuItem.icon ?? of(undefined),
              tooltip: menuItem.tooltip ?? of(undefined),
              disabled: menuItem.disabled,
              children: WorkbenchMenuItems.toTransferable$(menuItem.children),
            }).pipe(shareReplay({refCount: true, bufferSize: 1}));

            // Emit the initial snapshot; updates are sent by obervable proxies.
            subscriptions.add(resolve$
              .pipe(take(1))
              .subscribe(({label, icon, tooltip, disabled, children}) => {
                observer.next(prune({
                  id: menuItem.id,
                  type: 'menu',
                  name: menuItem.name,
                  label: label,
                  icon: icon,
                  tooltip: tooltip,
                  disabled: disabled,
                  visualMenuHint: menuItem.visualMenuHint,
                  position: menuItem.position,
                  menu: {
                    width: menuItem.menu.width,
                    minWidth: menuItem.menu.minWidth,
                    maxWidth: menuItem.menu.maxWidth,
                    maxHeight: menuItem.menu.maxHeight,
                    filter: menuItem.menu.filter,
                  },
                  cssClass: menuItem.cssClass,
                  children: children,
                } satisfies WorkbenchMenuTransferable));
              }),
            );

            // Keep resolved data observable active for observable proxies to send updates.
            subscriptions.add(resolve$.subscribe());

            return () => subscriptions.unsubscribe();
          });
        }
        case 'group': {
          return new Observable<WorkbenchMenuGroupTransferable>(observer => {
            const subscriptions = new Subscription();

            // Resolve data from observables.
            const resolve$ = combineLatest({
              label: menuItem.label ?? of(undefined),
              disabled: menuItem.disabled,
              children: WorkbenchMenuItems.toTransferable$(menuItem.children),
            }).pipe(shareReplay({refCount: true, bufferSize: 1}));

            // Emit the initial snapshot; updates are sent by obervable proxies.
            subscriptions.add(resolve$
              .pipe(take(1))
              .subscribe(({label, disabled, children}) => {
                observer.next(prune({
                  id: menuItem.id,
                  type: 'group',
                  name: menuItem.name,
                  label: label,
                  collapsible: menuItem.collapsible,
                  position: menuItem.position,
                  disabled: disabled,
                  children: children,
                  cssClass: menuItem.cssClass,
                } satisfies WorkbenchMenuGroupTransferable));
              }),
            );

            // Keep resolved data observable active for observable proxies to send updates.
            subscriptions.add(resolve$.subscribe());

            return () => subscriptions.unsubscribe();
          });
        }
      }
    });

    return menuItems$.length ? combineLatest(menuItems$) : of([]);
  }
}
