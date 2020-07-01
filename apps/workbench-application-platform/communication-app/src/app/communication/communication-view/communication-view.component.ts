/*
 * Copyright (c) 2018-2019 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Component, TrackByFunction } from '@angular/core';
import { Communication } from '../communication.model';
import { Observable } from 'rxjs';
import { CommunicationService } from '../communication.service';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { provideWorkbenchView, WorkbenchView } from '@scion/workbench-application.angular';

@Component({
  selector: 'app-communication-view',
  templateUrl: './communication-view.component.html',
  styleUrls: ['./communication-view.component.scss'],
  providers: [
    provideWorkbenchView(CommunicationViewComponent),
  ],
})
export class CommunicationViewComponent {

  public communications$: Observable<Communication[]>;

  constructor(communicationService: CommunicationService,
              route: ActivatedRoute,
              view: WorkbenchView) {
    view.heading = 'Communications';
    view.title = route.snapshot.params['contactFullName'];

    this.communications$ = route.params
      .pipe(
        map(params => params['contactId']),
        distinctUntilChanged(),
        switchMap(contactId => communicationService.communicationsByContactId$(contactId)),
      );
  }

  public trackByFn: TrackByFunction<Communication> = (index: number, communication: Communication): any => {
    return communication.id;
  };
}
