/*
 * Copyright (c) 2018-2026 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {CanMatchFn} from '@angular/router';
import {inject} from '@angular/core';
import {MicrofrontendPlatform, PlatformState, Qualifier, QualifierMatcher} from '@scion/microfrontend-platform';
import {WORKBENCH_OUTLET} from '../../routing/workbench-auxiliary-route-installer.service';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {DialogId, NotificationId, PartId, PopupId, ViewId} from '../../workbench.identifiers';
import {WorkbenchCapabilities} from '@scion/workbench-client';

/**
 * Configures a route to only match workbench parts navigated to the specified part capability.
 *
 * Use this guard to differentiate microfrontend routes, which must all have an empty path.
 *
 * @example - Route matching a part capability with qualifier {part: 'navigator'}
 * ```ts
 * import {Routes} from '@angular/router';
 * import {canMatchWorkbenchPartCapability} from '@scion/workbench';
 *
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchPartCapability({part: 'navigator'})], component: NavigatorComponent},
 * ];
 * ```
 *
 * The above route matches the following part capability:
 *
 * ```json
 * {
 *   "type": "part",
 *   "qualifier": {
 *     "part": "navigator"
 *   },
 *   "properties": {
 *     "path": ""
 *   }
 * }
 * ```
 *
 * @param qualifier - Identifies the part capability.
 * @return guard matching the specified part capability.
 */
export function canMatchWorkbenchPartCapability(qualifier: Qualifier): CanMatchFn {
  return canMatchWorkbenchCapability('part', WorkbenchCapabilities.Part, qualifier);
}

/**
 * Configures a route to only match workbench views navigated to the specified view capability.
 *
 * Use this guard to differentiate microfrontend routes, which must all have an empty path.
 *
 * @example - Route matching a view capability with qualifier {view: 'search'}
 * ```ts
 * import {Routes} from '@angular/router';
 * import {canMatchWorkbenchViewCapability} from '@scion/workbench';
 *
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchViewCapability({view: 'search'})], component: SearchComponent},
 * ];
 * ```
 *
 * The above route matches the following view capability:
 *
 * ```json
 * {
 *   "type": "view",
 *   "qualifier": {
 *     "view": "search"
 *   },
 *   "properties": {
 *     "path": ""
 *   }
 * }
 * ```
 *
 * @param qualifier - Identifies the view capability.
 * @return guard matching the specified view capability.
 */
export function canMatchWorkbenchViewCapability(qualifier: Qualifier): CanMatchFn {
  return canMatchWorkbenchCapability('view', WorkbenchCapabilities.View, qualifier);
}

/**
 * Configures a route to only match workbench dialogs navigated to the specified dialog capability.
 *
 * Use this guard to differentiate microfrontend routes, which must all have an empty path.
 *
 * @example - Route matching a dialog capability with qualifier {dialog: 'about'}
 * ```ts
 * import {Routes} from '@angular/router';
 * import {canMatchWorkbenchDialogCapability} from '@scion/workbench';
 *
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchDialogCapability({dialog: 'about'})], component: AboutComponent},
 * ];
 * ```
 *
 * The above route matches the following dialog capability:
 *
 * ```json
 * {
 *   "type": "dialog",
 *   "qualifier": {
 *     "dialog": "about"
 *   },
 *   "properties": {
 *     "path": ""
 *   }
 * }
 * ```
 *
 * @param qualifier - Identifies the dialog capability.
 * @return guard matching the specified dialog capability.
 */
export function canMatchWorkbenchDialogCapability(qualifier: Qualifier): CanMatchFn {
  return canMatchWorkbenchCapability('dialog', WorkbenchCapabilities.Dialog, qualifier);
}

/**
 * Configures a route to only match workbench messageboxes navigated to the specified messagebox capability.
 *
 * Use this guard to differentiate microfrontend routes, which must all have an empty path.
 *
 * @example - Route matching a messagebox capability with qualifier {messagebox: 'alert'}
 * ```ts
 * import {Routes} from '@angular/router';
 * import {canMatchWorkbenchMessageBoxCapability} from '@scion/workbench';
 *
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchMessageBoxCapability({messagebox: 'alert'})], component: AlertComponent},
 * ];
 * ```
 *
 * The above route matches the following messagebox capability:
 *
 * ```json
 * {
 *   "type": "messagebox",
 *   "qualifier": {
 *     "messagebox": "alert"
 *   },
 *   "properties": {
 *     "path": ""
 *   }
 * }
 * ```
 *
 * @param qualifier - Identifies the messagebox capability.
 * @return guard matching the specified messagebox capability.
 */
export function canMatchWorkbenchMessageBoxCapability(qualifier: Qualifier): CanMatchFn {
  return canMatchWorkbenchCapability('dialog', WorkbenchCapabilities.MessageBox, qualifier);
}

/**
 * Configures a route to only match workbench popups navigated to the specified popup capability.
 *
 * Use this guard to differentiate microfrontend routes, which must all have an empty path.
 *
 * @example - Route matching a popup capability with qualifier {popup: 'info'}
 * ```ts
 * import {Routes} from '@angular/router';
 * import {canMatchWorkbenchPopupCapability} from '@scion/workbench';
 *
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchPopupCapability({popup: 'info'})], component: InfoComponent},
 * ];
 * ```
 *
 * The above route matches the following popup capability:
 *
 * ```json
 * {
 *   "type": "popup",
 *   "qualifier": {
 *     "popup": "info"
 *   },
 *   "properties": {
 *     "path": ""
 *   }
 * }
 * ```
 *
 * @param qualifier - Identifies the popup capability.
 * @return guard matching the specified popup capability.
 */
export function canMatchWorkbenchPopupCapability(qualifier: Qualifier): CanMatchFn {
  return canMatchWorkbenchCapability('popup', WorkbenchCapabilities.Popup, qualifier);
}

/**
 * Configures a route to only match workbench notifications navigated to the specified notification capability.
 *
 * Use this guard to differentiate microfrontend routes, which must all have an empty path.
 *
 * @example - Route matching a notification capability with qualifier {notification: 'info'}
 * ```ts
 * import {Routes} from '@angular/router';
 * import {canMatchWorkbenchNotificationCapability} from '@scion/workbench';
 *
 * const routes: Routes = [
 *   {path: '', canMatch: [canMatchWorkbenchNotificationCapability({notification: 'info'})], component: InfoComponent},
 * ];
 * ```
 *
 * The above route matches the following notification capability:
 *
 * ```json
 * {
 *   "type": "notification",
 *   "qualifier": {
 *     "notification": "info"
 *   },
 *   "properties": {
 *     "path": ""
 *   }
 * }
 * ```
 *
 * @param qualifier - Identifies the notification capability.
 * @return guard matching the specified notification capability.
 */
export function canMatchWorkbenchNotificationCapability(qualifier: Qualifier): CanMatchFn {
  return canMatchWorkbenchCapability('notification', WorkbenchCapabilities.Notification, qualifier);
}

/**
 * Matches a route if navigated to the specified capability displayed in the specified workbench element.
 */
function canMatchWorkbenchCapability(workbenchElementType: 'part' | 'view' | 'dialog' | 'popup' | 'notification', capabilityType: WorkbenchCapabilities, qualifier: Qualifier): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});

    const hostOutletMatch = matchMicrofrontendHostOutlet(outlet);
    if (!hostOutletMatch) {
      return false;
    }
    if (hostOutletMatch.type !== workbenchElementType) {
      return false;
    }

    // Guards cannot block waiting for platform startup, as the platform may start later in the bootstrapping, causing a deadlock.
    // Guards are re-evaluated after startup. See `runCanMatchGuardsAfterStartup`.
    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return false;
    }

    const capability = inject(ManifestObjectCache).capability(hostOutletMatch.capabilityId)();
    if (!capability) {
      return false;
    }
    if (capability.type !== capabilityType) {
      return false; // required because messagebox capabilities are embedded in a dialog outlet.
    }
    if (!new QualifierMatcher(capability.qualifier).matches(qualifier)) {
      return false;
    }
    return true;
  };
}

/**
 * Tests if the given outlet matches the format of a microfrontend host outlet.
 *
 * Microfrontend host outlets are used to render microfrontends provided by the host application.
 */
export function isMicrofrontendHostOutlet(outlet: string | undefined | null): outlet is MicrofrontendHostOutlet {
  return matchMicrofrontendHostOutlet(outlet) !== null;
}

/**
 * Matches a given outlet to be a microfrontend host outlet. Returns the parsed outlet or `null` if it does not match.
 */
function matchMicrofrontendHostOutlet(outlet: string | undefined | null): MicrofrontendHostOutletMatch | null {
  if (!outlet) {
    return null;
  }

  const match = MICROFRONTEND_HOST_OUTLET_REGEX.exec(outlet);
  if (!match) {
    return null;
  }

  return {
    type: match.groups!['workbenchElementType']! as 'part' | 'view' | 'dialog' | 'popup' | 'notification',
    capabilityId: match.groups!['capabilityId']!,
  };
}

/**
 * Format of a microfrontend capability id.
 */
type MicrofrontendCapabilityId = string;

/**
 * Format of a microfrontend host outlet name.
 *
 * Microfrontend host outlets are used to render microfrontends provided by the host application.
 *
 * Format: `workbench.microfrontend.host.<capabilityId>.<workbenchElementType>.<workbenchElementId>`
 * Example: `workbench.microfrontend.host.39768ab.part.5485357a`
 */
export type MicrofrontendHostOutlet = `workbench.microfrontend.host.${MicrofrontendCapabilityId}.${PartId | ViewId | DialogId | PopupId | NotificationId}`;

/**
 * Regular expression to match a microfrontend host outlet.
 */
const MICROFRONTEND_HOST_OUTLET_REGEX = /^workbench\.microfrontend\.host\.(?<capabilityId>[^.]+)\.(?<workbenchElementType>[^.]+)\.(?<workbenchElementId>.+)$/;

/**
 * Represents a successful match of a microfrontend host outlet.
 */
interface MicrofrontendHostOutletMatch {
  /**
   * Type of the workbench element displaying the microfrontend.
   */
  type: 'part' | 'view' | 'dialog' | 'popup' | 'notification';
  /**
   * Identity of the capability providing the microfrontend.
   *
   * @see WorkbenchPartCapability
   * @see WorkbenchViewCapability
   * @see WorkbenchDialogCapability
   * @see WorkbenchMessageBoxCapability
   * @see WorkbenchPopupCapability
   * @see WorkbenchNotificationCapability
   */
  capabilityId: string;
}
