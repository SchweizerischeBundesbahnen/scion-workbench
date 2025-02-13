/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, computed, effect, ElementRef, inject, input, signal, Signal, TemplateRef, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {setStyle} from '../common/dom.util';
import {boundingClientRect} from '@scion/components/dimension';

/**
 * Projects `ng-content` to a top-level DOM element and aligns it with this component's bounding box.
 *
 * When this component is moved in the DOM, projected content is not moved in the DOM; only its position and size are changed.
 * For example, an iframe would reload when moved in the DOM.
 *
 * Style `ng-content` outside the `:host` CSS pseudo-class as not a direct child of this component.
 *
 * ---
 * Usage:
 * ```html
 * <wb-content-as-overlay [config]="...">
 *   <iframe [src]="..."></iframe>
 * </wb-content-as-overlay>
 * ```
 *
 * ```scss
 * iframe {
 *   background-color: gray;
 * }
 * ```
 */
@Component({
  selector: 'wb-content-as-overlay',
  templateUrl: './content-as-overlay.component.html',
  standalone: true,
})
export class ContentAsOverlayComponent {

  /**
   * Configures content projection of `ng-content`.
   *
   * A config input is used instead of separate input properties to support updating the config if detached from the Angular change detector.
   */
  public config = input.required<ContentAsOverlayConfig>();

  private readonly _template = viewChild.required(TemplateRef);
  private readonly _visible = computed(() => this.config().visible());
  private readonly _location = computed(() => this.config().location());
  private readonly _overlay = signal<HTMLElement | undefined>(undefined);

  constructor() {
    this.createOverlay();
    this.alignOverlayToHostBounds();
  }

  /**
   * Creates the overlay for rendering projected content.
   */
  private createOverlay(): void {
    effect(onCleanup => {
      const location = this._location();
      if (!location) {
        return;
      }

      const template = this._template();

      untracked(() => {
        // Create an embedded view from the content template.
        const overlayViewRef = location.createEmbeddedView(template, null);
        overlayViewRef.detectChanges();
        if (overlayViewRef.rootNodes.length !== 1) {
          throw Error(`[ContentAsOverlayError] Expected single root node for content projection, but received ${overlayViewRef.rootNodes.length} root nodes.`);
        }
        const [overlayElement] = overlayViewRef.rootNodes as HTMLElement[];

        // Position projected content out of the document flow relative to the page viewport.
        setStyle(overlayElement, {position: 'fixed'});

        this._overlay.set(overlayElement);

        // Destroy overlay when the location or template changes.
        onCleanup(() => untracked(() => {
          overlayViewRef.destroy();
          this._overlay.set(undefined);
        }));
      });
    }); // Do not run as root effect for component inputs to be available in the effect.
  }

  /**
   * Aligns the overlay to the bounding box of this component.
   */
  private alignOverlayToHostBounds(): void {
    const hostBounds = boundingClientRect(inject(ElementRef<HTMLElement>));

    effect(() => {
      const overlay = this._overlay();
      if (!overlay) {
        return;
      }

      // Maintain position and size when hidden to prevent flickering when visible again and to support for virtual scrolling in projected content.
      const visible = this._visible();
      if (!visible) {
        setStyle(overlay, {visibility: 'hidden'}); // Hide via `visibility` instead of `display` property to retain the size.
        return;
      }

      // IMPORTANT: Track host bounds only if visible to prevent flickering.
      const {top, left, width, height} = hostBounds();
      setStyle(overlay, {
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        height: `${height}px`,
        visibility: null,
      });
    }, {forceRoot: true}); // Run as root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
  }
}

/**
 * Configures content projection.
 */
export interface ContentAsOverlayConfig {
  /**
   * Specifies the location where to attach projected content in the DOM.
   */
  location: Signal<ViewContainerRef | undefined>;
  /**
   * Controls the visibility of the projected content.
   */
  visible: Signal<boolean>;
}
