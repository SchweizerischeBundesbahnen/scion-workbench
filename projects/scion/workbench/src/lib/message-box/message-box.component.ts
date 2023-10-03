/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, HostBinding, HostListener, Injector, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {MessageBox, MessageBoxAction} from './message-box';
import {ɵMessageBox} from './ɵmessage-box';
import {asapScheduler, Subject, timer} from 'rxjs';
import {observeOn, takeUntil} from 'rxjs/operators';
import {WorkbenchLayoutService} from '../layout/workbench-layout.service';
import {ComponentPortal, PortalModule} from '@angular/cdk/portal';
import {MoveDelta, MoveDirective} from './move.directive';
import {coerceElement} from '@angular/cdk/coercion';
import {A11yModule} from '@angular/cdk/a11y';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {CoerceObservablePipe} from '../common/coerce-observable.pipe';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

/**
 * A message box is a modal dialog box that an application can use to display a message to the user. It typically contains a text
 * message and one or more buttons.
 */
@Component({
  selector: 'wb-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    PortalModule,
    A11yModule,
    MoveDirective,
    CoerceObservablePipe,
  ],
})
export class MessageBoxComponent implements OnInit {

  @HostBinding('style.--ɵmessage-box-transform-translate-x')
  protected _transformTranslateX = 0;

  @HostBinding('style.--ɵmessage-box-transform-translate-y')
  protected _transformTranslateY = 0;

  private _cancelBlinkTimer$ = new Subject<void>();
  private _activeActionButton: HTMLElement | undefined;

  public portal: ComponentPortal<any> | undefined;

  @HostBinding('class.blinking')
  public blinking = false;

  @HostBinding('class.text-selectable')
  public textSelectable = false;

  @HostBinding('attr.tabindex')
  public tabindex = -1;

  @Input({required: true})
  public messageBox!: ɵMessageBox;

  @Input()
  public set positionDelta(delta: number) {
    this.onMove({deltaX: delta, deltaY: delta});
  }

  @ViewChildren('action_button')
  public actionButtons!: QueryList<ElementRef<HTMLElement>>;

  constructor(private _injector: Injector,
              private _cd: ChangeDetectorRef,
              private _destroyRef: DestroyRef,
              private _workbenchLayoutService: WorkbenchLayoutService) {
  }

  public ngOnInit(): void {
    // Create the portal in a microtask for instant synchronization of message box properties with the user interface,
    // for example, if they are set in the constructor of the message box component.
    asapScheduler.schedule(() => {
      this.portal = this.createPortal(this.messageBox);
      this._cd.detectChanges();
    });
    this.textSelectable = this.messageBox.config.contentSelectable ?? false;
    this.installBlinkRequestHandler();
    this.installFocusRequestHandler();
  }

  @HostListener('keydown.escape', ['$event'])
  public onEscape(event: Event): void {
    const escapeAction = this.messageBox.actions$.value.find(action => ['cancel', 'close'].includes(action.key));
    if (escapeAction) {
      this.close(escapeAction);
      event.stopPropagation();
    }
  }

  public onActionButtonClick(action: MessageBoxAction): void {
    this.close(action);
  }

  public onMoveStart(): void {
    this._workbenchLayoutService.notifyDragStarting();
  }

  public onMove(delta: MoveDelta): void {
    this._transformTranslateX += delta.deltaX;
    this._transformTranslateY += delta.deltaY;
  }

  public onMoveEnd(): void {
    this._workbenchLayoutService.notifyDragEnding();
  }

  private createPortal(messageBox: ɵMessageBox): ComponentPortal<any> {
    const componentConstructOptions = messageBox.config.componentConstructOptions;
    return new ComponentPortal(messageBox.component, componentConstructOptions?.viewContainerRef || null, Injector.create({
      parent: messageBox.config.componentConstructOptions?.injector || this._injector,
      providers: [
        {provide: MessageBox, useValue: messageBox},
      ],
    }));
  }

  private close(action: MessageBoxAction): void {
    this.messageBox.close(action.onAction ? action.onAction() : action.key);
  }

  /**
   * Makes the message box blink for some short time.
   */
  private blink(): void {
    this._cancelBlinkTimer$.next();
    this.blinking = true;
    this._cd.markForCheck();

    timer(300)
      .pipe(
        takeUntil(this._cancelBlinkTimer$),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this.blinking = false;
        this._cd.markForCheck();
      });
  }

  private installBlinkRequestHandler(): void {
    this.messageBox.blink$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.blink());
  }

  private installFocusRequestHandler(): void {
    this.messageBox.requestFocus$
      .pipe(
        observeOn(asapScheduler), // ensures the message box to be displayed
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        coerceElement(this._activeActionButton || this.actionButtons.first)?.focus();
      });
  }

  public onArrowKey(index: number, direction: 'left' | 'right'): void {
    const actionButtons = this.actionButtons.toArray();
    const actionButtonCount = actionButtons.length;
    const newIndex = (direction === 'left' ? index - 1 : index + 1);
    actionButtons[((newIndex + actionButtonCount) % actionButtonCount)].nativeElement.focus();
  }

  public onActionButtonFocus(actionButton: HTMLButtonElement): void {
    this._activeActionButton = actionButton;
  }
}
