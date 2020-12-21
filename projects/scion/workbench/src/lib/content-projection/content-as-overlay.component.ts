/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Input, ViewContainerRef } from '@angular/core';

/**
 * Structural component which adds its `ng-content` to a top-level workbench DOM element and projects it into this component's bounding box.
 *
 * This component ensures that its content children are not reparented in the DOM when the workbench layout is changed.
 * For instance, an iframe would reload when it is reparented in the DOM.
 *
 * Use this component to wrap the entire content of your component, so `<wb-content-as-overlay>` is the only root view child of your component.
 *
 * The <ng-content> is added to a CSS grid container with a single column, thus, content fills remaining space vertically and horizontally.
 * To style elements of `ng-content`, do not combine CSS selectors with the `:host` CSS pseudo-class because, in the DOM, they are not children
 * of the host component.
 *
 * #### Example HTML template:
 *
 * ```html
 * <wb-content-as-overlay overlayHost="...">
 *   <iframe [src]="..."></iframe>
 * </wb-content-as-overlay>
 * ```
 *
 *
 * #### Example SCSS styles:
 *
 * ```scss
 * :host {
 *   display: grid; // fills remaining space vertically and horizontall
 * }
 *
 * iframe {
 *   background-color: gray;
 * }
 * ```
 */
@Component({
  selector: 'wb-content-as-overlay',
  templateUrl: './content-as-overlay.component.html',
  styleUrls: ['./content-as-overlay.component.scss'],
})
export class ContentAsOverlayComponent {

  /**
   * Reference to the view container where to insert the overlay.
   */
  @Input()
  public overlayHost: ViewContainerRef | Promise<ViewContainerRef>;
}
