import { Component, NgZone, OnDestroy } from '@angular/core';
import { Beans, MessageClient, MicrofrontendPlatform } from '@scion/microfrontend-platform';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { ActivatedRoute } from '@angular/router';
import { ManifestRequestHandler } from './manifest/manifest-request-handler';
import { AngularZoneMessageClientDecorator } from './angular-zone-message-client.decorator';

const ports = [4200, 4201, 4202, 4203];

@Component({
  selector: 'testing-app', // tslint:disable-line:component-selector
  templateUrl: './testing-app.component.html',
  styleUrls: ['./testing-app.component.scss'],
})
export class TestingAppComponent implements OnDestroy {

  public symbolicAppName: string;
  public appOrigin: string;
  public pageTitle: string;

  constructor(zone: NgZone) {
    const port = coerceNumberProperty(window.location.port || 80);
    this.symbolicAppName = `app-${port}`;
    this.appOrigin = window.origin;

    if (!ports.includes(port)) {
      throw Error(`[PortError] Application served on port ${port} which is not supported. Supported ports are: ${JSON.stringify(ports)}`);
    }

    if (window === window.top) {
      // Start the microfrontend platform in the role of the host app.
      Beans.register(ManifestRequestHandler, {eager: true});
      Beans.register(NgZone, {useValue: zone});
      Beans.registerDecorator(MessageClient, {useClass: AngularZoneMessageClientDecorator});

      MicrofrontendPlatform.forHost([
        {manifestUrl: 'http://localhost:4200/testing-app/assets/app-4200-manifest.json', symbolicName: 'app-4200'},
        {manifestUrl: 'http://localhost:4201/testing-app/assets/app-4201-manifest.json', symbolicName: 'app-4201'},
        {manifestUrl: 'http://localhost:4202/testing-app/assets/app-4202-manifest.json', symbolicName: 'app-4202'},
        {manifestUrl: 'http://localhost:4203/testing-app/assets/app-4203-manifest.json', symbolicName: 'app-4203'},
      ], {symbolicName: `app-${port}`}).then();
    }
    else {
      // Start the microfrontend platform in the role of a microfrontend client.
      Beans.register(NgZone, {useValue: zone});
      Beans.registerDecorator(MessageClient, {useClass: AngularZoneMessageClientDecorator});
      MicrofrontendPlatform.forClient({symbolicName: `app-${port}`}).then();
    }
  }

  public onRouteActivate(route: ActivatedRoute): void {
    this.pageTitle = route.snapshot.data['title'];
  }

  public ngOnDestroy(): void {
    MicrofrontendPlatform.destroy();
  }
}
