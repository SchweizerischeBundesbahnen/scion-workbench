![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

# Getting Started with SCION Workbench

This 'Getting Started' tutorial explains how to install SCION workbench, configures an activity and shows how to open a view. For help getting started with a new Angular app, check out the Angular CLI.

***

[Step 1: Install SCION Workbench from npm](#step-1-install-scion-workbench-from-npm)\
[Step 2: Import SCION Workbench module](#step-2-import-scion-workbench-module)\
[Step 3: Include the workbench in application bootstrap component](#step-3-include-the-workbench-in-application-bootstrap-component)\
[Step 4: Add icons and typography](#step-4-add-icons-and-typography)\
[Step 5: Create your first activity component](#step-5-create-your-first-activity-component)\
[Step 6: Register a route for the activity component](#step-6-register-a-route-for-the-activity-component)\
[Step 7: Register `PersonListComponent` as workbench activity](#step-7-register-personlistcomponent-as-workbench-activity)\
[Step 8: Create your first view component](#step-8-create-your-first-view-component)\
[Step 9: Create a route for the view component](#step-9-create-a-route-for-the-view-component)\
[Step 10: Open the view from the activity component](#step-10-open-the-view-from-the-activity-component)\
[Step 11: Consume route parameters in view component](#step-11-consume-route-parameters-in-view-component)

***

## Step 1: Install SCION Workbench from npm

Use npm command-line tool to install SCION Workbench and Angular CDK packages.
```
npm install --save @scion/workbench @scion/dimension @scion/viewport @angular/cdk
```

> SCION Workbench requires some peer dependencies to be installed. By using the above commands, those are installed as well.

## Step 2: Import SCION Workbench module
Open `app.module.ts` and manifest an import dependency to `WorkbenchModule`.

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

## Step 3: Include the workbench in application bootstrap component
Open `app.component.html` and replace its content as following:

```html 
<wb-workbench></wb-workbench>
```
This includes the workbench frame, with the activity panel to the left, and the view grid to the right.

## Step 4: Add icons and typography
- Download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/wb-font/fonts.zip" download>here</a>, unzip it and put it into `assets/fonts` folder.

- Import the workbench theme in `styles.scss` and include `wb-theme()` SASS mixin. This installs the workbench icon font, and will be used in upcoming releases to style the workbench frame.

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

## Step 5: Create your first activity component
An activity is a visual workbench element shown at the left-hand side of the workbench frame and acts as an entry point into the application. At any given time, only a single activity can be active.

Use Angular command-line tool to generate a new activity component.
```
ng generate component PersonList
```

## Step 6: Register a route for the activity component
In application routing module, register a route pointing to `PersonListComponent`.

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

## Step 7: Register `PersonListComponent` as workbench activity
Open `app.component.html` and add the activity as content child of `<wb-activity>`.\
For `routerLink` property, specify the routing path to `PersonListComponent` as registered in the previous step.
```html
<wb-workbench>
  <wb-activity title="Persons"
               itemText="group"
               itemCssClass="material-icons"
               routerLink="persons">
  </wb-activity>
</wb-workbench>
```
The CSS class(es) as specified in `cssClass` property is applied to the activity label. For Material Icons, the  example above uses a typographic feature called ligatures, which allows rendering of an icon glyph simply by using its textual name (i.e. group).

For Font Awesome Icons, simply specify the CSS class(es) and leave 'label' empty.

```html
<wb-activity title="Persons"
             itemCssClass="fas fa-users"
             routerLink="persons">
</wb-activity>
```

## Step 8: Create your first view component
A view is a visual workbench element which the user can flexibile arrange in the view grid. Views are the principal elements to show data to the user.

Use Angular command-line tool to generate a new view component.
```
ng generate component Person
```

## Step 9: Create a route for the view component
In application routes, register a route pointing to `PersonComponent`.

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

## Step 10: Open the view from the activity component
Open the template of `PersonListComponent` and add a link using `wbRouterLink` directive to open the view. This directive is like Angular `routerLink` directive but with functionality to target a view outlet.

```html
<a wbRouterLink="/persons/123">Open person</a>
```
When clicking on the link, a new view is opened for the specified person.

### Step 11: Consume route parameters in view component
In `PersonComponent` inject Angular `ActivatedRoute` to listen for route parameter changes and to load respective data.\
By injecting `WorkbenchView`, the view can be set a title.

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
[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
