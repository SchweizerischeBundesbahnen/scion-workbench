/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject, Injectable, OnDestroy} from '@angular/core';
import {Message, MessageClient, MessageHeaders} from '@scion/microfrontend-platform';
import {Logger} from '../../logging';
import {ViewId, WorkbenchView} from '../../view/workbench-view.model';
import {WORKBENCH_VIEW_REGISTRY} from '../../view/workbench-view.registry';
import {ɵWorkbenchCommands} from '@scion/workbench-client';
import {Subscription} from 'rxjs';
import {MicrofrontendWorkbenchView} from './microfrontend-workbench-view.model';

/**
 * Handles commands of microfrontends loaded into workbench views, such as setting view tab properties or closing the view.
 *
 * This class is constructed after connected to the SCION Microfrontend Platform via {@link MICROFRONTEND_PLATFORM_POST_STARTUP} DI token.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered via workbench startup hook. */)
export class MicrofrontendViewCommandHandler implements OnDestroy {

  private readonly _messageClient = inject(MessageClient);
  private readonly _viewRegistry = inject(WORKBENCH_VIEW_REGISTRY);
  private readonly _logger = inject(Logger);
  private readonly _subscriptions = new Set<Subscription>();

  constructor() {
    this._subscriptions.add(this.installViewTitleCommandHandler());
    this._subscriptions.add(this.installViewHeadingCommandHandler());
    this._subscriptions.add(this.installViewDirtyCommandHandler());
    this._subscriptions.add(this.installViewClosableCommandHandler());
    this._subscriptions.add(this.installViewCloseCommandHandler());
  }

  /**
   * Handles commands to update the title of a view.
   */
  private installViewTitleCommandHandler(): Subscription {
    return this._messageClient.onMessage<string>(ɵWorkbenchCommands.viewTitleTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId') as ViewId;
      this.runIfPrivileged(viewId, message, view => {
        view.title = message.body!;
      });
    });
  }

  /**
   * Handles commands to update the heading of a view.
   */
  private installViewHeadingCommandHandler(): Subscription {
    return this._messageClient.onMessage<string>(ɵWorkbenchCommands.viewHeadingTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId') as ViewId;
      this.runIfPrivileged(viewId, message, view => {
        view.heading = message.body!;
      });
    });
  }

  /**
   * Handles commands to update the dirty state of a view.
   */
  private installViewDirtyCommandHandler(): Subscription {
    return this._messageClient.onMessage<boolean>(ɵWorkbenchCommands.viewDirtyTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId') as ViewId;
      this.runIfPrivileged(viewId, message, view => {
        view.dirty = message.body!;
      });
    });
  }

  /**
   * Handles commands to update the closable property of a view.
   */
  private installViewClosableCommandHandler(): Subscription {
    return this._messageClient.onMessage<boolean>(ɵWorkbenchCommands.viewClosableTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId') as ViewId;
      this.runIfPrivileged(viewId, message, view => {
        view.closable = message.body!;
      });
    });
  }

  /**
   * Handles commands to close a view.
   */
  private installViewCloseCommandHandler(): Subscription {
    return this._messageClient.onMessage(ɵWorkbenchCommands.viewCloseTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId') as ViewId;
      this.runIfPrivileged(viewId, message, view => {
        void view.close();
      });
    });
  }

  /**
   * Runs the given runnable only if the microfrontend displayed in the view is actually provided by the sender,
   * thus preventing other apps from updating other apps' views.
   */
  private runIfPrivileged(viewId: ViewId, message: Message, runnable: (view: WorkbenchView) => void): void {
    const view = this._viewRegistry.get(viewId);
    const sender = message.headers.get(MessageHeaders.AppSymbolicName) as string;
    if (view.adapt(MicrofrontendWorkbenchView)?.capability.metadata!.appSymbolicName === sender) {
      runnable(view);
    }
    else {
      this._logger.warn('[NotPrivilegedError] Microfrontend not allowed to update views of other apps.');
    }
  }

  public ngOnDestroy(): void {
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
