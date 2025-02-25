/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, DestroyRef, ElementRef, forwardRef, HostBinding, HostListener, inject, NgZone, OnInit, Provider, ViewChild} from '@angular/core';
import {BehaviorSubject, fromEvent} from 'rxjs';
import {A11yModule, CdkTrapFocus} from '@angular/cdk/a11y';
import {AsyncPipe, NgComponentOutlet, NgTemplateOutlet} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog';
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
import {synchronizeCssClasses} from '../common/css-class.util';

/**
 * Renders the workbench dialog.
 *
 * This component is added to a CDK overlay aligned to the modality context defined by the dialog.
 * The dialog itself is rendered in the center of its modality context.
 */
@Component({
  selector: 'wb-dialog',
  templateUrl: './workbench-dialog.component.html',
  styleUrls: ['./workbench-dialog.component.scss'],
  imports: [
    NgComponentOutlet,
    NgTemplateOutlet,
    A11yModule,
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
})
export class WorkbenchDialogComponent implements OnInit {

  private readonly _zone = inject(NgZone);
  private readonly _destroyRef = inject(DestroyRef);

  /**
   * Element of the dialog that has or last had focus.
   */
  private readonly _activeElement$ = new BehaviorSubject<HTMLElement | undefined>(undefined);

  protected readonly dialog = inject(ɵWorkbenchDialog);

  private _headerHeight: string | undefined;

  @ViewChild(CdkTrapFocus, {static: true})
  private _cdkTrapFocus!: CdkTrapFocus;

  @ViewChild('dialog_element', {static: true})
  private _dialogElement!: ElementRef<HTMLElement>;

  @HostBinding('style.--ɵdialog-transform-translate-x')
  protected transformTranslateX = 0;

  @HostBinding('style.--ɵdialog-transform-translate-y')
  protected transformTranslateY = 0;

  @HostBinding('style.--ɵdialog-min-height')
  protected get minHeight(): string | undefined {
    return this.dialog.size.minHeight() ?? this._headerHeight;
  }

  @HostBinding('style.--ɵdialog-height')
  protected get height(): string | undefined {
    return this.dialog.size.height();
  }

  @HostBinding('style.--ɵdialog-max-height')
  protected get maxHeight(): string | undefined {
    return this.dialog.size.maxHeight();
  }

  @HostBinding('style.--ɵdialog-min-width')
  protected get minWidth(): string | undefined {
    return this.dialog.size.minWidth() ?? '100px';
  }

  @HostBinding('style.--ɵdialog-width')
  protected get width(): string | undefined {
    return this.dialog.size.width();
  }

  @HostBinding('style.--ɵdialog-max-width')
  protected get maxWidth(): string | undefined {
    return this.dialog.size.maxWidth();
  }

  @HostBinding('class.justified')
  protected get justified(): boolean {
    return !this.dialog.padding();
  }

  @HostBinding('attr.data-dialogid')
  public get id(): string {
    return this.dialog.id;
  }

  constructor() {
    this.setDialogOffset();
    this.addHostCssClasses();
  }

  public ngOnInit(): void {
    this.trackFocus();
    this.autoFocus();
  }

  private setDialogOffset(): void {
    const stackPosition = this.dialog.getPositionInDialogStack();
    this.transformTranslateX = stackPosition * 10;
    this.transformTranslateY = stackPosition * 10;
  }

  private addHostCssClasses(): void {
    const host = inject(ElementRef).nativeElement as HTMLElement;
    synchronizeCssClasses(host, this.dialog.cssClass);
  }

  /**
   * Focuses this dialog, restoring the focus to the last element that had the focus,
   * or otherwise focuses the first focusable element.
   */
  public focus(): void {
    const activeElement = this._activeElement$.getValue();
    if (activeElement) {
      activeElement.focus();
    }
    else if (!this._cdkTrapFocus.focusTrap.focusFirstTabbableElement()) {
      // Focus dialog element so that it can be closed via Escape keystroke.
      this._dialogElement.nativeElement.focus();
    }
  }

  /**
   * Tracks the focus of the dialog.
   */
  private trackFocus(): void {
    fromEvent<FocusEvent>(this._dialogElement.nativeElement, 'focusin')
      .pipe(
        subscribeIn(fn => this._zone.runOutsideAngular(fn)),
        map(event => event.target instanceof HTMLElement ? event.target : undefined),
        // The dialog is focused if it has no focusable element, so the dialog can be closed via Escape.
        // However, in order not to cancel the autofocus, the dialog element must not be memoized as the
        // active element. Otherwise, delayed content would not be focused.
        filter(element => element !== this._dialogElement.nativeElement),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(activeElement => {
        this._activeElement$.next(activeElement);
      });
  }

  /**
   * Focuses the first focusable element in the dialog. Has no effect if an element in the dialog already has the focus.
   *
   * If no focusable element can be found, the focusing will be repeated on the next DOM change until an element has the
   * focus, allowing delayed content to get focus.
   */
  private autoFocus(): void {
    fromMutation$(this._dialogElement.nativeElement, {subtree: true, childList: true})
      .pipe(
        startWith(undefined as void),
        takeUntilDestroyed(this._destroyRef),
        takeUntil(this._activeElement$.pipe(filter(Boolean))),
      )
      .subscribe(() => {
        this.focus();
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
    this.transformTranslateX = event.translateX;
    this.transformTranslateY = event.translateY;
  }

  public onResize(event: WbResizeEvent): void {
    if (event.height !== undefined) {
      this.dialog.size.height = `${event.height}px`;
    }
    if (event.width !== undefined) {
      this.dialog.size.width = `${event.width}px`;
    }
    if (event.translateX !== undefined) {
      this.transformTranslateX = event.translateX;
    }
    if (event.translateY !== undefined) {
      this.transformTranslateY = event.translateY;
    }
  }

  protected onHeaderDimensionChange(dimension: SciDimension): void {
    this._headerHeight = `${dimension.offsetHeight}px`;
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
      useExisting: forwardRef(() => ɵWorkbenchDialog), // resolve {@link ɵWorkbenchDialog} via forwardRef because not defined yet, i.e., {@link ɵWorkbenchDialog} constructs {@link WorkbenchDialogComponent} in its constructor.
    },
    {
      provide: GLASS_PANE_OPTIONS,
      useFactory: (): GlassPaneOptions => ({attributes: {'data-dialogid': inject(ɵWorkbenchDialog).id}}),
    },
  ];
}
