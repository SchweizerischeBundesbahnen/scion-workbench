/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Injectable, OnDestroy} from '@angular/core';
import {ManifestService, Message, MessageClient, MessageHeaders} from '@scion/microfrontend-platform';
import {Logger} from '../../logging';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {WorkbenchCapabilities, WorkbenchViewCapability, ɵWorkbenchCommands} from '@scion/workbench-client';
import {merge, Subject, Subscription} from 'rxjs';
import {MicrofrontendViewRoutes} from '../routing/microfrontend-routes';

/**
 * Handles commands of microfrontends loaded into workbench views, such as setting view tab properties or closing the view.
 *
 * This class is constructed after connected to the SCION Microfrontend Platform via {@link MICROFRONTEND_PLATFORM_POST_STARTUP} DI token.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered via workbench startup hook. */)
export class MicrofrontendViewCommandHandler implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewCapabilities = new Map<string, WorkbenchViewCapability>();
  private _subscriptions = new Set<Subscription>();

  constructor(private _messageClient: MessageClient,
              private _viewRegistry: WorkbenchViewRegistry,
              private _manifestService: ManifestService,
              private _logger: Logger) {
    this.installViewCapabilityObserver();
    this.installViewActiveStatePublisher();

    this._subscriptions.add(this.installViewTitleCommandHandler());
    this._subscriptions.add(this.installViewHeadingCommandHandler());
    this._subscriptions.add(this.installViewDirtyCommandHandler());
    this._subscriptions.add(this.installViewClosableCommandHandler());
    this._subscriptions.add(this.installViewCloseCommandHandler());
  }

  /**
   * Notifies microfrontends about the active state of the embedding view.
   */
  private installViewActiveStatePublisher(): void {
    this._viewRegistry.views$
      .pipe(
        switchMap(views => merge(...views.map(view => view.active$.pipe(map(() => view))))),
        takeUntil(this._destroy$),
      )
      .subscribe((view: WorkbenchView) => {
        const commandTopic = ɵWorkbenchCommands.viewActiveTopic(view.id);
        this._messageClient.publish(commandTopic, view.active, {retain: true});
      });
  }

  /**
   * Handles commands to update the title of a view.
   */
  private installViewTitleCommandHandler(): Subscription {
    return this._messageClient.onMessage(ɵWorkbenchCommands.viewTitleTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId')!;
      this.runIfPrivileged(viewId, message, view => {
        view.title = message.body;
      });
    });
  }

  /**
   * Handles commands to update the heading of a view.
   */
  private installViewHeadingCommandHandler(): Subscription {
    return this._messageClient.onMessage(ɵWorkbenchCommands.viewHeadingTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId')!;
      this.runIfPrivileged(viewId, message, view => {
        view.heading = message.body;
      });
    });
  }

  /**
   * Handles commands to update the dirty state of a view.
   */
  private installViewDirtyCommandHandler(): Subscription {
    return this._messageClient.onMessage(ɵWorkbenchCommands.viewDirtyTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId')!;
      this.runIfPrivileged(viewId, message, view => {
        view.dirty = message.body;
      });
    });
  }

  /**
   * Handles commands to update the closable property of a view.
   */
  private installViewClosableCommandHandler(): Subscription {
    return this._messageClient.onMessage(ɵWorkbenchCommands.viewClosableTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId')!;
      this.runIfPrivileged(viewId, message, view => {
        view.closable = message.body;
      });
    });
  }

  /**
   * Handles commands to close a view.
   */
  private installViewCloseCommandHandler(): Subscription {
    return this._messageClient.onMessage(ɵWorkbenchCommands.viewCloseTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId')!;
      this.runIfPrivileged(viewId, message, view => {
        view.close().then();
      });
    });
  }

  private installViewCapabilityObserver(): void {
    this._manifestService.lookupCapabilities$<WorkbenchViewCapability>({type: WorkbenchCapabilities.View})
      .pipe(takeUntil(this._destroy$))
      .subscribe(viewCapabilities => {
        this._viewCapabilities = viewCapabilities.reduce((acc, capability) => acc.set(capability.metadata!.id, capability), new Map<string, WorkbenchViewCapability>());
      });
  }

  /**
   * Runs the given runnable only if the microfrontend displayed in the view is actually provided by the sender,
   * thus preventing other apps from updating other apps' views.
   */
  private runIfPrivileged(viewId: string, message: Message, runnable: (view: WorkbenchView) => void): void {
    const view = this._viewRegistry.get(viewId);
    const sender = message.headers.get(MessageHeaders.AppSymbolicName);
    if (this.isMicrofrontendProvider(sender, view)) {
      runnable(view);
    }
    else {
      this._logger.warn('[NotPrivilegedError] Microfrontend not allowed to update views of other apps.');
    }
  }

  /**
   * Tests whether the sender provides the microfrontend displayed in the view.
   */
  private isMicrofrontendProvider(sender: string, view: WorkbenchView): boolean {
    const viewCapabilityId = MicrofrontendViewRoutes.parseParams(view.urlSegments).viewCapabilityId;
    const viewCapability = this._viewCapabilities.get(viewCapabilityId);
    if (!viewCapability) {
      this._logger.error(`Unexpected Error: [NullCapabilityError] No view capability for '${viewCapabilityId}' found.`);
      return false;
    }

    return viewCapability.metadata!.appSymbolicName === sender;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
