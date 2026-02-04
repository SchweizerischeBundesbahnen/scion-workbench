import {effect, inject, untracked} from '@angular/core';
import {Dictionaries} from '@scion/toolkit/util';
import {WorkbenchPart} from '../../part/workbench-part.model';
import {MessageClient} from '@scion/microfrontend-platform';
import {ManifestObjectCache} from '../manifest-object-cache.service';
import {MICROFRONTEND_PART_NAVIGATION_HINT} from './microfrontend-part-routes';
import {MicrofrontendPartNavigationData} from './microfrontend-part-navigation-data';
import {WorkbenchPartCapability} from '@scion/workbench-client';

/**
 * Sends a request to the "badge" topic of the part capability to resolve a part badge.
 *
 * Topic segments can reference capability parameters using the colon syntax.
 */
export function provideMicrofrontendPartBadge(): void {
  const part = inject(WorkbenchPart);
  const messageClient = inject(MessageClient);
  const manifestObjectCache = inject(ManifestObjectCache);

  effect(onCleanup => {
    const navigation = part.navigation();

    untracked(() => {
      if (navigation?.hint !== MICROFRONTEND_PART_NAVIGATION_HINT) {
        return;
      }

      const {capabilityId, params} = navigation.data as unknown as MicrofrontendPartNavigationData;
      const capability = manifestObjectCache.capability<WorkbenchPartCapability>(capabilityId)();
      if (!capability) {
        return;
      }

      const badge = capability.properties!.extras?.badge;

      if (!badge) {
        return;
      }

      const topic = createBadgeTopic(badge, {params});
      const subscription = messageClient.request$<number | boolean | undefined>(topic, undefined, {retain: true}).subscribe(msg => part.badge.set(msg.body));

      onCleanup(() => subscription.unsubscribe());
    });
  });
}

function createBadgeTopic(badge: string, config: {params: {[name: string]: unknown}}): string {
  // Create Map of params.
  const params = new Map(Object.entries(Dictionaries.coerce(config.params)).map(([param, value]) => [param, `${value}`]));

  // Return badge topic as-is if not referencing parameters.
  if (!containsParam(badge, params)) {
    return badge;
  }

  // Substitute named parameters.
  return badge.replace(/(?<=\/|^):(?<namedParam>[^/]+)/g, (match: string, param: string) => params.get(param) ?? match);

  /**
   * Tests whether the passed text references any of the passed params.
   */
  function containsParam(text: string, params: Map<string, unknown>): boolean {
    return Array.from(params.keys()).some(param => text.includes(`:${param}`));
  }
}
