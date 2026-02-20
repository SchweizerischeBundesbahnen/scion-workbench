/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, effect, ElementRef, HostListener, inject, NgZone, Provider, signal, untracked, viewChild} from '@angular/core';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {AsyncPipe, NgComponentOutlet, NgTemplateOutlet} from '@angular/common';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog.model';
import {SciViewportComponent} from '@scion/components/viewport';
import {animate, AnimationMetadata, style, transition, trigger} from '@angular/animations';
import {subscribeIn} from '@scion/toolkit/operators';
import {MovableDirective, WbMoveEvent} from './movable.directive';
import {ResizableDirective, WbResizeEvent} from './resizable.directive';
import {SciDimension, SciDimensionDirective} from '@scion/components/dimension';
import {DialogHeaderComponent} from './dialog-header/dialog-header.component';
import {DialogFooterComponent} from './dialog-footer/dialog-footer.component';
import {GLASS_PANE_BLOCKABLE, GLASS_PANE_OPTIONS, GlassPaneDirective, GlassPaneOptions} from '../glass-pane/glass-pane.directive';
import {filter, map, startWith, takeUntil} from 'rxjs/operators';
import {fromMutation$} from '@scion/toolkit/observable';
import {trackFocus} from '../focus/workbench-focus-tracker.service';

/**
 * Renders the content of a workbench dialog.
 */
@Component({
  selector: 'wb-dialog',
  templateUrl: './workbench-dialog.component.html',
  styleUrls: ['./workbench-dialog.component.scss'],
  imports: [
    NgComponentOutlet,
    NgTemplateOutlet,
    CdkTrapFocus,
    AsyncPipe,
    MovableDirective,
    ResizableDirective,
    SciViewportComponent,
    SciDimensionDirective,
    DialogHeaderComponent,
    DialogFooterComponent,
    GlassPaneDirective,
  ],
  animations: [
    trigger('enter', provideEnterAnimation()),
  ],
  viewProviders: [
    configureDialogGlassPane(),
  ],
  host: {
    '[attr.data-dialogid]': 'dialog.id',
    '[class.justified]': '!dialog.padding()',
    '[style.--ɵdialog-transform-translate-x]': 'transformTranslateX()',
    '[style.--ɵdialog-transform-translate-y]': 'transformTranslateY()',
    '[style.--ɵdialog-min-height]': 'dialog.size.minHeight() ?? headerHeight()',
    '[style.--ɵdialog-height]': 'dialog.size.height()',
    '[style.--ɵdialog-max-height]': 'dialog.size.maxHeight()',
    '[style.--ɵdialog-min-width]': 'dialog.size.minWidth() ?? \'100px\'',
    '[style.--ɵdialog-width]': 'dialog.size.width()',
    '[style.--ɵdialog-max-width]': 'dialog.size.maxWidth()',
    '[class]': 'dialog.cssClass()',
  },
})
export class WorkbenchDialogComponent {

  private readonly _host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly _zone = inject(NgZone);
  private readonly _cdkTrapFocus = viewChild.required(CdkTrapFocus);
  private readonly _dialogElement = viewChild.required<ElementRef<HTMLElement>>('dialog_element');

  /** Element of the dialog that has or last had focus */
  private readonly _activeElement$ = new BehaviorSubject<HTMLElement | undefined>(undefined);

  protected readonly dialog = inject(ɵWorkbenchDialog);

  protected headerHeight = signal<string | undefined>(undefined);
  protected transformTranslateX = signal(0);
  protected transformTranslateY = signal(0);

  public readonly dialogBounds = viewChild.required('bounds', {read: ElementRef<HTMLElement>});

  constructor() {
    this.setDialogOffset();
    this.trackFocus();
    this.autoFocus();

    trackFocus(this._host, this.dialog);
  }

  private setDialogOffset(): void {
    const stackPosition = this.dialog.getPositionInDialogStack();
    this.transformTranslateX.set(stackPosition * 10);
    this.transformTranslateY.set(stackPosition * 10);
  }

  /**
   * Focuses this dialog, restoring the focus to the last element that had the focus,
   * or otherwise focuses the first focusable element.
   */
  public focus(): void {
    if (this.dialog.blockedBy()) {
      return;
    }

    const activeElement = this._activeElement$.getValue();
    if (activeElement) {
      activeElement.focus();
    }
    else if (!this._cdkTrapFocus().focusTrap.focusFirstTabbableElement()) {
      // Focus dialog element so that it can be closed via Escape keystroke.
      this._dialogElement().nativeElement.focus();
    }
  }

  /**
   * Tracks the focus of the dialog.
   */
  private trackFocus(): void {
    effect(onCleanup => {
      const dialogElement = this._dialogElement().nativeElement;

      untracked(() => {
        const subscription = fromEvent<FocusEvent>(dialogElement, 'focusin')
          .pipe(
            subscribeIn(fn => this._zone.runOutsideAngular(fn)),
            map(event => event.target instanceof HTMLElement ? event.target : undefined),
            // The dialog is focused if it has no focusable element, so the dialog can be closed via Escape.
            // However, in order not to cancel the autofocus, the dialog element must not be memoized as the
            // active element. Otherwise, delayed content would not be focused.
            filter(element => element !== dialogElement),
          )
          .subscribe(activeElement => {
            this._activeElement$.next(activeElement);
          });
        onCleanup(() => subscription.unsubscribe());
      });
    });
  }

  /**
   * Focuses the first focusable element in the dialog. Has no effect if an element in the dialog already has the focus.
   *
   * If no focusable element can be found, the focusing will be repeated on the next DOM change until an element has the
   * focus, allowing delayed content to get focus.
   */
  private autoFocus(): void {
    effect(onCleanup => {
      const dialogElement = this._dialogElement().nativeElement;

      untracked(() => {
        const subscription = fromMutation$(dialogElement, {subtree: true, childList: true})
          .pipe(
            startWith(undefined as void),
            takeUntil(this._activeElement$.pipe(filter(Boolean))),
          )
          .subscribe(() => {
            this.focus();
          });
        onCleanup(() => subscription.unsubscribe());
      });
    });
  }

  @HostListener('keydown.escape', ['$event'])
  protected onEscape(event: Event): void {
    if (this.dialog.closable()) {
      this.dialog.close();
      event.stopPropagation();
    }
  }

  protected onMove(event: WbMoveEvent): void {
    this.transformTranslateX.set(event.translateX);
    this.transformTranslateY.set(event.translateY);
  }

  protected onResize(event: WbResizeEvent): void {
    if (event.height !== undefined) {
      this.dialog.size.height = `${event.height}px`;
    }
    if (event.width !== undefined) {
      this.dialog.size.width = `${event.width}px`;
    }
    if (event.translateX !== undefined) {
      this.transformTranslateX.set(event.translateX);
    }
    if (event.translateY !== undefined) {
      this.transformTranslateY.set(event.translateY);
    }
  }

  protected onHeaderDimensionChange(dimension: SciDimension): void {
    this.headerHeight.set(`${dimension.offsetHeight}px`);
  }

  protected onDialogMouseDown(): void {
    // Focus the dialog on `mousedown`. The `wbMovable` directive on the header calls `preventDefault()` during `mousedown`,
    // which prevents a `focusin` event from firing and so the workbench focus owner would not be updated. Calling `focus()`
    // ensures the dialog becomes the active/focused element.
    this.focus();
  }
}

/**
 * Returns animation metadata to slide-in a new dialog.
 */
function provideEnterAnimation(): AnimationMetadata[] {
  return [
    transition(':enter', [
      style({opacity: 0, bottom: '100%', top: 'unset'}),
      animate('.1s ease-out', style({opacity: 1, bottom: '*'})),
    ]),
  ];
}

/**
 * Blocks this dialog when other dialog(s) overlay it.
 */
function configureDialogGlassPane(): Provider[] {
  return [
    {
      provide: GLASS_PANE_BLOCKABLE,
      useFactory: () => inject(ɵWorkbenchDialog),
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: () => ({attributes: {'data-dialogid': inject(ɵWorkbenchDialog).id}}) satisfies GlassPaneOptions,
    },
  ];
}
