import {computed, DestroyableInjector, DestroyRef, inject, Injector, Signal, signal, untracked, WritableSignal} from '@angular/core';
import {ComponentType} from '@angular/cdk/portal';
import {Arrays} from '@scion/toolkit/util';
import {NotificationId} from '../workbench.identifiers';
import {WorkbenchNotification, WorkbenchNotificationSize} from './workbench-notification.model';
import {WorkbenchNotificationOptions} from './workbench-notification.options';
import {Translatable} from '../text/workbench-text-provider.model';
import {ɵNotification} from './ɵnotification';
import {Notification} from './notification';
import {WorkbenchNotificationRegistry} from './workbench-notification.registry';
import {WORKBENCH_ELEMENT} from '../workbench-element-references';
import {WorkbenchFocusMonitor} from '../focus/workbench-focus-tracker.service';
import {ɵWorkbenchDialog} from '../dialog/ɵworkbench-dialog.model';
import {WorkbenchDialogRegistry} from '../dialog/workbench-dialog.registry';
import {Blockable} from '../glass-pane/blockable';
import {boundingClientRect} from '@scion/components/dimension';
import {WorkbenchNotificationComponent} from './workbench-notification.component';
import {WbComponentPortal} from '../portal/wb-component-portal';

/** @inheritDoc */
export class ɵWorkbenchNotification implements WorkbenchNotification, Blockable {

  /** Injector for the notification; destroyed when the notification is closed. */
  public readonly injector = inject(Injector) as DestroyableInjector;

  public readonly slot: {
    component: ComponentType<unknown> | undefined;
    text: Translatable | undefined;
  };

  private readonly _notificationRegistry = inject(WorkbenchNotificationRegistry);
  private readonly _focusMonitor = inject(WorkbenchFocusMonitor);
  private readonly _title: WritableSignal<Translatable | undefined>;
  private readonly _severity: WritableSignal<'info' | 'warn' | 'error'>;
  private readonly _duration: WritableSignal<'short' | 'medium' | 'long' | 'infinite' | number>;
  private readonly _cssClass: WritableSignal<string[]>;

  public readonly portal: WbComponentPortal<WorkbenchNotificationComponent>;
  public readonly size: WorkbenchNotificationSize = new ɵWorkbenchNotificationSize();
  public readonly focused = computed(() => this._focusMonitor.activeElement()?.id === this.id);
  /** Checks if this notification is the most recently displayed notification. */
  public readonly top = computed(() => this._notificationRegistry.top() === this);
  public readonly destroyed = signal<boolean>(false);
  public readonly bounds: Signal<DOMRect | undefined>;
  public readonly blockedBy: Signal<ɵWorkbenchDialog | null>;
  public readonly group: string | undefined;

  constructor(public id: NotificationId,
              content: Translatable | null | ComponentType<unknown>,
              private _options: WorkbenchNotificationOptions) {
    this.slot = {
      component: typeof content === 'function' ? content : undefined,
      text: typeof content === 'string' ? content : undefined,
    };
    this._title = signal(this._options.title);
    this._severity = signal(this._options.severity ?? 'info');
    this._duration = signal(this._options.duration ?? 'medium');
    this._cssClass = signal(Arrays.coerce(this._options.cssClass));

    this.group = this._options.group;
    this.blockedBy = inject(WorkbenchDialogRegistry).top(this.id);
    this.portal = this.createPortal();
    this.bounds = boundingClientRect(computed(() => this.portal.componentRef()?.instance.bounds()));

    inject(DestroyRef).onDestroy(() => this.destroyed.set(true));
  }

  /**
   * Creates a portal to render {@link WorkbenchNotificationComponent} in the notification's injection context.
   */
  private createPortal(): WbComponentPortal<WorkbenchNotificationComponent> {
    const portal = new WbComponentPortal(WorkbenchNotificationComponent, {
      providers: [
        {provide: ɵWorkbenchNotification, useValue: this},
        {provide: WorkbenchNotification, useExisting: ɵWorkbenchNotification},
        {provide: Notification, useClass: ɵNotification},
        {provide: WORKBENCH_ELEMENT, useExisting: ɵWorkbenchNotification},
        ...this._options.providers ?? [],
      ],
    });

    portal.construct(this._options.injector ?? inject(Injector)); // TODO [eg] Review: is there a better way to pass down the injector?
    return portal;
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
    if (this.blockedBy()) {
      return;
    }

    this.destroy();
  }

  /**
   * Inputs passed to the notification.
   */
  public get inputs(): {[name: string]: unknown} | undefined {
    return this._options.inputs;
  }

  /**
   * Destroys this dialog and associated resources.
   */
  public destroy(): void {
    if (!this.destroyed()) {
      this.injector.destroy();
      this._notificationRegistry.unregister(this.id);
    }
  }
}

/** @inheritDoc */
class ɵWorkbenchNotificationSize implements WorkbenchNotificationSize {

  private readonly _height = signal<string | undefined>(undefined);
  private readonly _minHeight = signal<string | undefined>(undefined);
  private readonly _maxHeight = signal<string | undefined>(undefined);

  /** @inheritDoc */
  public get height(): Signal<string | undefined> {
    return this._height;
  }

  /** @inheritDoc */
  public set height(height: string | undefined) {
    untracked(() => this._height.set(height));
  }

  /** @inheritDoc */
  public get minHeight(): Signal<string | undefined> {
    return this._minHeight;
  }

  /** @inheritDoc */
  public set minHeight(minHeight: string | undefined) {
    untracked(() => this._minHeight.set(minHeight));
  }

  /** @inheritDoc */
  public get maxHeight(): Signal<string | undefined> {
    return this._maxHeight;
  }

  /** @inheritDoc */
  public set maxHeight(maxHeight: string | undefined) {
    untracked(() => this._maxHeight.set(maxHeight));
  }
}
