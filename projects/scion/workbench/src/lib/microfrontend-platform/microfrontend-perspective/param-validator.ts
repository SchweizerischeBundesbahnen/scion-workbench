/*
 * Copyright (c) 2018-2025 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {inject} from '@angular/core';
import {Logger, LoggerNames} from '../../logging';
import {Capability, ParamMatcher} from '@scion/microfrontend-platform';
import {Objects} from '../../common/objects.util';
import {Dictionaries} from '@scion/toolkit/util';

/**
 * Validates parameters and migrates deprecated parameters.
 */
export class ParamValidator {

  private readonly _logger = inject(Logger);

  /**
   * Validates passed parameters against parameters defined by the specified part capability, migrating deprecated params, if any.
   *
   * @return Validated, possibly migrated parameters, or `false` if not valid.
   */
  public validatePartParams(params: Params | undefined, partCapability: Capability, context: {perspectiveCapability: Capability; partId: string}): Params | false {
    const {perspectiveCapability, partId} = context;

    return this.validateParams(params, partCapability, {
      deprecated: param => `[PerspectiveDefinitionWarning] The perspective capability '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' passes a deprecated parameter '${param}' to part '${partId}' to part capability '${qualifier(partCapability)}'.`,
      missing: params => `[PerspectiveDefinitionError] Missing required parameters: The perspective capability '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' passes invalid parameters to part '${partId}'. Parameters do not match expected params of part capability '${qualifier(partCapability)}'. Missing parameters: '${params}'`,
      unexpected: params => `[PerspectiveDefinitionError] Unexpected parameters: The perspective capability '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' passes invalid parameters to part '${partId}'. Parameters do not match expected params of part capability '${qualifier(partCapability)}'. Unexpected parameters: '${params}'`,
    });
  }

  /**
   * Validates passed parameters against parameters defined by the specified view capability, migrating deprecated params, if any.
   *
   * @return Validated, possibly migrated parameters, or `false` if not valid.
   */
  public validateViewParams(params: Params | undefined, viewCapability: Capability, context: {partCapability: Capability}): Params | false {
    const {partCapability} = context;
    return this.validateParams(params, viewCapability, {
      deprecated: param => `[PartDefinitionWarning] The part capability '${qualifier(partCapability)}' of app '${app(partCapability)}' passes a deprecated parameter '${param}' to view capability '${qualifier(viewCapability)}'.`,
      missing: params => `[PartDefinitionError] Missing required parameters: The part capability '${qualifier(partCapability)}' of app '${app(partCapability)}' passes invalid parameters to view '${qualifier(viewCapability)}'. Parameters do not match expected params of the view capability. Missing parameters: '${params}'`,
      unexpected: params => `[PartDefinitionError] Unexpected parameters: The part capability '${qualifier(partCapability)}' of app '${app(partCapability)}' passes invalid parameters to view '${qualifier(viewCapability)}'. Parameters do not match expected params of the view capability. Unexpected parameters: '${params}'`,
    });
  }

  private validateParams(params: Params | undefined, capability: Capability, messageFactory: ValidationMessageFactory): Params | false {
    const match = new ParamMatcher(capability.params).match(params);
    if (match.matches && !match.deprecatedParams.length) {
      return Dictionaries.coerce(match.params);
    }

    // Log deprecated params, if any.
    match.deprecatedParams.forEach(({deprecated: deprecation, name: param}) => {
      const useInstead = (typeof deprecation === 'object' && deprecation.useInstead) || undefined;
      const deprecationMessage = (typeof deprecation === 'object' && deprecation.message) || undefined;

      this._logger.warn(new Array<string>()
        .concat(messageFactory.deprecated(param))
        .concat(useInstead ? `Pass parameter '${useInstead}' instead.` : [])
        .concat(deprecationMessage || [])
        .join(' '), LoggerNames.MICROFRONTEND);
    });

    // Log missing params, if any.
    if (match.missingParams.length) {
      this._logger.error(messageFactory.missing(match.missingParams.map(param => param.name)), LoggerNames.MICROFRONTEND);
    }

    // Log unexpected params, if any.
    if (match.unexpectedParams.length) {
      this._logger.error(messageFactory.unexpected(match.unexpectedParams), LoggerNames.MICROFRONTEND);
    }

    return match.matches ? Dictionaries.coerce(match.params) : false;
  }
}

/**
 * Factory to built validation messages.
 */
interface ValidationMessageFactory {
  deprecated: (param: string) => string;
  missing: (params: string[]) => string;
  unexpected: (params: string[]) => string;
}

/**
 * Represents parameters.
 */
export interface Params {
  [name: string]: unknown;
}

/**
 * Returns the qualifier as string.
 */
function qualifier(capability: Capability): string {
  return Objects.toMatrixNotation(capability.qualifier);
}

/**
 * Returns the app symbolic name.
 */
function app(capability: Capability): string {
  return capability.metadata!.appSymbolicName;
}
