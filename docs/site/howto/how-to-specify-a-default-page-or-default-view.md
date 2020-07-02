<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

#### How to specify a default page
The workbench installs a primary router outlet when no view is opened. To still show some content to the user, register a component using the empty path route.

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

#### How to specify a default view
The workbench allows listening for opened views. To specify a default view, register a listener and navigate to the default view when no view is opened. This makes the application start with that default view and redirects to it when the user closes the last view.

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

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
