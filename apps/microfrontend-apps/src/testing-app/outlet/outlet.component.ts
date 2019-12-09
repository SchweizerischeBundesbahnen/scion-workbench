import { Component, HostBinding, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Application, Beans, MessageClient, TopicMessage } from '@scion/microfrontend-platform';
import { Topics } from '../microfrontend-api';
import { FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.scss'],
})
export class OutletComponent {

  public urlformControl = new FormControl('', Validators.required);
  public endpoints$: Observable<AppEndpoint[]>;
  public url: SafeResourceUrl;

  @Input()
  @HostBinding('attr.id')
  public outletId: string;

  constructor(private _sanitizer: DomSanitizer) {
    this.endpoints$ = Beans.get(MessageClient).observe$(Topics.Applications)
      .pipe(
        take(1),
        map((reply: TopicMessage<Application[]>) => {
          const endpoints: AppEndpoint[] = [];
          const applications = reply.body;

          applications.forEach(application => {
            const origin = application.origin;
            const symbolicName = application.symbolicName;

            endpoints.push({url: `${origin}/#/testing-app/publish-message`, label: `Publish messages from 'app-${symbolicName}`});
            endpoints.push({url: `${origin}/#/testing-app/receive-message`, label: `Receive messages in 'app-${symbolicName}`});
            endpoints.push({url: `${origin}/#/testing-app/manage-capabilities`, label: `Manage capabilities for 'app-${symbolicName}`});
            endpoints.push({url: `${origin}/#/testing-app/manage-intents`, label: `Manage intents for 'app-${symbolicName}`});
            endpoints.push({url: `${origin}/#/testing-app/outlets;count=2`, label: 'Include outlet(s) to show microfrontends'});
          });
          return endpoints;
        }),
      );
  }

  public onClearClick(): void {
    this.urlformControl.setValue('');
    this.navigate();
  }

  public onUrlEnter(): void {
    this.navigate();
  }

  public onGoClick(): void {
    this.navigate();
  }

  private navigate(): void {
    this.url = this._sanitizer.bypassSecurityTrustResourceUrl(this.urlformControl.value);
  }
}

export interface AppEndpoint {
  url: string;
  label: string;
}
