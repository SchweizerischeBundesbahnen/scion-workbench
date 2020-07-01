<a href="/docs/site/application-platform/README.md"><img src="/docs/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > Routing

#### How to configure routing in the sub application

The platform recommends using hash-based over HTML5 push-state routing for applications integrated into the platform. This for the reason that the platform sets the URL externally, which, when navigating within the same app, would cause the application to start anew.

For Angular application, open `AppRoutingModule` and enable `HashLocationStrategy` as follows:

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})], ➀
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```

|#|Explanation|
|-|-|
|➀|This tells Angular to use the anchor tags technique for client side routing.|


[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
