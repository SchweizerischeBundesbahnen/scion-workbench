![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to register applications
Applications are registered in the host application when importing the `WorkbenchApplicationPlatformModule` module. They can be registered statically, or dynamically via `PlatformConfigLoader`.

Following properties are supported:

|property|type|mandatory|description|
|-|-|-|-|
|symbolicName|string|✓|Unique symbolic name of the application. Choose a short, lowercase name which contains alphanumeric characters and optionally dash characters.|
|manifestUrl|string|✓|URL to the application manifest.|
|exclude|boolean||Excludes the application from registration, e.g. to not register it in a specific environment.|
|scopeCheckDisabled|boolean||Sets whether or not capability scope check is disabled for this application.<p>With scope check disabled (discouraged), the application can invoke private capabilities of other applications.<p>By default, scope check is enabled.|
|restrictions|{activityContributionAllowed: boolean}||Defines restrictions for this application, e.g. to not contribute activities.<p>By default, the app has no restrictions.|

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
For dynamic application registration, register a `PlatformConfigLoader` to load the platform and application configuration e.g. from a server.

```typescript
@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot({
      platformConfigLoader: RemotePlatformConfigLoader,
    })
  ]
})
export class HostAppModule {
}
```

Then, implement the loader to load the platform config.

```typescript
@Injectable()
export class RemotePlatformConfigLoader implements PlatformConfigLoader {

  constructor(private httpClient: HttpClient) {
  }

  public load$(): Observable<PlatformConfig> {
    return this.httpClient.get<PlatformConfig>('/assets/platform-config.json');
  }
}
```

#### Custom properties 

It is possible to provide custom properties in `PlatformConfig`. The properties are then available via `PlatformProperties` service.

```json
{
  "apps": [...], ➀
  "properties": { ➁
    "custom-prop-1": "value",
    "custom-prop-2": {

    },
  };
}
```
|#|Explanation|
|-|-|
|➀|Array of `ApplicationConfig` objects representing registered applications|
|➁|Optional properties available via `PlatformProperties` service|

```typescript
@Component(...)
export class AppComponent  {

  constructor(platformProperties: PlatformProperties) {
    platformProperties.get('custom-prop-1');
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
