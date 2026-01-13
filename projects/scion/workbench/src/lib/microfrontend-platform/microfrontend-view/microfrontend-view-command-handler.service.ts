/*
 * Copyright (c) 2018-2022 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders, OnDestroy} from '@angular/core';
import {Message, MessageClient, MessageHeaders} from '@scion/microfrontend-platform';
import {Logger} from '../../logging';
import {ViewId} from '../../workbench.identifiers';
import {WorkbenchView} from '../../view/workbench-view.model';
import {WorkbenchViewRegistry} from '../../view/workbench-view.registry';
import {Translatable, ɵWorkbenchCommands} from '@scion/workbench-client';
import {Subscription} from 'rxjs';
import {provideMicrofrontendPlatformInitializer} from '../microfrontend-platform-initializer';
import {createRemoteTranslatable} from '../microfrontend-text/remote-text-provider';
import {MICROFRONTEND_VIEW_NAVIGATION_HINT} from './microfrontend-view-routes';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {MicrofrontendViewNavigationData} from './microfrontend-view-navigation-data';
import {throwError} from '../../common/throw-error.util';

@Injectable(/* DO NOT provide via 'providedIn' metadata as only registered if microfrontend support is enabled. */)
class MicrofrontendViewCommandHandler implements OnDestroy {

  private readonly _messageClient = inject(MessageClient);
  private readonly _viewRegistry = inject(WorkbenchViewRegistry);
  private readonly _manifestObjectCache = inject(ManifestObjectCache);
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
    return this._messageClient.onMessage<Translatable>(ɵWorkbenchCommands.viewTitleTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId') as ViewId;
      this.runIfPrivileged(viewId, message, view => {
        const referrer = message.headers.get(MessageHeaders.AppSymbolicName) as string;
        view.title = createRemoteTranslatable(message.body, {appSymbolicName: referrer}) ?? null;
      });
    });
  }

  /**
   * Handles commands to update the heading of a view.
   */
  private installViewHeadingCommandHandler(): Subscription {
    return this._messageClient.onMessage<Translatable>(ɵWorkbenchCommands.viewHeadingTopic(':viewId'), message => {
      const viewId = message.params!.get('viewId') as ViewId;
      this.runIfPrivileged(viewId, message, view => {
        const referrer = message.headers.get(MessageHeaders.AppSymbolicName) as string;
        view.heading = createRemoteTranslatable(message.body, {appSymbolicName: referrer}) ?? null;
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
    const sender = message.headers.get(MessageHeaders.AppSymbolicName) as string;
    const view = this._viewRegistry.get(viewId);

    // Test if a microfrontend view.
    if (view.navigation()?.hint !== MICROFRONTEND_VIEW_NAVIGATION_HINT) {
      return;
    }

    // Test if provided by the requesting application.
    const {capabilityId} = view.navigation()!.data as unknown as MicrofrontendViewNavigationData;
    const capability = this._manifestObjectCache.capability(capabilityId)() ?? throwError(`[NullCapabilityError] No capability found with id '${capabilityId}'.`);
    if (capability.metadata!.appSymbolicName === sender) {
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

/**
 * Provides a set of DI providers registering message handlers for view microfrontends to interact with a workbench view.
 */
export function provideViewCommandHandlers(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MicrofrontendViewCommandHandler,
    provideMicrofrontendPlatformInitializer(() => void inject(MicrofrontendViewCommandHandler)),
  ]);
}
