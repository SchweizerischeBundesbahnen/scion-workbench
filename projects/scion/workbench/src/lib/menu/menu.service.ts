import {inject, Injectable, Injector} from '@angular/core';
import {ComponentPortal} from '@angular/cdk/portal';
import {ConnectedPosition, Overlay} from '@angular/cdk/overlay';
import {MenuComponent, SUBMENU_ITEM} from './menu/menu.component';
import {MSubMenuItem} from './ɵmenu';

const NORTH: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: 'wb-north'};
const SOUTH: ConnectedPosition = {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', panelClass: 'wb-south'};

const WEST_BOTTOM: ConnectedPosition = {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', panelClass: 'wb-west'};
const WEST_TOP: ConnectedPosition = {originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', panelClass: 'wb-west'};

const EAST_BOTTOM: ConnectedPosition = {originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', panelClass: 'wb-west'};
const EAST_TOP: ConnectedPosition = {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', panelClass: 'wb-west'};

@Injectable({providedIn: 'root'})
export class MenuService {

  private _injector = inject(Injector);
  private _overlay = inject(Overlay);

  public open(connectedTo: HTMLElement, menu: MSubMenuItem, options: {rootMenu: boolean}): void {
    const injector = Injector.create({
      parent: this._injector,
      providers: [
        {provide: SUBMENU_ITEM, useValue: menu},
      ],
    })
    const portal = new ComponentPortal(MenuComponent, null, injector);

    const positionStrategy = this._overlay.position()
      .flexibleConnectedTo(connectedTo)
      .withFlexibleDimensions(false)
      .withLockedPosition(false) // If locked, the popup won't attempt to reposition itself if not enough space available.
      .withPositions(((): ConnectedPosition[] => {
        if (options.rootMenu) {
          return [SOUTH, NORTH];
        }
        else {
          return [EAST_BOTTOM, EAST_TOP, WEST_BOTTOM, WEST_TOP];
        }
      })());

    const overlayRef = this._overlay.create({
      panelClass: 'wb-menu',
      hasBackdrop: false,
      positionStrategy: positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.close(),
      disposeOnNavigation: true,
      usePopover: false,
    })
    const componentRef = overlayRef.attach(portal);
    const overlayElement = componentRef.location.nativeElement as HTMLElement;
    console.log('>>> overlayElement', overlayElement);
  }
}
