import {MaybeObservable, OneOf, RequireOne} from '../common/utility-types';
import {combineLatest, concatWith, firstValueFrom, NEVER, Observable, of, Subscription} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {prune} from '../common/prune.util';
import {createRemoteObservable$, remoteSubscriber$} from './remote-observable';
import {Observables} from '@scion/toolkit/util';
import {WorkbenchMenuFactory} from './workbench-menu.factory';
import {WorkbenchToolbarFactory} from './workbench-toolbar.factory';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Represents a {@link SciMenuItem} in @scion/workbench-client.
 */
export class WorkbenchMenuItem {

  public readonly type = 'menu-item';

  constructor(private _menuItem: {
    id: string;
    name?: `menuitem:${string}`;
    label?: MaybeObservable<string>;
    icon?: MaybeObservable<string>;
    tooltip?: MaybeObservable<string>;
    accelerator?: string[];
    disabled?: MaybeObservable<boolean>;
    checked?: MaybeObservable<boolean>;
    actions: WorkbenchMenuItemLike[];
    cssClass?: string[];
    attributes?: {[name: string]: string};
    position?: WorkbenchMenuContributionPosition;
    onSelect: () => Promise<boolean>;
  }) {
  }

  public toTransferable$(): Observable<WorkbenchMenuItemTransferable> {
    return new Observable(observer => {
      const subscriptions = new Subscription();

      // Emit initial resolved data, then start relaying emissions to remote subscribers.
      subscriptions.add(createRemoteObservable$({
        relayId: this._menuItem.id,
        resolve: {
          label: Observables.coerce(this._menuItem.label),
          icon: Observables.coerce(this._menuItem.icon),
          checked: Observables.coerce(this._menuItem.checked),
          tooltip: Observables.coerce(this._menuItem.tooltip),
          disabled: Observables.coerce(this._menuItem.disabled),
          actions: WorkbenchMenuItems.toTransferable$(this._menuItem.actions),
        },
        mapTo: ({label, icon, checked, tooltip, disabled, actions}): WorkbenchMenuItemTransferable => prune({
          id: this._menuItem.id,
          type: 'menu-item',
          name: this._menuItem.name,
          label: label,
          icon: icon,
          checked: checked,
          tooltip: tooltip,
          accelerator: this._menuItem.accelerator,
          disabled: disabled,
          actions: actions,
          cssClass: this._menuItem.cssClass,
          attributes: this._menuItem.attributes,
          position: this._menuItem.position,
        }),
      }).subscribe(observer));

      // Listen to menu item select requests.
      subscriptions.add(Beans.get(MessageClient).onMessage<void, boolean>(`workbench/menu/${this._menuItem.id}/select`, () => this._menuItem.onSelect()));

      return () => subscriptions.unsubscribe();
    });
  }
}

/**
 * Proxy for a {@link SciMenuItem} in @scion/workbench-client.
 *
 * @docs-private
 */
export class WorkbenchMenuItemProxy {

  public readonly id: string;
  public readonly type = 'menu-item';
  public readonly name?: `menuitem:${string}`;
  public readonly label?: Observable<string>;
  public readonly icon?: Observable<string>;
  public readonly tooltip?: Observable<string>;
  public readonly accelerator?: string[];
  public readonly disabled?: Observable<boolean>;
  public readonly checked?: Observable<boolean>;
  public readonly actions: WorkbenchMenuItemProxyLike[];
  public readonly cssClass?: string[];
  public readonly attributes?: {[name: string]: string};
  public readonly position?: WorkbenchMenuContributionPosition;

  constructor(transferable: WorkbenchMenuItemTransferable) {
    this.id = transferable.id;
    this.name = transferable.name;
    this.label = remoteSubscriber$({relayId: this.id, property: 'label', initialValue: transferable.label});
    this.icon = remoteSubscriber$({relayId: this.id, property: 'icon', initialValue: transferable.icon});
    this.tooltip = remoteSubscriber$({relayId: this.id, property: 'tooltip', initialValue: transferable.tooltip});
    this.accelerator = transferable.accelerator;
    this.disabled = remoteSubscriber$({relayId: this.id, property: 'disabled', initialValue: transferable.disabled});
    this.checked = remoteSubscriber$({relayId: this.id, property: 'checked', initialValue: transferable.checked});
    this.actions = WorkbenchMenuItems.fromTransferable(transferable.actions);
    this.cssClass = transferable.cssClass;
    this.attributes = transferable.attributes;
    this.position = transferable.position;
  }

  /**
   * Publishes a select request to the proxy's remote menu item.
   */
  public select(): Promise<boolean> {
    return firstValueFrom(Beans.get(MessageClient).request$<boolean>(`workbench/menu/${this.id}/select`).pipe(mapToBody()));
  }
}

/**
 * Transfer object for {@link SciMenuItem} snapshot in @scion/workbench-client.
 */
export interface WorkbenchMenuItemTransferable {
  id: string;
  type: 'menu-item'
  name?: `menuitem:${string}`;
  label?: string;
  icon?: string;
  tooltip?: string;
  accelerator?: string[];
  disabled?: boolean;
  checked?: boolean;
  actions: WorkbenchMenuItemTransferableLike[];
  cssClass?: string[];
  attributes?: {[name: string]: string};
  position?: WorkbenchMenuContributionPosition;
}

/**
 * Represents a {@link SciMenu} in @scion/workbench-client.
 */
export class WorkbenchMenu {

  public readonly type = 'menu';

  constructor(private _menu: {
    id: string;
    name?: `menu:${string}`;
    label?: MaybeObservable<string>;
    icon?: MaybeObservable<string>;
    tooltip?: MaybeObservable<string>;
    disabled?: MaybeObservable<boolean>;
    visualMenuHint?: boolean;
    position?: WorkbenchMenuContributionPosition;
    cssClass?: string[];
    children: WorkbenchMenuItemLike[];
    menu: {
      width?: string;
      minWidth?: string;
      maxWidth?: string;
      maxHeight?: string;
      filter?: {placeholder?: MaybeObservable<string>; notFoundText?: MaybeObservable<string>};
    }
  }) {
  }

  public toTransferable$(): Observable<WorkbenchMenuTransferable> {
    // Emit initial resolved data, then start relaying emissions to remote subscribers.
    return createRemoteObservable$({
      relayId: this._menu.id,
      resolve: {
        label: Observables.coerce(this._menu.label),
        icon: Observables.coerce(this._menu.icon),
        tooltip: Observables.coerce(this._menu.tooltip),
        disabled: Observables.coerce(this._menu.disabled),
        filterPlaceholder: Observables.coerce(this._menu.menu.filter?.placeholder),
        filterNotFoundText: Observables.coerce(this._menu.menu.filter?.notFoundText),
        children: WorkbenchMenuItems.toTransferable$(this._menu.children),
      },
      mapTo: ({label, icon, tooltip, disabled, children, filterPlaceholder, filterNotFoundText}): WorkbenchMenuTransferable => prune({
        id: this._menu.id,
        type: 'menu',
        name: this._menu.name,
        label: label,
        icon: icon,
        tooltip: tooltip,
        disabled: disabled,
        visualMenuHint: this._menu.visualMenuHint,
        position: this._menu.position,
        menu: {
          width: this._menu.menu.width,
          minWidth: this._menu.menu.minWidth,
          maxWidth: this._menu.menu.maxWidth,
          maxHeight: this._menu.menu.maxHeight,
          filter: this._menu.menu.filter && {placeholder: filterPlaceholder, notFoundText: filterNotFoundText},
        },
        cssClass: this._menu.cssClass,
        children: children,
      }),
    });
  }
}

/**
 * Proxy for a {@link SciMenu} in @scion/workbench-client.
 *
 * @docs-private
 */
export class WorkbenchMenuProxy {

  public readonly id: string;
  public readonly type = 'menu';
  public readonly name?: `menu:${string}`;
  public readonly label?: Observable<string>;
  public readonly icon?: Observable<string>;
  public readonly tooltip?: Observable<string>;
  public readonly disabled?: Observable<boolean>;
  public readonly visualMenuHint?: boolean;
  public readonly position?: WorkbenchMenuContributionPosition;
  public readonly cssClass?: string[];
  public readonly children: WorkbenchMenuItemProxyLike[];
  public readonly menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: {placeholder?: Observable<string>; notFoundText?: Observable<string>};
  };

  constructor(transferable: WorkbenchMenuTransferable) {
    this.id = transferable.id;
    this.name = transferable.name;
    this.label = remoteSubscriber$({relayId: this.id, property: 'label', initialValue: transferable.label});
    this.icon = remoteSubscriber$({relayId: this.id, property: 'icon', initialValue: transferable.icon});
    this.tooltip = remoteSubscriber$({relayId: this.id, property: 'tooltip', initialValue: transferable.tooltip});
    this.disabled = remoteSubscriber$({relayId: this.id, property: 'disabled', initialValue: transferable.disabled});
    this.visualMenuHint = transferable.visualMenuHint;
    this.position = transferable.position;
    this.cssClass = transferable.cssClass;
    this.children = WorkbenchMenuItems.fromTransferable(transferable.children);
    this.menu = {
      width: transferable.menu.width,
      minWidth: transferable.menu.minWidth,
      maxWidth: transferable.menu.maxWidth,
      maxHeight: transferable.menu.maxHeight,
      filter: transferable.menu.filter && {
        placeholder: remoteSubscriber$({relayId: this.id, property: 'filterPlaceholder', initialValue: transferable.menu.filter.placeholder}),
        notFoundText: remoteSubscriber$({relayId: this.id, property: 'filterNotFoundText', initialValue: transferable.menu.filter.notFoundText}),
      },
    }
  }
}

/**
 * Transfer object for {@link SciMenu} snapshot in @scion/workbench-client.
 */
export interface WorkbenchMenuTransferable {
  id: string;
  type: 'menu'
  name?: `menu:${string}`;
  label?: string;
  icon?: string;
  tooltip?: string;
  disabled?: boolean;
  visualMenuHint?: boolean;
  position?: WorkbenchMenuContributionPosition;
  menu: {
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: {placeholder?: string; notFoundText?: string};
  };
  cssClass?: string[];
  children: WorkbenchMenuItemTransferableLike[];
}

/**
 * Represents a {@link SciMenuGroup} in @scion/workbench-client.
 */
export class WorkbenchMenuGroup {

  public readonly type = 'group';

  constructor(private _group: {
    id: string;
    name?: `menu:${string}` | `toolbar:${string}`;
    label?: MaybeObservable<string>;
    disabled?: MaybeObservable<boolean>;
    collapsible?: {collapsed: boolean};
    position?: WorkbenchMenuContributionPosition;
    children: WorkbenchMenuItemLike[];
    cssClass?: string[];
  }) {
  }

  public toTransferable$(): Observable<WorkbenchMenuGroupTransferable> {
    // Emit initial resolved data, then start relaying emissions to remote subscribers.
    return createRemoteObservable$({
      relayId: this._group.id,
      resolve: {
        label: Observables.coerce(this._group.label),
        disabled: Observables.coerce(this._group.disabled),
        children: WorkbenchMenuItems.toTransferable$(this._group.children),
      },
      mapTo: ({label, disabled, children}): WorkbenchMenuGroupTransferable => prune({
        id: this._group.id,
        type: 'group',
        name: this._group.name,
        label: label,
        collapsible: this._group.collapsible,
        position: this._group.position,
        disabled: disabled,
        children: children,
        cssClass: this._group.cssClass,
      }),
    });
  }
}

/**
 * Proxy for a {@link SciMenuGroup} in @scion/workbench-client.
 *
 * @docs-private
 */
export class WorkbenchMenuGroupProxy {

  public readonly id: string;
  public readonly type = 'group';
  public readonly name?: `menu:${string}` | `toolbar:${string}`;
  public readonly label?: Observable<string>;
  public readonly disabled?: Observable<boolean>;
  public readonly collapsible?: {collapsed: boolean};
  public readonly position?: WorkbenchMenuContributionPosition;
  public readonly children: WorkbenchMenuItemProxyLike[];
  public readonly cssClass?: string[];

  constructor(transferable: WorkbenchMenuGroupTransferable) {
    this.id = transferable.id;
    this.name = transferable.name;
    this.label = remoteSubscriber$({relayId: this.id, property: 'label', initialValue: transferable.label});
    this.collapsible = transferable.collapsible;
    this.position = transferable.position;
    this.disabled = remoteSubscriber$({relayId: this.id, property: 'disabled', initialValue: transferable.disabled});
    this.children = WorkbenchMenuItems.fromTransferable(transferable.children);
    this.cssClass = transferable.cssClass;
  }
}

/**
 * Transfer object for {@link SciMenuGroup} snapshot in @scion/workbench-client.
 */
export interface WorkbenchMenuGroupTransferable {
  id: string;
  type: 'group'
  name?: `menu:${string}` | `toolbar:${string}`;
  label?: string;
  collapsible?: {collapsed: boolean};
  position?: WorkbenchMenuContributionPosition;
  disabled?: boolean;
  children: WorkbenchMenuItemTransferableLike[];
  cssClass?: string[];
}

export type WorkbenchMenuContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}`;
  after?: `menuitem:${string}` | `menu:${string}`;
  position?: 'start' | 'end';
}>;
export type WorkbenchToolbarContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}` | `toolbar:${string}`;
  after?: `menuitem:${string}` | `menu:${string}` | `toolbar:${string}`;
  position?: 'start' | 'end';
}>;
export type WorkbenchMenuContributionPositionLike = WorkbenchMenuContributionPosition | WorkbenchToolbarContributionPosition;

export type WorkbenchMenuContributionLocation = {location: `menu:${string}`} & WorkbenchMenuContributionPosition;
export type WorkbenchToolbarContributionLocation = {location: `toolbar:${string}`} & WorkbenchMenuContributionPosition;
export type WorkbenchMenuContributionLocationLike = WorkbenchMenuContributionLocation | WorkbenchToolbarContributionLocation;

export type WorkbenchMenuFactoryFn = (menu: WorkbenchMenuFactory, context: Map<string, unknown>) => void;
export type WorkbenchToolbarFactoryFn = (toolbar: WorkbenchToolbarFactory, context: Map<string, unknown>) => void;
export type WorkbenchMenuFactoryFnLike = WorkbenchMenuFactoryFn | WorkbenchToolbarFactoryFn;

export type WorkbenchMenuItemLike = WorkbenchMenuItem | WorkbenchMenu | WorkbenchMenuGroup;
export type WorkbenchMenuItemProxyLike = WorkbenchMenuItemProxy | WorkbenchMenuProxy | WorkbenchMenuGroupProxy;
export type WorkbenchMenuItemTransferableLike = WorkbenchMenuItemTransferable | WorkbenchMenuTransferable | WorkbenchMenuGroupTransferable;

export interface WorkbenchMenuContributionOptions {
  requiredContext?: Map<string, unknown>;

  /**
   * Arbitrary metadata to be associated with the contribution.
   */
  metadata?: {[key: string]: unknown};

  contributionInstant?: number;
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
  /**
   * Controls if to focus the menu. Defaults to `true`.
   */
  focus?: boolean;
  size?: {
    width?: string
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
  };
  filter?: boolean | RequireOne<{placeholder?: MaybeObservable<Translatable>; notFoundText?: MaybeObservable<Translatable>}>;
  cssClass?: string[];
  /**
   * Arbitrary metadata to be associated with the operation.
   */
  metadata?: {[key: string]: unknown};
}

export type WorkbenchMenuOrigin = {
  x: number;
  y: number;
  width?: number;
  height?: number;
};

export interface WorkbenchMenuRef {
  close(): void;

  /**
   * Registers a close callback.  Returns a cleanup function that can be invoked to unregister the callback.
   *
   * The callback is immediately called if registering a callback and the menu is already closed.
   */
  onClose: (fn: () => void) => void;
}

/**
 * Provides transformations between {@link WorkbenchMenuItemLike} and transferable {@link WorkbenchMenuItemTransferableLike} menu models.
 */
export namespace WorkbenchMenuItems {

  export function fromTransferable(transferable: WorkbenchMenuItemTransferableLike[]): WorkbenchMenuItemProxyLike[] {
    return transferable.map((transferable: WorkbenchMenuItemTransferableLike): WorkbenchMenuItemProxyLike => {
      switch (transferable.type) {
        case 'menu-item':
          return new WorkbenchMenuItemProxy(transferable);
        case 'menu':
          return new WorkbenchMenuProxy(transferable);
        case 'group':
          return new WorkbenchMenuGroupProxy(transferable);
      }
    });
  }

  export function toTransferable$(menuItems: WorkbenchMenuItemLike[]): Observable<WorkbenchMenuItemTransferableLike[]> {
    const menuItems$ = menuItems.map((menuItem: WorkbenchMenuItemLike): Observable<WorkbenchMenuItemTransferableLike> => menuItem.toTransferable$());
    return (menuItems$.length ? combineLatest(menuItems$) : of([])).pipe(concatWith(NEVER)); // Never complete the observable
  }
}
