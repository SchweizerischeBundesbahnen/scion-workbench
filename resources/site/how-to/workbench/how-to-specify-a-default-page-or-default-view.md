![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

## How to specify a default page
The workbench installs a primary router outlet when no view is open. To show some content to the user, register a component using the empty path route.

```typescript
const routes: Routes = [
  {path: '', component: WelcomePageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```

## How to specify a default view
The workbench allows listening for opened views. To specify a default view, register a listener and navigate to the default view if no view is opened. This makes the application start with that default view and redirects to it when the user closes the last view.

```typescript
@Component({selector: 'app-root', ...})
export class AppComponent implements OnDestroy {

  private _destroy$ = new Subject<void>();

  constructor(workbench: WorkbenchService, wbRouter: WorkbenchRouter) {
    workbench.views$
      .pipe(takeUntil(this._destroy$))
      .subscribe(views => {
        if (views.length === 0) {
          wbRouter.navigate(['/welcome']);
        }
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
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
