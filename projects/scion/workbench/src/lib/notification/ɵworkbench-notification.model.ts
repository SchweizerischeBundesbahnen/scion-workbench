import {DestroyableInjector, DestroyRef, DOCUMENT, effect, inject, Injector, NgZone, Signal, signal, untracked, WritableSignal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {Arrays} from '@scion/toolkit/util';
import {NotificationId} from '../workbench.identifiers';
import {WorkbenchNotification} from './workbench-notification.model';
import {WorkbenchNotificationOptions} from './workbench-notification.options';
import {Translatable} from '../text/workbench-text-provider.model';
import {ɵNotification} from './ɵnotification';
import {Notification} from './notification';
import {fromEvent} from 'rxjs';
import {observeIn, subscribeIn} from '@scion/toolkit/operators';
import {filter} from 'rxjs/operators';
import {WorkbenchNotificationRegistry} from './workbench-notification.registry';

/** @inheritDoc */
export class ɵWorkbenchNotification implements WorkbenchNotification {

  /** Injector for the notification; destroyed when the notification is closed. */
  private readonly _injector = inject(Injector) as DestroyableInjector;

  public readonly slot: {
    component: ComponentType<unknown> | undefined;
    text: Translatable | undefined;
    injector: Injector;
  };

  private readonly _notificationRegistry = inject(WorkbenchNotificationRegistry);
  private readonly _title: WritableSignal<Translatable | undefined>;
  private readonly _severity: WritableSignal<'info' | 'warn' | 'error'>;
  private readonly _duration: WritableSignal<'short' | 'medium' | 'long' | 'infinite' | number>;
  private readonly _cssClass: WritableSignal<string[]>;

  public readonly destroyed = signal<boolean>(false);
  public readonly group: string | undefined;

  constructor(public id: NotificationId,
              content: Translatable | ComponentType<unknown>,
              private _options: WorkbenchNotificationOptions) {
    this.slot = {
      injector: this.createInjector(),
      component: typeof content === 'function' ? content : undefined,
      text: typeof content === 'string' ? content : undefined,
    };
    this._title = signal(this._options.title);
    this._severity = signal(this._options.severity ?? 'info');
    this._duration = signal(this._options.duration ?? 'medium');
    this._cssClass = signal(Arrays.coerce(this._options.cssClass));
    this.group = this._options.group;

    this.closeOnEscape();

    inject(DestroyRef).onDestroy(() => this.destroyed.set(true));
  }

  /**
   * Creates an injector to render content in the notification's injection context.
   */
  private createInjector(): Injector {
    const injector = Injector.create({
      parent: this._options.injector ?? inject(Injector),
      providers: [
        {provide: ɵWorkbenchNotification, useValue: this},
        {provide: WorkbenchNotification, useExisting: ɵWorkbenchNotification},
        {provide: Notification, useClass: ɵNotification},
        ...this._options.providers ?? [],
      ],
    });
    inject(DestroyRef).onDestroy(() => injector.destroy());
    return injector;
  }

  /** @inheritDoc */
  public get title(): Signal<Translatable | undefined> {
    return this._title;
  }

  /** @inheritDoc */
  public set title(title: Translatable | undefined) {
    untracked(() => this._title.set(title));
  }

  /** @inheritDoc */
  public get severity(): Signal<'info' | 'warn' | 'error'> {
    return this._severity;
  }

  /** @inheritDoc */
  public set severity(severity: 'info' | 'warn' | 'error') {
    untracked(() => this._severity.set(severity));
  }

  /** @inheritDoc */
  public get duration(): Signal<'short' | 'medium' | 'long' | 'infinite' | number> {
    return this._duration;
  }

  /** @inheritDoc */
  public set duration(duration: 'short' | 'medium' | 'long' | 'infinite' | number) {
    untracked(() => this._duration.set(duration));
  }

  /** @inheritDoc */
  public get cssClass(): Signal<string[]> {
    return this._cssClass;
  }

  /** @inheritDoc */
  public set cssClass(cssClass: string | string[]) {
    untracked(() => this._cssClass.set(new Array<string>().concat(this._options.cssClass ?? []).concat(cssClass)));
  }

  /** @inheritDoc */
  public close(): void {
    this.destroy();
  }

  /**
   * Inputs passed to the notification.
   */
  public get inputs(): {[name: string]: unknown} | undefined {
    return this._options.inputs;
  }

  /**
   * Closes the notification on escape keystroke, but only if this is the topmost notification.
   */
  private closeOnEscape(): void {
    const zone = inject(NgZone);
    const document = inject(DOCUMENT);
    const top = inject(WorkbenchNotificationRegistry).top;

    effect(onCleanup => {
      if (top() !== this) {
        return;
      }

      const subscription = fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(
          subscribeIn(fn => zone.runOutsideAngular(fn)),
          filter((event: KeyboardEvent) => event.key === 'Escape'),
          observeIn(fn => zone.run(fn)),
        )
        .subscribe(() => this.close());
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /**
   * Destroys this dialog and associated resources.
   */
  public destroy(): void {
    if (!this.destroyed()) {
      this._injector.destroy();
      this._notificationRegistry.unregister(this.id);
    }
  }
}
