![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Workbench][menu-workbench] | [Workbench&nbsp;Application&nbsp;Platform][menu-workbench-application-platform] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|

# Getting Started with SCION Workbench Application Platform

This 'Getting Started' tutorial will guide you through the fundamentals of `SCION Workbench Application Platform`. It starts with an introduction to the core concepts of the platform. Then, a step-by-step guide explains how to create an application which integrates content from other applications. Next, a short introduction to the dev-tools is given to help developers to have a better overview of the applications installed in the platform. By the end of this tutorial, the final application will be a basic version of the demo application you find [here](https://scion-workbench-application-platform.now.sh).

***
- [Core concepts][core-concepts]
- [Tutorial][tutorial]
  - [Host application][host-app]
    - [Step 1: Create the host application][host-app-step-1]
    - [Step 2: Install 'SCION Workbench Application Platform and register the applications to integrate][host-app-step-2]
    - [Step 3: Include the workbench in application bootstrap component][host-app-step-3]
    - [Step 4: Add icon font and typography][host-app-step-4]
    - [Step 5: Serve the host application and open it in the browser][host-app-step-5]
  - [Contact application (Angular)][contact-app]
    - [Step 1: Create the contact application][contact-app-step-1]
    - [Step 2: Add typography][contact-app-step-2]
    - [Step 3: Enable hash-based routing][contact-app-step-3]
    - [Step 4: Put the router outlet into a viewport][contact-app-step-4]
    - [Step 5: Download following files to manage contacts][contact-app-step-5]
    - [Step 6: Install 'SCION Workbench Application' for an Angular application][contact-app-step-6]
    - [Step 7: Register your first capability to show a list of contacts in a workbench activity][contact-app-step-7]
    - [Step 8: Create the activity component for the previously registered capability][contact-app-step-8]
    - [Step 9: Register a route pointing to the previously created activity component][contact-app-step-9]
    - [Step 10: Register a capability to add new contacts via popup][contact-app-step-10]
    - [Step 11: Create the popup component for the previously registered capability][contact-app-step-11]
    - [Step 12: Register a route pointing to the previously created popup component][contact-app-step-12]
    - [Step 13: Register a capability to show a contact in a view][contact-app-step-13]
    - [Step 14: Create the view component for the previously registered capability][contact-app-step-14]
    - [Step 15: Register a route pointing to the previously created view component][contact-app-step-15]
    - [Step 16: Register intents to invoke communication functionality][contact-app-step-16]
  - [Communication application (Angular)][communication-app]
  - [Dev Tools][devtools]


***

## Core concepts
The Workbench Application Platform provides the mechanics for client-side web application integration. Any web application can be integrated. If the site does not interact with the platform, there is no need for adaptation.

### Entry points
To integrate an application, it should provide one or more entry points. When one application invokes another, the calling application invokes an entry point in the other app. This paradigm is different from developing a traditional single page application where user interaction always begins at the root entry point.

### Application manifest
The platform provides the concept of an application manifest to facilitate this entry-point invocation paradigm. Thus every application has a manifest which lists its capabilities and intents. Typically, the manifest is deployed as part of the application.

#### Capability
A capability represents a feature which an application provides. It is of a specific type and has assigned a qualifier. The qualifier is used for logical addressing so that other applications can invoke it without knowing the provider nor the relevant entry point, if any. A qualifier is a dictionary of key-value pairs. It is allowed to use the wildcard characters (\*) and (?) as qualifier value. (\*) means that some value has to be provided, whereas for (?) the entry value is optional.

> For example, if an application provides a view to editing some personal data, the qualifier could look as follows: `{entity: 'person', id: '*'}`.\
Applications can invoke this capability by issuing an intent matching the capability's qualifier, with any value allowed for the 'id'.\

> For example, if the application provides a single view to edit or create a person, the qualifier could look as follows: `{entity: 'person', id: '?'}`.\
Applications can invoke this capability by issuing an intent without an id for creation (`{entity: 'person'}`), or with an id for editing (`{entity: 'person', id: 1}`).

Some capabilities define an entry point URL if showing an application page. Using placeholders in URL segments is possible. When invoked, they are replaced with values from the intent qualifier.

> For example, if issuing the intent `{entity: 'person', id: '5'}` for the capability `{entity: 'person', id: '*'}` with the entry-point URL `person/:id`, the platform would load the page at the following URL: `'person/5'`.

Capabilities can have either public or private scope (which is by default). If having private scope, other applications cannot invoke this capability, unless scope check is disabled for that application (discouraged).

There are some built-in capability types supported by the platform. However, the platform can be extended with additional capability types.

|type|description|
|-|-|
|view|opens an application page as a workbench view|
|popup|shows an application page in a popup|
|activity|shows an application page as a workbench activity|
|messagebox|shows a message box to the user|
|notification|shows a notification to the user|
|manifest-registry|allows querying the manifest registry|

#### Intent
If an application intends to interact with functionality of another application, it must declare a respective intent in its manifest. An application has implicit intents for all its own capabilities. It is allowed to use the wildcard character (*) as qualifier key and/or wildcard characters (\*) and (?) as qualifier value.

### Limitation and restrictions
The platform starts a separate application instance for every entry point invoked. The only exception is when navigating within the same view, but only if the application uses hash-based URLs. The fact of having multiple instances brings some requirements and limitations which you should be aware of:

- **Fast bootstrap time**\
Because a separate application instance is started for most entry point invocations, having a fast bootstrap time is inevitable. At startup, the application should not do any expensive initialization nor load a large amount of data. Also, reduce the code bundle size to a bare minimum.
- **Separate document per application instance**\
Probably the most critical limitation is that each application instance has its separate document. To share state client-side between the application instances, you can use web storage, a shared worker or a service worker. In the example given below, we make use of the session storage.

- **Limited to iframe's boundaries**\
Because the application is running in an iframe, its content cannot overlap the iframe’s boundaries. Be aware of this limitation if creating overlays for popups, drop-downs or tooltips.\
To show content overlapping the application boundary, you can use the popup service provided by the platform.

### Modules
The Workbench Application Platform consists of the following modules:
- `workbench-application-platform`\
This module provides the platform to integrate other applications. Install it in the host application and register the applications to integrate.
- `workbench-application.core`\
Install this module in sub-applications which require interaction with the platform, e.g., to open views, to show popups, or to display message boxes or notifications to the user. It is written in pure TypeScript with the only dependency on RxJS. If writing a non-Angular sub-application, use this module to interact with the platform.
- `workbench-application.angular`\
Install this module in Angular sub-applications which require interaction with the platform. It depends on `workbench-application.core` and provides a convenience API for Angular applications.

The following figure shows a sample setup with a host application that integrates two other applications.
<a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/site/pics/workbench-application-platform.svg">![SCION Workbench Application Platform](/resources/site/pics/workbench-application-platform.svg)</a>

## Tutorial
In this tutorial, we will integrate two applications. One application provides the user with functionality to manage contacts. This application we will create from scratch to learn how to provide capabilities and how to invoke capabilities of this and other applications. The other application is already deployed and allows creating communications. But first, we create a host application which integrates the two applications.

### Host application
The host application is very small. The only things we have to do is to register the applications and to provide the workbench application frame.

#### Step 1: Create the host application
Use Angular CLI to create a new Angular application which acts as our host application. Do not add routing when the CLI asks to add Angular routing. Instead, import `RoutingModule` directly in the `AppModule` without generating a separate module.

```
ng new host-app --style scss
```

#### Step 2: Install 'SCION Workbench Application Platform' and register the applications to integrate
- Use NPM command-line tool to install `SCION Workbench` and `SCION Workbench Application Platform`.

  ```
  npm install --save @scion/workbench @scion/workbench-application-platform @scion/toolkit @angular/cdk
  ```
  > SCION Workbench requires some peer dependencies to be installed. By using the above commands, those are installed as well.

- Import 'SCION Workbench Application Platform' module and register your applications

  Open `app.module.ts` and import `WorkbenchModule` and `WorkbenchApplicationPlatformModule`. Then, register the applications which you like to integrate.
  
  > Do not forget to import Angular `BrowserAnimationsModule` and `RouterModule` which are required by the workbench.

  ```typescript
  @NgModule({
    declarations: [
      ...
    ],
    imports: [
      WorkbenchModule.forRoot(), ➀
      WorkbenchApplicationPlatformModule.forRoot({ ➁
        applicationConfig: ➂ [
          {
            symbolicName: 'contact-app', ➃
            manifestUrl: 'http://localhost:4200/assets/manifest.json',
          },
          {
            symbolicName: 'communication-app', ➄
            manifestUrl: 'https://scion-workbench-application-platform-communication.now.sh/assets/manifest.json',
          },
          {
            symbolicName: 'dev-tools-app', ➅
            manifestUrl: 'https://scion-workbench-application-platform-devtools.now.sh/assets/manifest.json',
            scopeCheckDisabled: true,
          }
        ],
      }),
      RouterModule.forRoot([], {useHash: true}),
      BrowserAnimationsModule,
      BrowserModule,
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

  |#|Explanation|
  |-|-|
  |➀|Imports `SCION Workbench` module|
  |➁|Imports `SCION Workbench Application Platform` module and configures the applications to integrate|
  |➂|Registers the applications running in the platform. Alternatively, you can configure a `PlatformConfigLoader` to load the application configuration from a server.|
  |➃|Registers the `contact-app` application|
  |➄|Registers the `communication-app` application. This application is already deployed.|
  |➅|Registers the `dev-tools` application.<br>This application is already deployed and provides an overview of all applications installed, lists their capabilities and intents, and shows inter-application dependencies.<br>Please note that it requires scope checks to be disabled, so it can invoke private capabilities of other applications.|

#### Step 3: Include the workbench in application bootstrap component
Open `app.component.html` and replace its content as follows:

```html 
<wb-workbench></wb-workbench> ➀
```

|#|Explanation|
|-|-|
|➀|This includes the root object of the SCION Workbench.|

#### Step 4: Add icon font and typography
- Download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/wb-font/fonts.zip" download>here</a>, unzip it and put it into `assets/fonts` folder.

- Import the workbench theme in `styles.scss` and include `wb-theme()` SASS mixin. This installs the workbench icon font and will be used in upcoming releases to style the workbench frame.

  ```sass
  @import '~@scion/workbench/theming';

  @include wb-theme();
  ``` 

- Use an icon font to provide activity icons:

  - If you want to reference activity icons from Material Design, load it in `index.html` as follows.

    ```html
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    ```

  - If you want to reference activity icons from Font Awesome, load it in `index.html` as follows.

    ```html
    <link href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" rel="stylesheet">
    ```
  - Alternatively, you can use any other icon font to provide activity icons.

- Use a font like `Roboto` from Google to have nice typography:
  
  In `styles.scss`, specify to use the `Roboto` font:

    ```scss
    @import url('https://fonts.googleapis.com/css?family=Roboto:normal,bold,italic,bolditalic');

    body {
      font-family: Roboto, Arial, sans-serif;
    }    
    ```
    
#### Step 5: Serve the host application and open it in the browser

Use Angular CLI to serve the application.

```
ng serve --port 5000 --aot
```

Open your browser at following URL: http://localhost:5000. You should see the SCION Workbench application shell. In the activity panel on the left side, you see the `DevTools` activity. When opening it, the `DevTools` application starts and lists all installed applications - that is the `host-app`, the `communication-app` and also the `dev-tools-app`. However, `contact-app` is missing because not available yet. In the following, we start developing the contacts application.

### Contact application (Angular)
Now we start developing the contacts application. First, we create an activity which provides the user with a list of contacts. Then, we add an activity action to allow creating a new contact in a popup. In the next step, we develop a view to editing contact data. Finally, we invoke the communication application to create new communications.

#### Step 1: Create the contact application
Use Angular CLI to create a new Angular application.
```
ng new contact-app --style scss --routing
```

#### Step 2: Add typography
- Use a font like `Roboto` from Google to have nice typography:
  
  In `styles.scss`, specify to use the `Roboto` font:

    ```scss
    @import url('https://fonts.googleapis.com/css?family=Roboto:normal,bold,italic,bolditalic');

    body {
      font-family: Roboto, Arial, sans-serif;
    }    
    ```
#### Step 3: Enable hash-based routing
The platform recommends using hash-based over HTML5 push-state routing for applications integrated into the platform - this for the reason to have faster in-view navigation. It is because the platform does not use HTML5 History API to change the URL. Instead, it sets the URL from outside the application. If not using hash-based routing, the application would start anew.

Open `AppRoutingModule` and enable `HashLocationStrategy`.

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

#### Step 4: Put the router outlet into a viewport
The platform does not show scrollbars if application content overflows in a view, popup or activity. Therefore, the application should put the entire application inside a viewport.

As a possible viewport implementation for Angular applications, you can use  `SciViewportModule` which provides a native viewport out of the box with scrollbars that sit on top of the viewport client.

- Use NPM command-line tool to install `SciViewportModule`.

  ```
  npm install --save @scion/toolkit
  ```

- Import 'SciViewportModule'

  Open `app.module.ts` and import `SciViewportModule` from `@scion/toolkit/viewport`.
  ```typescript
  @NgModule({
    imports: [
      ...
      SciViewportModule,
    ]
  })
  export class AppModule {
  }
  ```

- Open `app.component.html` and replace its content as follows to put the router outlet into a viewport

  ```html 
  <sci-viewport>
    <router-outlet></router-outlet> ➀
  </sci-viewport>
  ```

- Open `app.component.scss` and replace its content as follows:

  ```scss 
  :host {
    display: block;
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0; ➀

    > sci-viewport {
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0; ➁

      router-outlet {
        position: absolute; ➂
      }
    }
  }
  ```
  |#|Explanation|
  |-|-|
  |➀|Stretches this component to be full width and full height.|
  |➁|Stretches the viewport to be full width and full height.|
  |➂|Takes the router outlet out of the document flow to not affect the positioning of other elements.|

#### Step 5: Download following files to manage contacts
- Download <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/snippet/contact.service.ts" download>contact.service.ts</a> and put it into your `src/app` folder.\
It provides session storage CRUD operations for the contact entity.
- Download <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/snippet/session-storage.service.ts" download>session-storage.service.ts</a> and put it into your `src/app` folder.\
It allows interacting with the session storage.
- Download <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/snippet/contact.data.json" download>contact.data.json</a> and put it into your `src/assets` folder.\
It contains sample contact data.

- Open `app.module.ts` and import `HttpClientModule`

  It is used by the `ContactService` to load the contacts JSON.

  ```typescript
  @NgModule({
    imports: [
      ...
      HttpClientModule
    ]
  })
  export class AppModule {
  }
  ```

#### Step 6: Install 'SCION Workbench Application' for an Angular application
- Use NPM command-line tool to install `@scion/workbench-application.angular`.

  ```
  npm install --save @scion/workbench-application.angular @angular/cdk
  ```
  > Angular CDK is required. By using the above commands, it is installed as well.

- Import 'SCION Workbench Application' for Angular

  Open `app.module.ts` and import `WorkbenchApplicationModule`.
  ```typescript
  @NgModule({
    declarations: [
      AppComponent,
    ],
    imports: [
      BrowserModule,
      WorkbenchApplicationModule.forRoot(), ➀
      SciViewportModule,
      AppRoutingModule,
      HttpClientModule,
    ],
    providers: [],
    bootstrap: [
      AppComponent,
    ]
  })
  export class AppModule {
  }
  ```

|#|Explanation|
|-|-|
|➀|Imports `SCION Workbench Application` module for Angular. When providing a config object, you can configure some aspects of the app, like the focus handling.|

#### Step 7: Register your first capability to show a list of contacts in a workbench activity
An activity is a visual workbench element shown at the left-hand side of the workbench frame and acts as an entry point into the application. At any given time, only a single activity can be active.

- Create the empty file `manifest.json` in `contact-app/src/assets/`. This is the manifest file where you declare your capabilities and intents.
- Add following lines to the file. It sets application metadata and declares your first capability.

  ```javascript
  {
    "name": "Contact Application", ➀
    "baseUrl": "#", ➁
    "capabilities": [ ➂
      {
        "type": "activity", ➃
        "qualifier": {
          "entryPoint": "contacts",
          "id": "*"
        },        
         "description": "Lists all contacts and allows to show their personal data.", ➄
         "properties": { ➅
           "title": "Contacts", ➆
           "itemText": "person_outline", ➇
           "itemCssClass": "material-icons", ➇
           "path": "contacts" ➈
        }
      }
    ],
    "intents": [ ➉
    ]
  }
  ```
  |#|Explanation|
  |-|-|
  |➀|Specifies the name of this application.|
  |➁|Specifies the base URL of this application which is used to resolve entry point paths. Because we are using hash-based routing, we set the base URL to '#'.|
  |➂|Section to specify all capabilities of this application (functionality which this application provides).|
  |➃|Declares that we provide an activity and assigns a qualifier to identify it.|
  |➄|Describes what kind of functionality this capability provides.|
  |➅|Specifies activity specific properties.|
  |➆|Sets the tooltip of this activity.|
  |➇|Sets the item text of this activity. This example uses a ligature defined by the Material icon font. Because setting   'material-icons' as CSS class, the textual name is displayed as an icon.|
  |➈|Sets the URL path under which this capability can be invoked.|
  |➉|Section to specify intents of this application (functionality which this application requires).|

#### Step 8: Create the activity component for the previously registered capability
- Use Angular command-line tool to generate a new component.
  ```
  ng generate component ContactActivity
  ```
- Open it and add following content:

  ```typescript
  @Component({
    selector: 'app-contact-activity',
    templateUrl: './contact-activity.component.html',
    styleUrls: ['./contact-activity.component.scss'],
    providers: [
      provideWorkbenchActivity(ContactActivityComponent) ➀
    ]
  })
  export class ContactActivityComponent {

    public contacts$: Observable<Contact[]>;

    constructor(private _contactService: ContactService) {
      this.contacts$ = this._contactService.contacts$(); ➁
    }
  }
  ```
  |#|Explanation|
  |-|-|
  |➀|Instructs given class to live in the context of an activity.|
  |➁|Connects to the contact service to load contacts. The observable emits upon subscription and whenever contacts change.|

- Open the template and add following content:

  ```html
  <ul>
    <li *ngFor="let contact of contacts$ | async"> ➀
      <a [wbRouterLink]="{'entity': 'contact', 'id': contact.id}"> ➁
        {{contact.firstname}} {{contact.lastname}}
      </a>
    </li>
  </ul>

  <ng-container wbPopupOpenActivityAction ➂
                [title]="'Create contact'" ➃
                [label]="'person_add'" ➄
                [cssClass]="'material-icons'" ➄
                [qualifier]="{'entity': 'contact', 'action': 'create'}"> ➅
  </ng-container>
  ```
  |#|Explanation|
  |-|-|
  |➀|Shows the contacts as list.|
  |➁|Adds a link which navigates to a view matching the given qualifier. It is similar to using Angular Router link, except that you provide a qualifier instead of path commands. Optionally, router link allows providing options to control navigation or to provide query or matrix parameters. |
  |➂|Adds an activity action to this activity. The action opens a popup of given qualifier when the user clicks the action button.|
  |➃|Sets the tooltip of this action.|
  |➄|Sets the item text of this action. This example uses a ligature as defined by the Material icon font. Because setting 'material-icons' as its CSS class, the textual name is displayed as an icon.|
  |➅|Sets the qualifier which is used to open the popup when the user clicks the action button.|

#### Step 9: Register a route pointing to the previously created activity component
In application routing module, register a route pointing to `ContactActivityComponent`.

```typescript
const routes: Routes = [
  {path: 'contacts', component: ContactActivityComponent} ➀
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```
|#|Explanation|
|-|-|
|➀|The path must correspond to the path as defined in [step 7][contact-app-step-7].|

***
After completing the previous steps, serve this application on port 4200 and open your browser at following URL: http://localhost:5000. Now you should see the 'Contacts' activity item. When clicking it, the activity of this application is opened.

```
ng serve --aot
```

#### Step 10: Register a capability to add new contacts via popup
Open `manifest.json` and declare the new popup capability as follows:

```javascript
{
  "capabilities": [
    {
      "type": "popup", ➀
      "qualifier": { ➁
        "entity": "contact",
        "action": "create"
      },
      "description": "Allows to create a new contact.",
      "properties": { ➂
        "path": "contact/new",
        "width": "400px",
        "height": "200px"
      }
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|Declares that we provide a popup.|
|➁|Specifies the qualifier under which this capability can be invoked|
|➂|Sets popup specific properties like the URL path pointing to the popup page.|

#### Step 11: Create the popup component for the previously registered capability
- Use Angular command-line tool to generate a new component.
  ```
  ng generate component ContactNewPopup
  ```
- Open `app.module.ts` and import `ReactiveFormsModule`

  It is used by the component to create an Angular form.

  ```typescript
  @NgModule({
    imports: [
      ...
      ReactiveFormsModule
    ]
  })
  export class AppModule {
  }
  ```

- Open the component and add following content:

  ```typescript
  const FIRSTNAME = 'firstname';
  const LASTNAME = 'lastname';

  @Component({
    selector: 'app-contact-new-popup',
    templateUrl: './contact-new-popup.component.html',
    styleUrls: ['./contact-new-popup.component.scss'],
    providers: [
      provideWorkbenchPopup(ContactNewPopupComponent) ➀
    ]
  })
  export class ContactNewPopupComponent {

    public readonly FIRSTNAME = FIRSTNAME;
    public readonly LASTNAME = LASTNAME;

    public form: FormGroup;

    constructor(private _popup: WorkbenchPopup, ➁
                private _contactService: ContactService,
                private _router: WorkbenchRouter, ➂
                formBuilder: FormBuilder) {
      this.form = formBuilder.group({
        [FIRSTNAME]: formBuilder.control('', Validators.required),
        [LASTNAME]: formBuilder.control('', Validators.required),
      });
    }

    public onOk(): void {
      const contact: Contact = {
        id: UUID.randomUUID(),
        firstname: this.form.get(FIRSTNAME).value,
        lastname: this.form.get(LASTNAME).value,
      };

      this._contactService.create$(contact).subscribe(noop, noop, () => {
        this._router.navigate({'entity': 'contact', 'id': contact.id}); ➃
        this._popup.close(); ➄
      });
    }
  }
  ```
  |#|Explanation|
  |-|-|
  |➀|Instructs given class to live in the context of a popup.|
  |➁|Injects a handle to interact with the popup, e.g. to close the popup.|
  |➂|Injects Workbench router to navigate to views.|
  |➃|Navigates to the contact detail view. It is similar to using Angular Router, except that you provide a qualifier instead of path commands. Optionally, you can provide query parameters or matrix parameters, or options to control the navigation.|
  |➄|Closes this popup.|

- Open the template and add following content:

  ```html
  <h2>New contact</h2>

  <form [formGroup]="form" autocomplete="off">
    <label for="firstname">Firstname *</label>
    <input id="firstname" [formControlName]="FIRSTNAME">

    <label for="lastname">Lastname *</label>
    <input id="lastname" [formControlName]="LASTNAME">
  </form>

  <hr>
  <button (click)="onOk()" [disabled]="!form.valid">Create</button>
  ```

- Open the style template and add following content:

  ```scss
  :host {
    display: block;
    padding: 1em;

    > h2 {
      margin: 0 0 1.5em 0;
    }

    > form {
      display: grid;
      grid-template-columns: 100px auto;
      grid-column-gap: 1em;
      grid-row-gap: .5em;
    }

    > hr {
      margin-top: 1.5em;
    }
  }
  ```

#### Step 12: Register a route pointing to the previously created popup component
In application routing module, register a route pointing to `ContactNewPopupComponent`.

```typescript
const routes: Routes = [
  ...,
  {path: 'contact/new', component: ContactNewPopupComponent}, ➀
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```
|#|Explanation|
|-|-|
|➀|The path must correspond to the path as defined in [step 10][contact-app-step-10].|

***
After completing the previous steps, serve this application on port 4200 and open your browser at following URL: http://localhost:5000. Now you should be able to create a new contact when clicking the activity action in the header of the activity.

```
ng serve --aot
```

However, if creating the contact, an error shows up because no application provides a capability to show the contact yet. Let us change that.

#### Step 13: Register a capability to show a contact in a view
A view is a visual workbench element which the user can flexibile arrange in the view grid. Views are the principal elements to show data to the user.

Open `manifest.json` and declare the new view capability as follows:

```javascript
{
  "capabilities": [
    {
      "type": "view", ➀
      "qualifier": { ➁
        "entity": "contact",
        "id": "*"
      },
      "private": false, ➂
      "description": "Shows personal data of a contact.",
      "properties": { ➃
        "path": "contact/:id",
        "title": "Contact"
      }
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|Declares that we provide a view.|
|➁|Specifies the qualifier under which this capability can be invoked|
|➂|Makes this a public capability. By default, capabilities have private scope. If private, other application cannot invoke this capability.|
|➃|Sets view specific properties like the URL path pointing to the view page.|

#### Step 14: Create the view component for the previously registered capability
- Use Angular command-line tool to generate a new component.
  ```
  ng generate component ContactView
  ```
- Open it and add following content:

  ```typescript
  const FIRSTNAME = 'firstname';
  const LASTNAME = 'lastname';

  @Component({
    selector: 'app-contact-view',
    templateUrl: './contact-view.component.html',
    styleUrls: ['./contact-view.component.scss'],
    providers: [
      provideWorkbenchView(ContactViewComponent) ➀
    ]
  })
  export class ContactViewComponent implements OnDestroy {

    public readonly FIRSTNAME = FIRSTNAME;
    public readonly LASTNAME = LASTNAME;

    private _destroy$ = new Subject<void>();

    public form: FormGroup;
    public contact: Contact;

    constructor(route: ActivatedRoute,
                private _contactService: ContactService,
                private _view: WorkbenchView, ➁
                private _router: WorkbenchRouter,
                formBuilder: FormBuilder,
                private _popupService: PopupService) {
      this._view.heading = 'Contact'; ➂
      this.form = new FormGroup({
        [FIRSTNAME]: formBuilder.control('', Validators.required),
        [LASTNAME]: formBuilder.control('', Validators.required),
      });

      // Load contact
      route.params ➃
        .pipe(
          map(params => params['id']),
          distinctUntilChanged(),
          switchMap(id => this.load$(id)),
          takeUntil(this._destroy$),
        )
        .subscribe();

      // Store contact if the form changes
      this.form.statusChanges ➄
        .pipe(
          filter(() => this.form.valid),
          switchMap(() => this.store$()),
          takeUntil(this._destroy$),
        )
        .subscribe();
    }

    private load$(contactId: string): Observable<any> {
      return this._contactService.contact$(contactId).pipe(tap((contact: Contact) => {
          this.contact = contact;
          this._view.title = `${this.contact.firstname} ${this.contact.lastname}`; ➅
          this.form.controls[FIRSTNAME].setValue(contact.firstname, {emitEvent: false});
          this.form.controls[LASTNAME].setValue(contact.lastname, {emitEvent: false});
        })
      );
    }

    private store$(): Observable<any> {
      return this._contactService.update$({
        id: this.contact.id,
        firstname: this.form.controls[FIRSTNAME].value,
        lastname: this.form.controls[LASTNAME].value,
      });
    }

    public onCommunicationAdd(event: MouseEvent): void {
      event.preventDefault();
      const popup: Popup = {
        position: 'east',
        anchor: event.target as Element,
      };
      this._popupService.open(popup, { ➆
        entity: 'communication',
        action: 'create',
        contactId: this.contact.id
      });
    }

    public ngOnDestroy(): void {
      this._destroy$.next();
    }
  }
  ```
  |#|Explanation|
  |-|-|
  |➀|Instructs given class to live in the context of a view.|
  |➁|Injects a handle to interact with the view, e.g. to mark it dirty or to close it.|
  |➂|Sets the view-tab heading (sub-title).|
  |➃|Loads contact data from session storage.|
  |➄|Stores contact data into session storage.|
  |➅|Sets the view-tab title.|
  |➆|Opens a popup to create a new communication. This capability is provided by another application. Like when opening a view, a qualifier must be provided to identity the capability. |

- Open the template and add following content:

  ```html
  <form [formGroup]="form" autocomplete="off">
    <label for="firstname">Firstname *</label>
    <input id="firstname" [formControlName]="FIRSTNAME">

    <label for="lastname">Lastname *</label>
    <input id="lastname" [formControlName]="LASTNAME">
  </form>

  ➀
  <ul>
    <li>
      <a href="" (click)="onCommunicationAdd($event)">Add new communication</a>
    </li>
    <li>
      <a [wbRouterLink]="{entity: 'communication', presentation: 'list', contactId: contact.id}"
         [wbRouterLinkExtras]="{matrixParams: {contactFullName: contact.firstname + ' ' + contact.lastname}}">
        Open communications
      </a>
    </li>
  </ul>
  ```
  |#|Explanation|
  |-|-|
  |➀|Adds a link to open a view which lists communications of the contact. This capability is provided by another application. Besides the qualifier, the application provides a matrix parameter as expected by the capability.|
  
- Open the style template and add following content:

  ```scss
  :host {
    display: block;
    padding: 1em;

    > form {
      display: grid;
      grid-template-columns: minmax(80px, 120px) auto;
      grid-column-gap: 1em;
      grid-row-gap: .5em;
    }
  }
  ```

#### Step 15: Register a route pointing to the previously created view component
In application routing module, register a route pointing to `ContactViewComponent`.

```typescript
const routes: Routes = [
  ...,
  {path: 'contact/:id', component: ContactViewComponent}, ➀
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
```
|#|Explanation|
|-|-|
|➀|The path must correspond to the path as defined in step [step 13][contact-app-step-13].|

***
After completing the previous steps, serve this application on port 4200 and open your browser at following URL: http://localhost:5000. Now you should be able to open a contact.

```
ng serve --aot
```

However, you cannot create a communication because this functionality is provided by another application and we did not register the intent yet. Let us change that.

#### Step 16: Register intents to invoke communication functionality
Because we use functionality which is provided by another application, we have to list the respective intents in our manifest.

Open `manifest.json` and declare our intents as follows:

```javascript
{
  "intents": [
    {
      "type": "view", ➀
      "qualifier": {
        "entity": "communication",
        "presentation": "list",
        "contactId": "*"
      }
    },
    {
      "type": "popup", ➁
      "qualifier": {
        "entity": "communication",
        "action": "create",
        "contactId": "*"
      }
    }
  ]
}
```
|#|Explanation|
|-|-|
|➀|Declares that we intend to use a view of given qualifier.|
|➁|Declares that we intend to use a popup of given qualifier.|

### Communication application (Angular)
This application is already deployed. You registered it in [step 2][host-app-step-2] when created the host application. The application allows creating new communications for a contact and lists the communications of a contact.

### DevTools
The DevTools application is like a regular application and helps developers to have a better overview of the applications installed in the platform. DevTools is freely available which you can integrate into your application with minimal effort. Simply register the following application with the platform, and you are done.

> https://scion-workbench-application-platform-devtools.now.sh/assets/manifest.json.

It provides the following functionality:

- helps analyze inter-application dependencies
- inspects the capabilities and intents of all applications
- for every intent, it shows the applications providing a respective capability, if any
- for every capability, it shows the applications using that capability, if any
- allows invocation of view and popup capabilities

<a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/site/pics/workbench-application-platform-devtools-large.png">![DevTools](/resources/site/pics/workbench-application-platform-devtools-small.png)</a>


[core-concepts]:#core-concepts
[tutorial]:#tutorial
[host-app]:#host-application
[host-app-step-1]:#step-1-create-the-host-application
[host-app-step-2]:#step-2-install-scion-workbench-application-platform-and-register-the-applications-to-integrate
[host-app-step-3]:#step-3-include-the-workbench-in-application-bootstrap-component
[host-app-step-4]:#step-4-add-icon-font-and-typography
[host-app-step-5]:#step-5-serve-the-host-application-and-open-it-in-the-browser
[contact-app]:#contact-application-angular
[contact-app-step-1]:#step-1-create-the-contact-application
[contact-app-step-2]:#step-2-add-typography
[contact-app-step-3]:#step-3-enable-hash-based-routing
[contact-app-step-4]:#step-4-put-the-router-outlet-into-a-viewport
[contact-app-step-5]:#step-5-download-following-files-to-manage-contacts
[contact-app-step-6]:#step-6-install-scion-workbench-application-for-an-angular-application
[contact-app-step-7]:#step-7-register-your-first-capability-to-show-a-list-of-contacts-in-a-workbench-activity
[contact-app-step-8]:#step-8-create-the-activity-component-for-the-previously-registered-capability
[contact-app-step-9]:#step-9-register-a-route-pointing-to-the-previously-created-activity-component
[contact-app-step-10]:#step-10-register-a-capability-to-add-new-contacts-via-popup
[contact-app-step-11]:#step-11-create-the-popup-component-for-the-previously-registered-capability
[contact-app-step-12]:#step-12-register-a-route-pointing-to-the-previously-created-popup-component
[contact-app-step-13]:#step-13-register-a-capability-to-show-a-contact-in-a-view
[contact-app-step-14]:#step-14-create-the-view-component-for-the-previously-registered-capability
[contact-app-step-15]:#step-15-register-a-route-pointing-to-the-previously-created-view-component
[contact-app-step-16]:#step-16-register-intents-to-invoke-communication-functionality
[communication-app]:#communication-application-angular
[devtools]:#devtools

[menu-overview]: /README.md
[menu-workbench]: /resources/site/workbench.md
[menu-workbench-application-platform]: /resources/site/workbench-application-platform.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
