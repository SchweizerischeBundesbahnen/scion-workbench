<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Getting Started

This short manual helps to install the SCION Workbench and describes how to open views.

<details>
    <summary><strong>Install SCION Workbench from NPM</strong></summary>
    <br>

```console
npm install @scion/workbench @scion/toolkit @angular/cdk --save
```

> SCION Workbench requires some peer dependencies to be installed. By using the above commands, those are installed as well.

</details>

<details>
    <summary><strong>Import SCION Workbench module</strong></summary>
    <br>

Open your `app.module.ts` and import the `WorkbenchModule`, as following:

```typescript
const appRoutes: Routes = [];

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    WorkbenchModule.forRoot(),
    RouterModule.forRoot(appRoutes, {useHash: true}), // module required by SCION Workbench
    BrowserAnimationsModule, // module required by SCION Workbench
    ...
  ],
  providers: [
    ...
  ],
  bootstrap: [
    AppComponent,
  ]
})
export class AppModule {
}
```
If used in a feature module, use `WorkbenchModule.forChild()` instead.

> SCION Workbench requires routing to be configured. If missing, create a separate routing module, or import Angular Routing module like in the above snippet.

> SCION Workbench requires Animation Module to be imported.
</details>

<details>
    <summary><strong>Include the workbench in application bootstrap component</strong></summary>
    <br>
    
Open your `app.component.html` and replace its content as following:

```html 
<wb-workbench></wb-workbench>
```
This includes the workbench layout, with the activity panel to the left, and the view grid to the right.
    
</details>

<details>
    <summary><strong>Add icons and typography</strong></summary>
    <br>

- Download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/wb-font/fonts.zip" download>here</a>, unzip it and put it into the `assets/fonts` folder.

- Import the workbench theme in the file `styles.scss` and include the `wb-theme()` SASS mixin.

```sass
@import '~@scion/workbench/theming';

@include wb-theme();
``` 

- Use an icon font to provide activity icons:

  - If you want to reference activity icons from Material Design, load it in `index.html` as following.

    ```html
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    ```

  - If you want to reference activity icons from Font Awesome, load it in `index.html` as following.

    ```html
    <link href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" integrity="sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt" crossorigin="anonymous" rel="stylesheet">
    ```
  - Alternatively, you can use any other icon font to provide activity icons.

- Use a font like `Roboto` from Google to have a nice typography:
  
  - In `styles.css` or `styles.scss`, specify to use the `Roboto` font:

    ```css
    body {
      font-family: Roboto, Arial, sans-serif;
    }    
    ```

  - In `index.html`, load the `Roboto` font with the 300, 400 and 500 weights:
    ```html
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
    ```
</details>

<details>
    <summary><strong>Create your first activity component</strong></summary>
    <br>

Activities are displayed in a side panel on the left side of the workbench layout. Only one activity can be active at any given time.

Use the Angular command-line tool to generate a new activity component.
```
ng generate component PersonList
```

In the application routing module, register a route pointing to `PersonListComponent`.

```typescript
const routes: Routes = [
  {path: 'persons', component: PersonListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```
</details>

<details>
    <summary><strong>Register <code>PersonListComponent</code> as workbench activity</strong></summary>
    <br>

Open the file `app.component.html` and model the activity as content child to the  `<wb-workbench>` element.\
For the `routerLink` property, specify the routing path to `PersonListComponent`. When the user clicks on the activity item, the workbench displays the activity with the content of the specified route.
```html
<wb-workbench>
  <wb-activity title="Persons"
               itemText="group"
               itemCssClass="material-icons"
               routerLink="persons">
  </wb-activity>
</wb-workbench>
```
The CSS classes specified in the `itemCssClass` property are added to the activity item. For Material Icons, the  example above uses a typographic feature called ligatures, which allows rendering of an icon glyph simply by using its textual name (e.g., group).

For Font Awesome Icons, simply specify the CSS class(es) and leave the `itemText` property empty.

```html
<wb-activity title="Persons"
             itemCssClass="fas fa-users"
             routerLink="persons">
</wb-activity>
```
</details>

<details>
    <summary><strong>Create your first view component</strong></summary>
    <br>

A view is a visual workbench element which the user can flexibile arrange in the view grid. Views are the principal elements to show data to the user.

Use Angular command-line tool to generate a new view component.
```
ng generate component Person
```

In the application routes, register a route pointing to `PersonComponent`.

```typescript
const routes: Routes = [
  {path: 'persons', component: PersonListComponent},
  {path: 'persons/:id', component: PersonComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```
</details>

<details>
    <summary><strong>Open the view from the activity component</strong></summary>
    <br>

Open the HTML template of the `PersonListComponent` and add a link to open a person in a view. Decorate the link with the `wbRouterLink` directive and specify the target route that should be activated when the user clicks on the link. This directive is like the Angular `routerLink` directive but targets a view outlet.

```html
<a wbRouterLink="/persons/123">Open person</a>
```
When clicking on the link, a new view is opened for the specified person.
</details>

<details>
    <summary><strong>Consume route parameters in view component</strong></summary>
    <br>

In `PersonComponent`, inject Angular `ActivatedRoute` to listen for route parameter changes and to load respective data.\
By injecting `WorkbenchView`, you can set a title to the view.

```typescript
@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(route: ActivatedRoute,
              view: WorkbenchView,
              personService: PersonService) {
    route.paramMap
      .pipe(
        map(paramMap => paramMap.get('id')),
        distinctUntilChanged(),
        switchMap(id => personService.person$(id)),
        takeUntil(this.destroy$)
      )
      .subscribe(person => {
        view.title = `${person.firstname} ${person.lastname}`;
        view.heading = 'Person';
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
  }
}
```
</details>

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
