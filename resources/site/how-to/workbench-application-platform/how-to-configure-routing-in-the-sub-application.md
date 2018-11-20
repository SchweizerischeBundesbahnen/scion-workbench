![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to configure routing in the sub application

The platform recommends using hash-based over HTML5 push-state routing for applications integrated into the platform - this for the reason to have faster in-view navigation. It is because the platform does not use HTML5 History API to change the URL. Instead, it sets the URL from outside the application. If not using hash-based routing, the application would start anew.

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


[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md