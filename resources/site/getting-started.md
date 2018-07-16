![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview](/README.md) | [Demo](https://blog.sbb.technology/scion-workbench-demo/#/(view.6:heatmap//view.5:person/79//view.4:person/39//view.3:person/15//view.2:person/38//view.1:person/66//activity:person-list)?viewgrid=eyJpZCI6MSwic2FzaDEiOlsidmlld3BhcnQuMSIsInZpZXcuMSIsInZpZXcuMiIsInZpZXcuMSJdLCJzYXNoMiI6eyJpZCI6Miwic2FzaDEiOlsidmlld3BhcnQuMiIsInZpZXcuMyIsInZpZXcuMyJdLCJzYXNoMiI6eyJpZCI6Mywic2FzaDEiOlsidmlld3BhcnQuNCIsInZpZXcuNiIsInZpZXcuNiJdLCJzYXNoMiI6WyJ2aWV3cGFydC4zIiwidmlldy40Iiwidmlldy40Iiwidmlldy41Il0sInNwbGl0dGVyIjowLjQ4NTk2MTEyMzExMDE1MTEsImhzcGxpdCI6ZmFsc2V9LCJzcGxpdHRlciI6MC41NTk0MjQzMjY4MzM3OTc1LCJoc3BsaXQiOnRydWV9LCJzcGxpdHRlciI6MC4zMjI2Mjc3MzcyMjYyNzczLCJoc3BsaXQiOmZhbHNlfQ%3D%3D) | [Getting Started](/resources/site/getting-started.md) | [How To](/resources/site/how-to.md) | [Contributing](/resources/site/contributing.md) | [Sponsoring](/resources/site/sponsors.md)
|---|---|---|---|---|---|


# Getting Started

This 'Getting Started' tutorial explains how to install SCION workbench, configures an activity and shows how to open a view.

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
npm install --save @scion/workbench @angular/cdk
```

> SCION Workbench requires Angular CDK to be installed. By using the above commands, Angular CDK is installed as well.

## Step 2: Import SCION Workbench module
Open `app.module.ts` and manifest an import dependency to `WorkbenchModule`.

```javascript
const appRoutes: Routes = [];

@NgModule({
  declarations: [
    ...
  ],
  imports: [
    WorkbenchModule.forRoot(),
    RouterModule.forRoot(appRoutes, {useHash: true}), // required by SCION workbench
    BrowserAnimationsModule, // required by SCION workbench
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
Use Angular command-line tool to generate a new activity component.
```
ng generate component PersonList
```

## Step 6: Register a route for the activity component
In application routing module, register a route pointing to `PersonListComponent`.

```javascript
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
               label="group"
               cssClass="material-icons"
               routerLink="persons">
  </wb-activity>
</wb-workbench>
```
The CSS class(es) as specified in `cssClass` property is applied to the activity label. For Material Icons, the  example above uses a typographic feature called ligatures, which allows rendering of an icon glyph simply by using its textual name (i.e. group).

For Font Awesome Icons, simply specify the CSS class(es) and leave 'label' empty.

```html
<wb-activity title="Persons"
              cssClass="fas fa-users"
              routerLink="persons">
</wb-activity>
```

## Step 8: Create your first view component
Use Angular command-line tool to generate a new view component.
```
ng generate component Person
```

## Step 9: Create a route for the view component
In application routes, register a route pointing to `PersonComponent`.

  ```javascript
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

```javascript
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
