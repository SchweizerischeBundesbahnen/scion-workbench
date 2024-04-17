/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Pipe, PipeTransform} from '@angular/core';
import {UrlSegment} from '@angular/router';

/**
 * Formats given URL.
 */
@Pipe({name: 'appFormatUrl', standalone: true})
export class FormatUrlPipe implements PipeTransform {

  public transform(url: UrlSegment[]): string {
    return url.map(segment => segment.path).join('/');
  }
}
