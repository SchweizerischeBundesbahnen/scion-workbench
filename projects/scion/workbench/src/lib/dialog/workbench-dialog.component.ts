/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {AfterViewInit, Component, DestroyRef, ElementRef, HostBinding, HostListener, inject, NgZone, OnInit, ViewChild} from '@angular/core';

import {EMPTY, fromEvent, Subject, switchMap, timer} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {A11yModule, CdkTrapFocus} from '@angular/cdk/a11y';
import {AsyncPipe, DOCUMENT, NgComponentOutlet, NgIf} from '@angular/common';
import {CoerceObservablePipe} from '../common/coerce-observable.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ɵWorkbenchDialog} from './ɵworkbench-dialog';
import {MoveDelta, MoveDirective} from '../message-box/move.directive';
import {SciViewportComponent} from '@scion/components/viewport';
import {animate, AnimationMetadata, style, transition, trigger} from '@angular/animations';
import {subscribeInside} from '@scion/toolkit/operators';
import {WorkbenchDialogRegistry} from './workbench-dialog.registry';

/**
 * Renders the workbench dialog.
 *
 * This component is added to a CDK overlay that is aligned with the modality area defined by the dialog.
 * The host element `wb-dialog` acts as the glass pane for the dialog, with the actual dialog rendered in the center of the glass pane.
 * The dialog component is added to a viewport and a focus trap is installed. Upon creation, this component focuses the first focusable
 * element and then tracks the focus in order to restore it when the dialog is re-attached.
 */
@Component({
  selector: 'wb-dialog',
  templateUrl: './workbench-dialog.component.html',
  styleUrls: ['./workbench-dialog.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NgComponentOutlet,
    A11yModule,
    MoveDirective,
    CoerceObservablePipe,
    SciViewportComponent,
  ],
  animations: [
    trigger('enter', provideEnterAnimation()),
  ],
})
export class WorkbenchDialogComponent implements OnInit, AfterViewInit {

  private readonly _cancelBlinkTimer$ = new Subject<void>();
  private readonly _document = inject<Document>(DOCUMENT);
  private _activeElement: HTMLElement | undefined;

  @ViewChild(CdkTrapFocus, {static: true})
  private _cdkTrapFocus!: CdkTrapFocus;

  @ViewChild('dialog_pane', {static: true})
  private _dialogPane!: ElementRef<HTMLElement>;

  @HostBinding('style.--ɵdialog-transform-translate-x')
  protected transformTranslateX = 0;

  @HostBinding('style.--ɵdialog-transform-translate-y')
  protected transformTranslateY = 0;

  @HostBinding('style.--ɵdialog-min-height')
  protected get minHeight(): string | undefined {
    return this.dialog.size.minHeight;
  }

  @HostBinding('style.--ɵdialog-height')
  protected get height(): string | undefined {
    return this.dialog.size.height;
  }

  @HostBinding('style.--ɵdialog-max-height')
  protected get maxHeight(): string | undefined {
    return this.dialog.size.maxHeight;
  }

  @HostBinding('style.--ɵdialog-min-width')
  protected get minWidth(): string | undefined {
    return this.dialog.size.minWidth;
  }

  @HostBinding('style.--ɵdialog-width')
  protected get width(): string | undefined {
    return this.dialog.size.width;
  }

  @HostBinding('style.--ɵdialog-max-width')
  protected get maxWidth(): string | undefined {
    return this.dialog.size.maxWidth;
  }

  @HostBinding('style.--ɵdialog-padding')
  protected get padding(): string | undefined {
    return this.dialog.padding;
  }

  @HostBinding('attr.class')
  public get cssClasses(): string {
    return this.dialog.cssClass;
  }

  @HostBinding('attr.data-viewid')
  protected get viewId(): string | undefined {
    return this.dialog.context.view?.id;
  }

  public blinking = false;

  constructor(public dialog: ɵWorkbenchDialog,
              private _zone: NgZone,
              private _workbenchLayoutService: WorkbenchLayoutService,
              private _workbenchDialogRegistry: WorkbenchDialogRegistry,
              private _destroyRef: DestroyRef) {
    this.setDialogOffset();
  }

  public ngOnInit(): void {
    this.trackFocus();
    this.preventFocusIfBlocked();
  }

  public ngAfterViewInit(): void {
    this.focus();
  }

  /**
   * Focuses the last focused element, if any, or the first focusable element otherwise.
   */
  public focus(): void {
    if (this._activeElement) {
      this._activeElement.focus();
    }
    else if (!this._cdkTrapFocus.focusTrap.focusFirstTabbableElement()) {
      this._dialogPane.nativeElement.focus();
    }
  }

  private setDialogOffset(): void {
    const stackPosition = this.dialog.getPositionInDialogStack();
    this.transformTranslateX = stackPosition * 10;
    this.transformTranslateY = stackPosition * 10;
  }

  /**
   * Tracks the focus of the dialog.
   */
  private trackFocus(): void {
    fromEvent(this._dialogPane.nativeElement, 'focusin')
      .pipe(
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this._activeElement = this._document.activeElement instanceof HTMLElement ? this._document.activeElement : undefined;
      });
  }

  /**
   * Prevent dialog from gaining focus via sequential keyboard navigation when another dialog overlays it.
   */
  private preventFocusIfBlocked(): void {
    this.dialog.blocked$
      .pipe(
        switchMap(blocked => blocked ? fromEvent(this._dialogPane.nativeElement, 'focusin') : EMPTY),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this._workbenchDialogRegistry.top({viewId: this.dialog.context.view?.id})!.focus();
      });
  }

  /**
   * Makes the dialog blink for some short time.
   */
  private blink(): void {
    this._cancelBlinkTimer$.next();
    this.blinking = true;

    timer(300)
      .pipe(
        takeUntil(this._cancelBlinkTimer$),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this.blinking = false;
      });
  }

  @HostListener('keydown.escape', ['$event'])
  protected onEscape(event: Event): void {
    if (this.dialog.closable) {
      this.dialog.close();
      event.stopPropagation();
    }
  }

  @HostListener('mousedown', ['$event'])
  protected onGlassPaneClick(event: MouseEvent): void {
    event.preventDefault(); // to not lose focus
    this.blink();
  }

  protected onMoveStart(): void {
    this._workbenchLayoutService.notifyDragStarting();
  }

  protected onMove(delta: MoveDelta): void {
    this.transformTranslateX += delta.deltaX;
    this.transformTranslateY += delta.deltaY;
  }

  protected onMoveEnd(): void {
    this._workbenchLayoutService.notifyDragEnding();
  }

  protected onCloseClick(): void {
    this.dialog.close();
  }

  protected onCloseMouseDown(event: Event): void {
    event.stopPropagation(); // Prevent dragging with the close button.
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
