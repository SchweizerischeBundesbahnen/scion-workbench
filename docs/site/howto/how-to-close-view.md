<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to close a view

A view can be closed via navigation, the view's handle `WorkbenchView`, or the `WorkbenchService`.

#### Closing the view using its handle
Inject `WorkbenchView` handle and invoke the `close` method.

```ts
inject(WorkbenchView).close();
```

#### Closing view(s) using the `WorkbenchService`
Inject `WorkbenchService` and invoke `close`, passing the identifies of the views to close.


```ts
inject(WorkbenchService).closeViews('view.1', 'view.2');
```

#### Closing view(s) via navigation

Views can be closed by performing a navigation with the `close` flag set in the navigation extras. Views matching the path will be closed. The path supports the asterisk wildcard segment (`*`) to match view(s) with any value in that segment. To close a specific view, set a view `target` instead of a path.

```ts
inject(WorkbenchRouter).navigate(['path/*/view'], {close: true});
```

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
