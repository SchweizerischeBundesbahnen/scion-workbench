/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { ActivityService, MessageBus, Platform, PlatformActivator, ViewService } from '@scion/workbench-application.core';
import { DOCUMENT } from '@angular/common';
import { fromEvent, merge, Subject } from 'rxjs';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { WorkbenchApplicationConfig } from './workbench-application.config';
import { debounceTime, distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { Defined } from './defined.util';

/**
 * This service is created eagerly upon module instantiation.
 */
@Injectable()
export class ActivatorService implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(@Inject(DOCUMENT) private _document: any,
              private _messageBus: MessageBus,
              private _focusTrapFactory: FocusTrapFactory,
              private _zone: NgZone,
              private _config: WorkbenchApplicationConfig) {
  }

  /**
   * Initializes this service upon application startup.
   * @Internal
   */
  public init(): void {
    this._zone.runOutsideAngular(() => {
      this.startPlatform(this._messageBus);

      Defined.orElse(this._config.focus && this._config.focus.trapFocus, true) && this.installFocusTrap();
      Defined.orElse(this._config.focus && this._config.focus.restoreFocusOnActivate, true) && this.installRestoreFocusOnActivate();
    });
  }

  /**
   * Starts this module to communicate with workbench application platform.
   */
  private startPlatform(messageBus: MessageBus): void {
    if (messageBus) {
      PlatformActivator.start(messageBus);
    }
    else {
      PlatformActivator.start();
    }
  }

  /**
   * Creates a focus-trapping region around this application, meaning, that when inside the application,
   * pressing tab or shift+tab should cycle the focus within the application only.
   */
  private installFocusTrap(): void {
    const focusTrap = this._focusTrapFactory.create(this._document.body);
    this._destroy$.pipe(take(1)).subscribe(() => focusTrap.destroy());
  }

  /**
   * Restores the focus to the last focused element (if any) when this application is activated.
   */
  private installRestoreFocusOnActivate(): void {
    const preventFocusRestoreTargets = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A']; // do not restore focus when the user clicks an editable element
    let lastFocusedElement: HTMLElement;

    const restoreFocusFn = (): void => {
      lastFocusedElement && this._zone.run(() => lastFocusedElement.focus());
      lastFocusedElement = null;
    };

    merge(fromEvent<FocusEvent>(this._document, 'focusin'), fromEvent<FocusEvent>(this._document, 'focusout'))
      .pipe(
        debounceTime(15),
        distinctUntilChanged(null, event => event.type),
        filter(event => !!event.target),
        takeUntil(this._destroy$),
      )
      .subscribe((event: FocusEvent) => {
        const target = event.target as HTMLElement;

        if (event.type === 'focusout') {
          lastFocusedElement = target.focus ? target : null;
        }
        else if (event.type === 'focusin') {
          if (preventFocusRestoreTargets.includes(target.tagName) || target.isContentEditable) {
            return;
          }
          restoreFocusFn();
        }
      });

    // Restore focus if the user switches between views or activities
    merge(Platform.getService(ViewService).active$, Platform.getService(ActivityService).active$)
      .pipe(takeUntil(this._destroy$))
      .subscribe(active => active && restoreFocusFn());
  }

  /**
   * Focuses the first focusable element on application load, if configured.
   */
  public autofocusIfConfigured(): void {
    const autofocus = Defined.orElse(this._config.focus && this._config.focus.autofocus, true);
    if (!autofocus) {
      return;
    }

    const focusTrap = this._focusTrapFactory.create(this._document.body);
    focusTrap.focusInitialElementWhenReady().finally(() => focusTrap.destroy());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
