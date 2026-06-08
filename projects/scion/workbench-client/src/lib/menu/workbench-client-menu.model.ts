import {MaybeObservable, OneOf, RequireOne} from '@scion/toolkit/types';
import {combineLatest, concatWith, firstValueFrom, NEVER, Observable, of, Subscription} from 'rxjs';
import {Beans} from '@scion/toolkit/bean-manager';
import {mapToBody, MessageClient} from '@scion/microfrontend-platform';
import {Observables, prune} from '@scion/toolkit/util';
import {createRemoteObservable$, remoteSubscriber$} from './remote-observable';
import {WorkbenchMenuFactory, WorkbenchMenuFilterConfig} from './workbench-menu.factory';
import {WorkbenchToolbarFactory} from './workbench-toolbar.factory';
import {WorkbenchMenubarFactory} from './workbench-menubar.factory';
import {WorkbenchKeyboardAccelerator} from './workbench-menu-accelerators';

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
    accelerator?: WorkbenchKeyboardAccelerator;
    disabled?: MaybeObservable<boolean>;
    visible?: MaybeObservable<boolean>;
    checked?: MaybeObservable<boolean>;
    active?: MaybeObservable<boolean>;
    actions?: WorkbenchMenuItemLike[];
    position?: WorkbenchMenuContributionPositionLike;
    visualMenuIndicator?: boolean;
    cssClass?: string[];
    attributes?: {[name: string]: string};
    onSelect?: () => Promise<boolean>; // only set for menu items with a selection handler
    menu?: { // only set for menu items with a menu
      name?: `menu:${string}`;
      width?: string;
      minWidth?: string;
      maxWidth?: string;
      maxHeight?: string;
      filter?: WorkbenchMenuFilterConfig<MaybeObservable<string>>;
      children: WorkbenchMenuItemLike[];
    };
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
          tooltip: Observables.coerce(this._menuItem.tooltip),
          disabled: Observables.coerce(this._menuItem.disabled),
          visible: Observables.coerce(this._menuItem.visible),
          checked: Observables.coerce(this._menuItem.checked),
          active: Observables.coerce(this._menuItem.active),
          actions: WorkbenchMenuItems.toTransferable$(this._menuItem.actions ?? []),
          menuFilterPlaceholder: Observables.coerce(this._menuItem.menu?.filter?.placeholder),
          menuFilterNotFoundMessage: Observables.coerce(this._menuItem.menu?.filter?.notFoundMessage),
          menuChildren: WorkbenchMenuItems.toTransferable$(this._menuItem.menu?.children ?? []),
        },
        mapTo: ({label, icon, tooltip, disabled, visible, checked, active, actions, menuFilterPlaceholder, menuFilterNotFoundMessage, menuChildren}) => prune({
          id: this._menuItem.id,
          type: 'menu-item',
          name: this._menuItem.name,
          label: label,
          icon: icon,
          tooltip: tooltip,
          accelerator: this._menuItem.accelerator,
          disabled: disabled,
          visible: visible,
          checked: checked,
          active: active,
          actions: actions,
          cssClass: this._menuItem.cssClass,
          attributes: this._menuItem.attributes,
          position: this._menuItem.position,
          visualMenuIndicator: this._menuItem.visualMenuIndicator,
          onSelect: !!this._menuItem.onSelect,
          menu: this._menuItem.menu && prune({
            name: this._menuItem.menu.name,
            width: this._menuItem.menu.width,
            minWidth: this._menuItem.menu.minWidth,
            maxWidth: this._menuItem.menu.maxWidth,
            maxHeight: this._menuItem.menu.maxHeight,
            filter: this._menuItem.menu.filter && prune({
              placeholder: menuFilterPlaceholder,
              notFoundMessage: menuFilterNotFoundMessage,
              focus: this._menuItem.menu.filter.focus,
            }),
            children: menuChildren,
          }),
        } satisfies WorkbenchMenuItemTransferable),
      }).subscribe(observer));

      // Listen to menu item select requests.
      if (this._menuItem.onSelect) {
        subscriptions.add(Beans.get(MessageClient).onMessage<void, boolean>(`workbench/menu/${this._menuItem.id}/select`, () => this._menuItem.onSelect!()));
      }

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
  public readonly accelerator?: WorkbenchKeyboardAccelerator;
  public readonly disabled?: Observable<boolean>;
  public readonly visible?: Observable<boolean>;
  public readonly checked?: Observable<boolean>;
  public readonly active?: Observable<boolean>;
  public readonly actions: WorkbenchMenuItemProxyLike[];
  public readonly position?: WorkbenchMenuContributionPositionLike;
  public readonly visualMenuIndicator?: boolean;
  public readonly cssClass?: string[];
  public readonly attributes?: {[name: string]: string};
  public readonly select?: () => Promise<boolean>; // only set for menu items with a `onSelect` handler
  public readonly menu?: { // only set for menu items with a menu
    name?: `menu:${string}`;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: WorkbenchMenuFilterConfig<Observable<string>>;
    children: WorkbenchMenuItemProxyLike[];
  };

  constructor(transferable: WorkbenchMenuItemTransferable) {
    this.id = transferable.id;
    this.name = transferable.name;
    this.label = remoteSubscriber$({relayId: this.id, property: 'label', initialValue: transferable.label});
    this.icon = remoteSubscriber$({relayId: this.id, property: 'icon', initialValue: transferable.icon});
    this.tooltip = remoteSubscriber$({relayId: this.id, property: 'tooltip', initialValue: transferable.tooltip});
    this.accelerator = transferable.accelerator;
    this.disabled = remoteSubscriber$({relayId: this.id, property: 'disabled', initialValue: transferable.disabled});
    this.visible = remoteSubscriber$({relayId: this.id, property: 'visible', initialValue: transferable.visible});
    this.checked = remoteSubscriber$({relayId: this.id, property: 'checked', initialValue: transferable.checked});
    this.active = remoteSubscriber$({relayId: this.id, property: 'active', initialValue: transferable.active});
    this.actions = WorkbenchMenuItems.fromTransferable(transferable.actions ?? []);
    this.position = transferable.position;
    this.visualMenuIndicator = transferable.visualMenuIndicator;
    this.cssClass = transferable.cssClass;
    this.attributes = transferable.attributes;
    this.menu = transferable.menu && {
      name: transferable.menu.name,
      width: transferable.menu.width,
      minWidth: transferable.menu.minWidth,
      maxWidth: transferable.menu.maxWidth,
      maxHeight: transferable.menu.maxHeight,
      filter: transferable.menu.filter && {
        placeholder: remoteSubscriber$({relayId: this.id, property: 'menuFilterPlaceholder', initialValue: transferable.menu.filter.placeholder}),
        notFoundMessage: remoteSubscriber$({relayId: this.id, property: 'menuFilterNotFoundMessage', initialValue: transferable.menu.filter.notFoundMessage}),
        focus: transferable.menu.filter.focus,
      },
      children: WorkbenchMenuItems.fromTransferable(transferable.menu.children),
    };

    if (transferable.onSelect) {
      this.select = () => firstValueFrom(Beans.get(MessageClient).request$<boolean>(`workbench/menu/${this.id}/select`).pipe(mapToBody()));
    }
  }
}

/**
 * Transfer object for {@link SciMenuItem} snapshot in @scion/workbench-client.
 */
export interface WorkbenchMenuItemTransferable {
  id: string;
  type: 'menu-item';
  name?: `menuitem:${string}`;
  label?: string;
  icon?: string;
  tooltip?: string;
  accelerator?: WorkbenchKeyboardAccelerator;
  disabled?: boolean;
  visible?: boolean;
  checked?: boolean;
  active?: boolean;
  actions?: WorkbenchMenuItemTransferableLike[];
  position?: WorkbenchMenuContributionPositionLike;
  visualMenuIndicator?: boolean;
  cssClass?: string[];
  attributes?: {[name: string]: string};
  // Indicates if a menu item with a selection handler.
  onSelect?: boolean;
  // Indicates if a menu item with a menu.
  menu?: {
    name?: `menu:${string}`;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    maxHeight?: string;
    filter?: WorkbenchMenuFilterConfig<string>;
    children: WorkbenchMenuItemTransferableLike[];
  };
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
    collapsible?: {collapsed: boolean};
    glyphArea?: false;
    disabled?: MaybeObservable<boolean>;
    visible?: MaybeObservable<boolean>;
    position?: WorkbenchMenuContributionPositionLike;
    actions?: WorkbenchMenuItemLike[];
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
        visible: Observables.coerce(this._group.visible),
        actions: WorkbenchMenuItems.toTransferable$(this._group.actions ?? []),
        children: WorkbenchMenuItems.toTransferable$(this._group.children),
      },
      mapTo: ({label, disabled, visible, actions, children}) => prune({
        id: this._group.id,
        type: 'group',
        name: this._group.name,
        label: label,
        collapsible: this._group.collapsible,
        glyphArea: this._group.glyphArea,
        position: this._group.position,
        disabled: disabled,
        visible: visible,
        actions: actions,
        children: children,
        cssClass: this._group.cssClass,
      } satisfies WorkbenchMenuGroupTransferable),
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
  public readonly collapsible?: {collapsed: boolean};
  public readonly glyphArea?: false;
  public readonly disabled?: Observable<boolean>;
  public readonly visible?: Observable<boolean>;
  public readonly position?: WorkbenchMenuContributionPositionLike;
  public readonly actions: WorkbenchMenuItemProxyLike[];
  public readonly children: WorkbenchMenuItemProxyLike[];
  public readonly cssClass?: string[];

  constructor(transferable: WorkbenchMenuGroupTransferable) {
    this.id = transferable.id;
    this.name = transferable.name;
    this.label = remoteSubscriber$({relayId: this.id, property: 'label', initialValue: transferable.label});
    this.collapsible = transferable.collapsible;
    this.glyphArea = transferable.glyphArea;
    this.disabled = remoteSubscriber$({relayId: this.id, property: 'disabled', initialValue: transferable.disabled});
    this.visible = remoteSubscriber$({relayId: this.id, property: 'visible', initialValue: transferable.visible});
    this.position = transferable.position;
    this.actions = WorkbenchMenuItems.fromTransferable(transferable.actions);
    this.children = WorkbenchMenuItems.fromTransferable(transferable.children);
    this.cssClass = transferable.cssClass;
  }
}

/**
 * Transfer object for {@link SciMenuGroup} snapshot in @scion/workbench-client.
 */
export interface WorkbenchMenuGroupTransferable {
  id: string;
  type: 'group';
  name?: `menu:${string}` | `toolbar:${string}`;
  label?: string;
  collapsible?: {collapsed: boolean};
  glyphArea?: false;
  disabled?: boolean;
  visible?: boolean;
  position?: WorkbenchMenuContributionPositionLike;
  actions: WorkbenchMenuItemTransferableLike[];
  children: WorkbenchMenuItemTransferableLike[];
  cssClass?: string[];
}

export type WorkbenchMenuContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `menu:${string}`;
  after?: `menuitem:${string}` | `menu:${string}`;
  position?: 'start' | 'end';
}>;
export type WorkbenchToolbarContributionPosition = OneOf<{
  before?: `menuitem:${string}` | `toolbar:${string}`;
  after?: `menuitem:${string}` | `toolbar:${string}`;
  position?: 'start' | 'end';
}>;
export type WorkbenchMenubarContributionPosition = OneOf<{
  before?: `menu:${string}`;
  after?: `menu:${string}`;
  position?: 'start' | 'end';
}>;
export type WorkbenchMenuContributionPositionLike = WorkbenchMenuContributionPosition | WorkbenchToolbarContributionPosition;

export type WorkbenchMenuContributionLocation = {location: `menu:${string}`} & WorkbenchMenuContributionPosition;
export type WorkbenchToolbarContributionLocation = {location: `toolbar:${string}`} & WorkbenchToolbarContributionPosition;
export type WorkbenchMenubarContributionLocation = {location: `menubar:${string}`} & WorkbenchMenubarContributionPosition;
export type WorkbenchMenuContributionLocationLike = WorkbenchMenuContributionLocation | WorkbenchToolbarContributionLocation | WorkbenchMenubarContributionLocation;

export type WorkbenchMenuFactoryFn = (menu: WorkbenchMenuFactory, context: Map<string, unknown>) => void;
export type WorkbenchToolbarFactoryFn = (toolbar: WorkbenchToolbarFactory, context: Map<string, unknown>) => void;
export type WorkbenchMenubarFactoryFn = (menubar: WorkbenchMenubarFactory, context: Map<string, unknown>) => void;
export type WorkbenchMenuFactoryFnLike = WorkbenchMenuFactoryFn | WorkbenchToolbarFactoryFn | WorkbenchMenubarFactoryFn;

export type WorkbenchMenuItemLike = WorkbenchMenuItem | WorkbenchMenuGroup;
export type WorkbenchMenuItemProxyLike = WorkbenchMenuItemProxy | WorkbenchMenuGroupProxy;
export type WorkbenchMenuItemTransferableLike = WorkbenchMenuItemTransferable | WorkbenchMenuGroupTransferable;

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
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
  filter?: boolean | RequireOne<WorkbenchMenuFilterConfig>;
  cssClass?: string | string[];
  attributes?: {[name: string]: string};
  /**
   * Arbitrary metadata to be associated with the operation.
   */
  metadata?: {[key: string]: unknown};
}

export interface WorkbenchMenuOrigin {
  x: number;
  y: number;
  width?: number;
  height?: number;
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

/**
 * Keys for defining the context of workbench menus.
 */
export enum WorkbenchMenuContexts {
  ViewId = 'viewId',
  PartId = 'partId',
  DialogId = 'dialogId',
  PopupId = 'popupId',
  NotificationId = 'notificationId',
  Peripheral = 'peripheral',
  MainArea = 'mainArea',
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
