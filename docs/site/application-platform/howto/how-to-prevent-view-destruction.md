<a href="/docs/site/application-platform/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench Application Platform"></a>

| SCION Workbench Application Platform | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench Application Platform][menu-home] > [How To Guides][menu-how-to] > View

#### How to prevent view destruction
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

[menu-how-to]: /docs/site/application-platform/howto/how-to.md

[menu-home]: /docs/site/application-platform/README.md
[menu-projects-overview]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/projects-overview.md
[menu-changelog]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/changelog/changelog.md
[menu-contributing]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/CONTRIBUTING.md
[menu-sponsoring]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/blob/master/docs/site/sponsoring.md
