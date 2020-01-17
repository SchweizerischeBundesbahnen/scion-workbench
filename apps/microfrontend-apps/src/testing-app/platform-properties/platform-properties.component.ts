/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */
import { Component } from '@angular/core';
import { Beans, PlatformPropertyService } from '@scion/microfrontend-platform';

@Component({
  selector: 'app-platform-properties',
  templateUrl: './platform-properties.component.html',
  styleUrls: ['./platform-properties.component.scss'],
})
export class PlatformPropertiesComponent {

  public properties = Beans.get(PlatformPropertyService).properties();
}
