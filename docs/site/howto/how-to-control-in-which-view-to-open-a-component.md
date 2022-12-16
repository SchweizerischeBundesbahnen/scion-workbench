<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

#### How to control in which view to open a component

When navigating to a component, by default, it is first checked if it is already opened in a view. If not opened yet, depending on the 'target' strategy, the content of the current view is replaced, or a new view tab opened otherwise.

View activation is based on the routing path, meaning that if a view with a matching path is already opened, that view is activated. To never activate an already opened view, use `WbNavigationExtras` and set `target` to `blank`.

```html
<a [wbRouterLink]="['/persons', person.id]" [wbRouterLinkExtras]="{target: 'blank'}">Open person</a>
```

```typescript
wbRouter.navigate(['persons', id], {target: 'blank'});
```

With target strategy, you control whether to replace the content of an existing view, or to open a component in a new view tab. If using `wbRouterLink` and in the context of a view, by default, the current view content is replaced, unless CTRL keystroke is pressed. However, this behavior can be overwritten via navigation extras, by setting `target` to 'blank' or 'auto', respectively.

```html
<a [wbRouterLink]="['/persons', person.id]" [wbRouterLinkExtras]="{target: 'blank'}">Open person in new view</a>
```

> Use matrix parameters to associate optional data with the view outlet URL.\
Matrix parameters are like regular URL parameters, but do not affect route resolution.
Unlike query parameters, matrix parameters are not global and part of the routing path, which makes them suitable for auxiliary routes. Also, matrix parameters are removed upon destruction of the view outlet, and parameter names must not be qualified with the view identity.

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
