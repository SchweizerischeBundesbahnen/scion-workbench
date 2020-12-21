/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ManifestService, Message, MessageClient, MessageHeaders, TopicMessage } from '@scion/microfrontend-platform';
import { Logger } from '../../logging';
import { WorkbenchView } from '../../view/workbench-view.model';
import { WorkbenchViewRegistry } from '../../view/workbench-view.registry';
import { map, mapTo, switchMap, takeUntil } from 'rxjs/operators';
import { ViewCapability, WorkbenchCapabilities, ɵWorkbenchCommands } from '@scion/workbench-client';
import { merge, Subject } from 'rxjs';
import { SafeRunner } from '../../safe-runner';
import { MicrofrontendViewRoutes } from '../routing/microfrontend-routes';

/**
 * Handles commands of microfrontends loaded into workbench views, such as setting view tab properties or closing the view.
 *
 * This class is constructed eagerly before the Microfrontend Platform activates registered micro apps. See {@link MICROFRONTEND_PLATFORM_PRE_ACTIVATION}.
 */
@Injectable()
export class MicrofrontendCommandHandler implements OnDestroy {

  private _destroy$ = new Subject<void>();
  private _viewCapabilities = new Map<string, ViewCapability>();

  constructor(private _messageClient: MessageClient,
              private _viewRegistry: WorkbenchViewRegistry,
              private _manifestService: ManifestService,
              private _safeRunner: SafeRunner,
              private _logger: Logger) {
    this.installViewCapabilityObserver();
    this.installViewActiveStatePublisher();

    this.installViewTitleCommandHandler();
    this.installViewHeadingCommandHandler();
    this.installViewDirtyCommandHandler();
    this.installViewClosableCommandHandler();
    this.installViewCloseCommandHandler();
  }

  /**
   * Notifies microfrontends about the active state of the embedding view.
   */
  private installViewActiveStatePublisher(): void {
    this._viewRegistry.viewIds$
      .pipe(
        map(viewIds => viewIds.map(viewId => this._viewRegistry.getElseThrow(viewId))),
        switchMap(views => merge(...views.map(view => view.active$.pipe(mapTo(view))))),
        takeUntil(this._destroy$),
      )
      .subscribe((view: WorkbenchView) => {
        const commandTopic = ɵWorkbenchCommands.viewActiveTopic(view.viewId);
        this._messageClient.publish(commandTopic, view.active, {retain: true}).then();
      });
  }

  /**
   * Handles commands to update the title of a view.
   */
  private installViewTitleCommandHandler(): void {
    this._messageClient.observe$(ɵWorkbenchCommands.viewTitleTopic(':viewId'))
      .pipe(takeUntil(this._destroy$))
      .subscribe((message: TopicMessage<string>) => this._safeRunner.run(() => {
        const viewId = message.params.get('viewId');
        this.runIfPrivileged(viewId, message, view => {
          view.title = message.body;
        });
      }));
  }

  /**
   * Handles commands to update the heading of a view.
   */
  private installViewHeadingCommandHandler(): void {
    this._messageClient.observe$(ɵWorkbenchCommands.viewHeadingTopic(':viewId'))
      .pipe(takeUntil(this._destroy$))
      .subscribe((message: TopicMessage<string>) => this._safeRunner.run(() => {
        const viewId = message.params.get('viewId');
        this.runIfPrivileged(viewId, message, view => {
          view.heading = message.body;
        });
      }));
  }

  /**
   * Handles commands to update the dirty state of a view.
   */
  private installViewDirtyCommandHandler(): void {
    this._messageClient.observe$(ɵWorkbenchCommands.viewDirtyTopic(':viewId'))
      .pipe(takeUntil(this._destroy$))
      .subscribe((message: TopicMessage<boolean>) => this._safeRunner.run(() => {
        const viewId = message.params.get('viewId');
        this.runIfPrivileged(viewId, message, view => {
          view.dirty = message.body;
        });
      }));
  }

  /**
   * Handles commands to update the closable property of a view.
   */
  private installViewClosableCommandHandler(): void {
    this._messageClient.observe$(ɵWorkbenchCommands.viewClosableTopic(':viewId'))
      .pipe(takeUntil(this._destroy$))
      .subscribe((message: TopicMessage<boolean>) => this._safeRunner.run(() => {
        const viewId = message.params.get('viewId');
        this.runIfPrivileged(viewId, message, view => {
          view.closable = message.body;
        });
      }));
  }

  /**
   * Handles commands to close a view.
   */
  private installViewCloseCommandHandler(): void {
    this._messageClient.observe$(ɵWorkbenchCommands.viewCloseTopic(':viewId'))
      .pipe(takeUntil(this._destroy$))
      .subscribe((message: TopicMessage<boolean>) => this._safeRunner.run(() => {
        const viewId = message.params.get('viewId');
        this.runIfPrivileged(viewId, message, view => {
          view.close().then();
        });
      }));
  }

  private installViewCapabilityObserver(): void {
    this._manifestService.lookupCapabilities$<ViewCapability>({type: WorkbenchCapabilities.View})
      .pipe(takeUntil(this._destroy$))
      .subscribe(viewCapabilities => {
        this._viewCapabilities = viewCapabilities.reduce((acc, capability) => acc.set(capability.metadata.id, capability), new Map<string, ViewCapability>());
      });
  }

  /**
   * Runs the given runnable only if the microfrontend displayed in the view is actually provided by the sender,
   * thus preventing other apps from updating other apps' views.
   */
  private runIfPrivileged(viewId: string, message: Message, runnable: (view: WorkbenchView) => void): void {
    const view = this._viewRegistry.getElseThrow(viewId);
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
    const viewCapabilityId = MicrofrontendViewRoutes.extractCapabilityId(view.urlSegments);
    const viewCapability = this._viewCapabilities.get(viewCapabilityId);
    if (!viewCapability) {
      this._logger.error(`Unexpected Error: [NullCapabilityError] No view capability for '${viewCapabilityId}' found.`);
      return false;
    }

    return viewCapability.metadata.appSymbolicName === sender;
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}
