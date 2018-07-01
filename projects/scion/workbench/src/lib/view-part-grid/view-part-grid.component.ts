import { Component } from '@angular/core';
import { WbComponentPortal } from '../portal/wb-component-portal';
import { ViewPartGridService } from './view-part-grid.service';
import { VIEW_PART_REF_INDEX, ViewPartInfoArray, ViewPartSashBox } from './view-part-grid-serializer.service';
import { ViewPartComponent } from '../view-part/view-part.component';

/**
 * Allows the arrangement of viewparts in a grid.
 *
 * The grid is a tree which consists of sash boxes and portals.
 * A sash box is the container for two sashes, which itself is either a portal or a sash box, respectively.
 */
@Component({
  selector: 'wb-view-part-grid',
  templateUrl: './view-part-grid.component.html',
  styleUrls: ['./view-part-grid.component.scss'],
  providers: [ViewPartGridService]
})
export class ViewPartGridComponent {

  constructor(private _gridService: ViewPartGridService) {
  }

  /**
   * Returns the root sash box of the grid, or 'null' if not having a nested grid.
   */
  public get rootAsSashBox(): ViewPartSashBox {
    const root = this.root;
    return !Array.isArray(root) ? root : null;
  }

  /**
   * Returns the root portal of the grid, or 'null' if having a nested grid.
   */
  public get rootAsViewPartPortal(): WbComponentPortal<ViewPartComponent> {
    const root = this.root;
    return Array.isArray(root) ? this._gridService.resolveViewPartElseThrow(root[VIEW_PART_REF_INDEX]).portal : null;
  }

  public get root(): ViewPartSashBox | ViewPartInfoArray {
    return this._gridService.grid && this._gridService.grid.root || null;
  }
}
