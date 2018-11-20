![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to prevent view destruction
In the view component, implement `WbBeforeDestroy` lifecycle hook. It is called  when the component is about to be destroyed.

```typescript
@Component({
  ...
  providers: [provideWorkbenchView(ViewComponent)]
})
export class ViewComponent implements WbBeforeDestroy {

  public wbBeforeDestroy(): Observable<boolean> | Promise<boolean> | boolean {
    // e.g., ask the user to close the view
  }
}
```

For non Angular applications, register a function via `ViewService`.

```typescript
Platform.getService(ViewService).setDestroyNotifier(() => Observable<boolean> | Promise<boolean> | boolean {
  // e.g., ask the user to close the view
});
```

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md