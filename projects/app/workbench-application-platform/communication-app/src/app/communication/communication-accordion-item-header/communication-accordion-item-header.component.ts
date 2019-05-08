/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, Input } from '@angular/core';
import { Communication } from '../communication.model';

@Component({
  selector: 'app-communication-accordion-item-header',
  templateUrl: './communication-accordion-item-header.component.html',
  styleUrls: ['./communication-accordion-item-header.component.scss'],
})
export class CommunicationAccordionItemHeaderComponent {

  @Input()
  public communication: Communication;
}
