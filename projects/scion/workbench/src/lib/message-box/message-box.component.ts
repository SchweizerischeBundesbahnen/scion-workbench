import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Injector, Input, OnDestroy, Output, QueryList, ViewChildren } from '@angular/core';
import { Action, MessageBox, WbMessageBox } from './message-box';
import { PortalInjector } from '@angular/cdk/portal';
import { MoveDelta } from '../move.directive';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WorkbenchConfig } from '../workbench.config';
import { WorkbenchLayoutService } from '../workbench-layout.service';

@Component({
  selector: 'wb-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBoxComponent implements AfterViewInit, OnDestroy {

  private _messageBox: WbMessageBox;
  private _buttons: HTMLButtonElement[];
  private _accDeltaX = 0;
  private _accDeltaY = 0;

  private _destroy$ = new Subject<void>();
  private _cancelBlinkTimer$ = new Subject<void>();

  public text: string;
  public textual: boolean;

  public componentType: any;
  public injector: Injector;

  @HostBinding('attr.class')
  public get severity(): string {
    return this._messageBox.severity || 'info';
  }

  @HostBinding('style.transform')
  public transform: string;

  @HostBinding('class.blinking')
  public blinking: boolean;

  @HostBinding('class.text-selectable')
  public get textSelectable(): boolean {
    return this._messageBox.contentSelectable;
  }

  @ViewChildren('action_button')
  public set buttons(buttons: QueryList<ElementRef<HTMLButtonElement>>) {
    this._buttons = buttons.map(it => it.nativeElement);
    this._buttons[0].focus();
  }

  @Input()
  public set messageBox(messageBox: WbMessageBox) {
    this._messageBox = messageBox;
    this._messageBox.onPropertyChange = (): void => this._cd.markForCheck();

    this.textual = typeof messageBox.content === 'string';
    if (this.textual) {
      this.text = messageBox.content as string;
    } else {
      const injectionTokens = new WeakMap();
      injectionTokens.set(MessageBox, messageBox);
      this.injector = new PortalInjector(this._injector, injectionTokens);
      this.componentType = messageBox.content;
    }
  }

  @Input()
  public set positionDelta(delta: number) {
    this.onMove({deltaX: delta, deltaY: delta});
  }

  @Output()
  public close = new EventEmitter<Action>();

  constructor(private _injector: Injector,
              private _cd: ChangeDetectorRef,
              private _config: WorkbenchConfig,
              private _workbenchLayout: WorkbenchLayoutService) {
  }

  public ngAfterViewInit(): void {
    // Initiate manual change detection cycle because property may change during custom component construction.
    if (this._messageBox.content) {
      setTimeout(() => this._cd.markForCheck());
    }
  }

  @HostListener('keydown.escape', ['$event'])
  public onEscape($event: Event): void {
    if (this.actions.includes('cancel')) {
      this.close.emit('cancel');
      $event.stopPropagation();
    }
    if (this.actions.includes('no')) {
      this.close.emit('no');
      $event.stopPropagation();
    }
  }

  public onAction(action: Action): void {
    this.close.emit(action);
  }

  public onMoveStart(): void {
    this._workbenchLayout.messageBoxMove$.next('start');
  }

  public onMove(delta: MoveDelta): void {
    this._accDeltaX += delta.deltaX;
    this._accDeltaY += delta.deltaY;
    this.transform = `translate(${this._accDeltaX}px, ${this._accDeltaY}px)`;
  }

  public onMoveEnd(): void {
    this._workbenchLayout.messageBoxMove$.next('end');
  }

  public onTab(index: number, direction: 'prev' | 'next'): boolean {
    const buttonCount = this._buttons.length;
    const newIndex = (direction === 'prev' ? index - 1 : index + 1);
    this._buttons[((newIndex + buttonCount) % buttonCount)].focus();

    return false;
  }

  public get title(): string {
    return this._messageBox.title;
  }

  public get actions(): Action[] {
    if (!this._messageBox.actions || this._messageBox.actions.length === 0) {
      return ['ok'];
    }
    if (Array.isArray(this._messageBox.actions)) {
      return this._messageBox.actions;
    }
    return [this._messageBox.actions];
  }

  /**
   * Makes the message box blink for some short time.
   */
  public blink(): void {
    this._cancelBlinkTimer$.next();
    this.blinking = true;
    this._cd.markForCheck();

    timer(500)
      .pipe(
        takeUntil(this._cancelBlinkTimer$),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        this.blinking = false;
        this._cd.markForCheck();
      });
  }

  public getActionLabel(action: Action): string {
    return this._config.text(`messagebox_action_${action}`);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
