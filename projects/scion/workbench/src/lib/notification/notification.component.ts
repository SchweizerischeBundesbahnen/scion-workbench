import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostBinding, Injector, Input, OnDestroy, Output } from '@angular/core';
import { Notification, WbNotification } from './notification';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PortalInjector } from '@angular/cdk/portal';

@Component({
  selector: 'wb-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements AfterViewInit, OnDestroy {

  private _destroy$ = new Subject<void>();
  private _closeTimerChange$ = new Subject<void>();
  private _notification: WbNotification;

  public text: string;
  public textual: boolean;

  public componentType: any;
  public injector: Injector;

  @Input()
  public set notification(notification: WbNotification) {
    this._notification = notification;
    this._notification.onPropertyChange = (): void => this._cd.markForCheck();
    this.installAutoCloseTimer();

    this.textual = typeof notification.content === 'string';
    if (this.textual) {
      this.text = notification.content as string;
    } else {
      const injectionTokens = new WeakMap();
      injectionTokens.set(Notification, notification);
      this.injector = new PortalInjector(this._injector, injectionTokens);
      this.componentType = notification.content;
    }
  }

  @Output()
  public close = new EventEmitter<void>();

  @HostBinding('attr.class')
  public get severity(): string {
    return this._notification.severity || 'info';
  }

  constructor(private _injector: Injector, private _cd: ChangeDetectorRef) {
  }

  public ngAfterViewInit(): void {
    // Initiate manual change detection cycle because property may change during custom component construction.
    if (this._notification.content) {
      setTimeout(() => this._cd.markForCheck());
    }
  }

  public onClose(): void {
    this.close.emit();
  }

  /**
   * Installs an auto-close timer if this notification is auto closable and,
   * if an existing timer is in place, that timer is cancelled.
   */
  private installAutoCloseTimer(): void {
    this._closeTimerChange$.next();

    if (this._notification.duration === 'infinite') {
      return;
    }

    const autoCloseTimeout = ((): number => {
      switch (this._notification.duration || 'medium') {
        case 'short':
          return 7000;
        case 'medium':
          return 15000;
        case 'long':
          return 30000;
      }
    })();

    timer(autoCloseTimeout)
      .pipe(
        takeUntil(this._destroy$),
        takeUntil(this._closeTimerChange$)
      )
      .subscribe(() => this.onClose());
  }

  public get title(): string {
    return this._notification.title;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
