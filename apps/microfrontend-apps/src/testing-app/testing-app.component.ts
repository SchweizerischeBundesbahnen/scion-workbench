import { Component, OnDestroy } from '@angular/core';
import { Beans, ClientConfig, MicrofrontendPlatform } from '@scion/microfrontend-platform';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'testing-app', // tslint:disable-line:component-selector
  templateUrl: './testing-app.component.html',
  styleUrls: ['./testing-app.component.scss'],
})
export class TestingAppComponent implements OnDestroy {

  public symbolicAppName: string;
  public appOrigin: string;
  public pageTitle: string;

  public onRouteActivate(route: ActivatedRoute): void {
    this.pageTitle = route.snapshot.data['title'];
    this.symbolicAppName = Beans.get(ClientConfig).symbolicName;
    this.appOrigin = window.origin;
  }

  public ngOnDestroy(): void {
    MicrofrontendPlatform.destroy().then();
  }
}
