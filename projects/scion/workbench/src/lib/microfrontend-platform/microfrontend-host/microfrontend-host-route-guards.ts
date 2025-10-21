/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
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
import {DialogId, PartId, PopupId, ViewId} from '../../workbench.identifiers';

export function canMatchMicrofrontendPart(qualifier: Qualifier): CanMatchFn {
  return canMatchMicrofrontend('part', qualifier)
}

function canMatchMicrofrontend(type: 'part' | 'view' | 'dialog' | 'popup', qualifier: Qualifier): CanMatchFn {
  return (): boolean => {
    const outlet = inject(WORKBENCH_OUTLET, {optional: true});

    const match = matchMicrofrontendHostOutlet(outlet);
    if (!match) {
      return false;
    }
    if (match.type !== type) {
      return false;
    }

    if (MicrofrontendPlatform.state !== PlatformState.Started) {
      return false; // match until started the microfrontend platform to avoid flickering.
    }

    const capability = inject(ManifestObjectCache).getCapability(match.capabilityId, {orElse: null});
    if (!capability) {
      return false;
    }
    if (!new QualifierMatcher(capability.qualifier).matches(qualifier)) {
      return false;
    }
    return true;
  };
}

/**
 * Tests if the given outlet matches the format of a microfrontend outlet.
 *
 * A microfrontend host outlet is used as the name for a router outlet rendering a microfrontend provided by the host application.
 */
export function isMicrofrontendHostOutlet(outlet: string | undefined | null): outlet is MicrofrontendHostOutlet {
  return matchMicrofrontendHostOutlet(outlet) !== null;
}

/**
 * Format of a microfrontend host outlet name.
 *
 * A microfrontend host outlet is used as the name for a router outlet rendering a microfrontend provided by the host application.
 *
 * Format: `microfrontend.host.<type>.<elementId>.<capabilityId>`
 * Example: `microfrontend.host.part.5485357a.39768ab`
 */
export type MicrofrontendHostOutlet = `microfrontend.host.${PartId | ViewId | DialogId | PopupId}.${string}`;

/**
 * Regular expression to match a microfrontend host outlet.
 */
const MICROFRONTEND_HOST_OUTLET_REGEX = /^microfrontend\.host\.(?<type>[^.]+)\.(?<id>[^.]+)\.(?<capabilityId>[^.]+)$/;

/**
 * Matches a given outlet to be a microfrontend host outlet. Returns the parsed outlet or `null` if it does not match.
 */
function matchMicrofrontendHostOutlet(outlet: string | undefined | null): MicrofrontendHostOutletMatch | null {
  if (!outlet) {
    return null;
  }

  const match = outlet.match(MICROFRONTEND_HOST_OUTLET_REGEX);
  if (!match) {
    return null;
  }

  return {
    type: match.groups!['type'] as 'part' | 'view' | 'dialog' | 'popup',
    id: match.groups!['id'] as PartId | ViewId | DialogId | PopupId,
    capabilityId: match.groups!['capabilityId'] as string,
  }
}

/**
 * Represents a successful match of a microfrontend host outlet.
 */
interface MicrofrontendHostOutletMatch {
  /**
   * Type of the workbench element displaying the microfrontend.
   */
  type: 'part' | 'view' | 'dialog' | 'popup';
  /**
   * Identity of the workbench element displaying the microfrontend.
   */
  id: PartId | ViewId | DialogId | PopupId;
  /**
   * Identity of the capability providing the microfrontend.
   *
   * @see WorkbenchPartCapability
   * @see WorkbenchViewCapability
   * @see WorkbenchDialogCapability
   * @see WorkbenchPopupCapability
   */
  capabilityId: string;
}
