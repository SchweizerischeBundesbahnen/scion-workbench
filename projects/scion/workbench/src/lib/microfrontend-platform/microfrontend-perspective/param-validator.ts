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
      deprecated: param => `[PerspectiveDefinitionWarning] Perspective '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' passes the deprecated parameter '${param}' to part '${partId}'. Migrate deprecated parameters as specified in the capability documentation of part '${qualifier(partCapability)}'.`,
      missing: param => `[PerspectiveDefinitionError] Perspective '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' does not pass the required parameter '${param}' to part '${partId}'. Pass required parameters as specified in the capability documentation of part '${qualifier(partCapability)}'. Ignoring part.`,
      unexpected: param => `[PerspectiveDefinitionError] Perspective '${qualifier(perspectiveCapability)}' of app '${app(perspectiveCapability)}' passes the unexpected parameter '${param}' to part '${partId}'. Pass parameters as specified in the capability documentation of part '${qualifier(partCapability)}'. Ignoring part.`,
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
      deprecated: param => `[PartDefinitionWarning] Part '${qualifier(partCapability)}' of app '${app(partCapability)}' passes the deprecated parameter '${param}' to view '${qualifier(viewCapability)}'. Migrate deprecated parameters as specified in the capability documentation.`,
      missing: param => `[PartDefinitionError] Part '${qualifier(partCapability)}' of app '${app(partCapability)}' does not pass the required parameter '${param}' to view '${qualifier(viewCapability)}'. Pass required parameters as specified in the capability documentation. Ignoring view.`,
      unexpected: param => `[PartDefinitionError] Part '${qualifier(partCapability)}' of app '${app(partCapability)}' passes the unexpected parameter '${param}' to view '${qualifier(viewCapability)}'. Pass parameters as specified in the capability documentation. Ignoring view.`,
    });
  }

  private validateParams(params: Params | undefined, capability: Capability, messageFactory: ValidationMessageFactory): Params | false {
    const match = new ParamMatcher(capability.params).match(params);
    if (match.matches && !match.deprecatedParams.length) {
      return Dictionaries.coerce(match.params);
    }

    // Log deprecated params.
    match.deprecatedParams.forEach(({deprecated: deprecation, name: param}) => {
      const useInstead = (typeof deprecation === 'object' && deprecation.useInstead) || undefined;
      const deprecationMessage = (typeof deprecation === 'object' && deprecation.message) || undefined;

      this._logger.warn(new Array<string>()
        .concat(messageFactory.deprecated(param))
        .concat(useInstead ? `Pass parameter '${useInstead}' instead.` : [])
        .concat(deprecationMessage || [])
        .join(' '), LoggerNames.MICROFRONTEND);
    });

    // Log missing params.
    match.missingParams.forEach(param => this._logger.error(messageFactory.missing(param.name), LoggerNames.MICROFRONTEND));

    // Log unexpected params.
    match.unexpectedParams.forEach(param => this._logger.error(messageFactory.unexpected(param), LoggerNames.MICROFRONTEND));

    return match.matches ? Dictionaries.coerce(match.params) : false;
  }
}

/**
 * Factory to create validation messages.
 */
interface ValidationMessageFactory {
  deprecated: (param: string) => string;
  missing: (param: string) => string;
  unexpected: (param: string) => string;
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
