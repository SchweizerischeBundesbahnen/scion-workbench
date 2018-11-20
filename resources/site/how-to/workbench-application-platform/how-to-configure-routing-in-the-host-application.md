![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to configure routing in the host application

The platform requires the Angular routing module to be imported in the host application. But, no routes must be configured as they are registered dynamically by the platform.

The following snippet configures routing in the host application.

```typescript
@NgModule({
  imports: [
    WorkbenchModule.forRoot(),
    WorkbenchApplicationPlatformModule.forRoot(...),
    RouterModule.forRoot([], {useHash: true}),
  ]
})
export class HostAppModule {
}
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md