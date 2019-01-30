![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to register applications
Applications are registered in the host application when importing the `WorkbenchApplicationPlatformModule` module. They can be registered statically, or dynamically via `ApplicationConfigLoader`.

Following properties are supported:

|property|type|mandatory|description|
|-|-|-|-|
|symbolicName|string|✓|Unique symbolic name of the application. Choose a short, lowercase name which contains alphanumeric characters and optionally dash characters.|
|manifestUrl|string|✓|URL to the application manifest.|
|exclude|boolean||Excludes the application from registration, e.g. to not register it in a specific environment.|
|scopeCheckDisabled|boolean||Sets whether or not capability scope check is disabled for this application.<p>With scope check disabled (discouraged), the application can invoke private capabilities of other applications.<p>By default, scope check is enabled.|

### Static application registration
  
In the following snippet, two applications are registered statically. Dependening on the environment, `dev-app` is installed or not.

```typescript
@NgModule({
  ...,
  imports: [
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot({
      applicationConfig: [
        {
          symbolicName: 'contact-app',
          manifestUrl: environment.contact_app_manifest_url,
        },
        {
          symbolicName: 'dev-app',
          manifestUrl: environment.dev_app_manifest_url,
          exclude: !environment.contact_app_manifest_url,
        }
      ],
    }),
    ...
  ],
  ...
})
export class HostAppModule {
}
```

### Dynamic application registration

For dynamic application registration, register an `ApplicationConfigLoader` to load the application config e.g. from a server.

```typescript
@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot({
      applicationConfigLoader: RemoteApplicationConfigLoader,
    })
  ]
})
export class HostAppModule {
}
```

Then, implement the loader to load the application config, e.g. from the backend.

```typescript
@Injectable()
export class RemoteApplicationConfigLoader implements ApplicationConfigLoader {

  constructor(private httpClient: HttpClient) {
  }

  public load$(): Observable<ApplicationConfig[]> {
    return this.httpClient.get<ApplicationConfig[]>('/assets/app-config.json');
  }
}
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
