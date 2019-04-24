/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { DefaultMessageBus, MessageBus } from './message-bus.service';
import { ViewService } from './view.service';
import { MessageBoxService } from './message-box.service';
import { NotificationService } from './notification.service';
import { ActivityService } from './activity.service';
import { ManifestRegistryService } from './manifest-registry.service';
import { RouterService } from './router.service';
import { Platform } from './platform';
import { PopupService } from './popup.service';
import { PlatformEventBus } from './platform-event-bus.service';
import { IntentService } from './intent.service';

/**
 * Manages the lifecycle of this workbench application module to communicate with the workbench application platform.
 */
export class PlatformActivator {

  /**
   * Starts this module to communicate with workbench application platform.
   *
   * Optionally, you can provide a custom {MessageBus} implementation used for communication with workbench application platform.
   * Default message bus communication is based on `postMessage` and `onmessage` to safely communicate cross-origin with the window parent.
   */
  public static start(messageBus: MessageBus = new DefaultMessageBus()): void {
    Platform.register(messageBus, MessageBus);
    Platform.register(new PlatformEventBus());
    Platform.register(new RouterService());
    Platform.register(new ActivityService());
    Platform.register(new ViewService());
    Platform.register(new MessageBoxService());
    Platform.register(new NotificationService());
    Platform.register(new PopupService());
    Platform.register(new ManifestRegistryService());
    Platform.register(new IntentService());

    window.addEventListener('beforeunload', () => this.stop(), {once: true});
  }

  /**
   * Stops this module and releases resources allocated.
   */
  public static stop(): void {
    Platform.destroy();
  }
}
