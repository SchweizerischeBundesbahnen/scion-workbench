/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { mapToBody, MessageClient, MessageHeaders, ResponseStatusCodes } from '@scion/microfrontend-platform';
import { ɵPopupContext, ɵWorkbenchCommands, ɵWorkbenchPopupCommand } from '@scion/workbench-client';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Logger, LoggerNames } from '../../logging';
import { SafeRunner } from '../../safe-runner';
import { MicrofrontendPopupComponent } from './microfrontend-popup.component';
import { WorkbenchViewRegistry } from '../../view/workbench-view.registry';
import { fromDimension$ } from '@scion/toolkit/observable';
import { PopupOrigin } from '../../popup/popup.config';
import { observeInside, subscribeInside } from '@scion/toolkit/operators';
import { PopupService } from '../../popup/popup.service';

/**
 * Handles microfrontend popup commands, instructing the Workbench {@link PopupService} to navigate to the microfrontend of a given popup capability.
 *
 * This class is constructed before the Microfrontend Platform activates micro applications via {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION} DI token.
 */
@Injectable()
export class MicrofrontendPopupCommandHandler implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(private _messageClient: MessageClient,
              private _popupService: PopupService,
              private _logger: Logger,
              private _viewRegistry: WorkbenchViewRegistry,
              safeRunner: SafeRunner,
              private _zone: NgZone) {
    this._messageClient.observe$<ɵWorkbenchPopupCommand>(ɵWorkbenchCommands.popup)
      .pipe(takeUntil(this._destroy$))
      .subscribe(popupCommand => safeRunner.run(async () => {
        this._logger.debug(() => 'Handling microfrontend popup command', LoggerNames.MICROFRONTEND, popupCommand);
        const replyTo = popupCommand.headers.get(MessageHeaders.ReplyTo);
        try {
          const result = await this.onPopupCommand(popupCommand.body);
          await this._messageClient.publish(replyTo, result, {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.OK)});
        }
        catch (error) {
          await this._messageClient.publish(replyTo, readErrorMessage(error), {headers: new Map().set(MessageHeaders.Status, ResponseStatusCodes.ERROR)});
        }
      }));
  }

  private async onPopupCommand(command: ɵWorkbenchPopupCommand): Promise<any> {
    const popupCapability = command.capability;
    const popupContext: ɵPopupContext = {
      popupId: command.popupId,
      capability: popupCapability,
      params: coerceMap(command.params),
      closeOnFocusLost: command.closeStrategy?.onFocusLost ?? true,
    };

    return this._popupService.open({
      component: MicrofrontendPopupComponent,
      input: popupContext,
      anchor: this.observePopupOrigin$(command),
      viewRef: command.viewId,
      align: command.align,
      size: popupCapability.properties?.size,
      closeStrategy: {
        ...command.closeStrategy,
        onFocusLost: false, // Closing the popup on focus loss is handled in {MicrofrontendPopupComponent}
      },
      cssClass: popupCapability.properties?.cssClass,
    });
  }

  private observePopupOrigin$(command: ɵWorkbenchPopupCommand): Observable<PopupOrigin> {
    return combineLatest([
      command.viewId ? this.observeViewBoundingBox$(command.viewId) : of(undefined),
      this.observeMicrofrontendPopupOrigin$(command.popupId),
    ])
      .pipe(
        filter(([viewBoundingBox, popupOrigin]) => {
          // Swallow emissions until both sources report a non-empty dimension. For example, when deactivating
          // the popup's contextual view, the view reports an empty bounding box, causing the popup to flicker
          // when activating it again.
          return !isNullClientRect(viewBoundingBox) && !isNullClientRect(popupOrigin);
        }),
        map(([viewBoundingBox, popupOrigin]: [ClientRect | undefined, ClientRect]) => {
          return {
            x: (viewBoundingBox?.left ?? 0) + popupOrigin.left,
            y: (viewBoundingBox?.top ?? 0) + popupOrigin.top,
            width: popupOrigin.width,
            height: popupOrigin.height,
          };
        }),
        subscribeInside(continueFn => this._zone.runOutsideAngular(continueFn)),
        observeInside(continueFn => this._zone.run(continueFn)),
      );
  }

  private observeViewBoundingBox$(viewId: string): Observable<ClientRect> {
    const view = this._viewRegistry.getElseThrow(viewId);
    return fromDimension$(view.portal.componentRef.location.nativeElement)
      .pipe(map(dimension => dimension.element.getBoundingClientRect()));
  }

  private observeMicrofrontendPopupOrigin$(popupId: string): Observable<ClientRect> {
    return this._messageClient.observe$<ClientRect>(ɵWorkbenchCommands.popupOriginTopic(popupId))
      .pipe(mapToBody());
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Returns the error message if given an error object, or the `toString` representation otherwise.
 */
function readErrorMessage(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  return error?.toString();
}

/**
 * Coerces the given Map-like object to a `Map`.
 *
 * Data sent from one JavaScript realm to another is serialized with the structured clone algorithm.
 * Altought the algorithm supports the `Map` data type, a deserialized map object cannot be checked to be instance of `Map`.
 * This is most likely because the serialization takes place in a different realm.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
 * @see http://man.hubwiz.com/docset/JavaScript.docset/Contents/Resources/Documents/developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm.html
 *
 * @ignore
 */
function coerceMap<K, V>(mapLike: Map<K, V>): Map<K, V> {
  return new Map(mapLike);
}

function isNullClientRect(clientRect: ClientRect): boolean {
  return clientRect.top === 0 && clientRect.right === 0 && clientRect.bottom === 0 && clientRect.left === 0;
}
