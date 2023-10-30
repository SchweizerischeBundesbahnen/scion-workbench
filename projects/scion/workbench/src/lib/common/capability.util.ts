import {Capability, Qualifier} from '@scion/microfrontend-platform';
import {Crypto} from '@scion/toolkit/crypto';

/**
 * Creates a stable identifier for given capability.
 */
export async function createStableIdentifier(capability: Capability): Promise<string> {
  const qualifier = capability.qualifier!;
  const vendor = capability.metadata!.appSymbolicName;

  // Create identifier consisting of vendor and sorted qualifier entries.
  const identifier = Object.keys(qualifier)
    .sort()
    .reduce(
      (acc, qualifierKey) => acc.concat(qualifierKey).concat(`${qualifier[qualifierKey]}`),
      [vendor],
    )
    .join(';');

  // Hash the identifier.
  const identifierHash = await Crypto.digest(identifier);
  // Use the first 7 digits of the hash.
  return identifierHash.substring(0, 7);
}

/**
 * Creates a stable identifier for given capability.
 */
export function hashQualifier(qualifier: Qualifier): Promise<string> {
  const identifier = Object.keys(qualifier)
    .sort()
    .reduce(
      (acc, qualifierKey) => acc.concat(qualifierKey).concat(`${qualifier[qualifierKey]}`),
      new Array<string>(),
    )
    .join(';');

  // Hash the identifier.
  return Crypto.digest(identifier);
}
