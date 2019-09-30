/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

/*
 * Secondary entrypoint: '@scion/toolkit/dimension'
 *
 *  See https://github.com/ng-packagr/ng-packagr/blob/master/docs/secondary-entrypoints.md
 */
export { SciDimensionModule } from './dimension.module';
export { SciDimensionDirective } from './dimension.directive';
export { SciMutationService } from './mutation.service';
export { SciDimensionService, SciDimension, USE_NATIVE_RESIZE_OBSERVER } from './dimension.service';
