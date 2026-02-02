<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > Getting Started

This guide will walk you through creating an Angular application using the SCION Workbench by developing a simple todo application.

The application includes the following features:

- Todos are listed in a workbench part docked to the left side.
- Clicking a todo opens it in a workbench view in the main area.
- Each todo opens in a different view.
- Hold the Ctrl key when clicking on a todo to open it multiple times.
- Todos can be arranged side-by-side using drag & drop.


***
- After you complete this guide, the application will look like this: https://workbench-getting-started.scion.vercel.app.
- The source code of the application can be found <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/apps/workbench-getting-started-app/src">here</a>.
***

> [!CAUTION]
> `@scion/workbench` does not support zoneless. Support is planned for 2026.  

<details>
    <summary><strong>Create New Angular Application</strong></summary>
    <br>

Run the following command to create a new Angular application.

```console
ng new workbench-getting-started --routing=false --style=scss --ssr=false --zoneless=false --skip-tests
```

</details>

<details>
    <summary><strong>Install SCION Workbench from NPM</strong></summary>
    <br>

Run the following command to install the SCION Workbench and required dependencies.

```console
npm install @scion/workbench @scion/workbench-client @scion/toolkit @scion/components @scion/microfrontend-platform @angular/cdk
```

</details>

<details>
    <summary><strong>Register SCION Workbench Providers</strong></summary>
    <br>

Add `provideWorkbench()` to the list of providers in your `app.config.ts`. Added lines are marked with `[+]`.

```ts
    import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
[+] import {provideWorkbench} from '@scion/workbench';
[+] import {provideRouter, withComponentInputBinding} from '@angular/router';
[+] import {provideAnimations} from '@angular/platform-browser/animations';
    
    export const appConfig: ApplicationConfig = {
      providers: [
[+]     provideWorkbench(),
[+]     provideRouter([], withComponentInputBinding()),
[+]     provideAnimations(), // temporary: required until SCION Workbench drops the deprecated Angular animations dependency.
[+]     provideZoneChangeDetection(), // temporary: enable zone.js-based change detection until `@scion/workbench` is zoneless.
         // To add zone.js:
         // 1) For a new app, create it with the `--zoneless=false` flag.
         // 2) For an existing app: run `npm i zone.js` and add the polyfill to `angular.json`: "projects" -> "<your-app>" -> "architect" -> "build" -> "options" -> "polyfills": ["zone.js"]
      ],
    };
```

We configure the router with `componentInputBinding` to read parameters directly from component inputs. SCION Workbench does not require this feature, but it simplifies this tutorial.

</details>

<details>
    <summary><strong>Insert SCION Workbench Component</strong></summary>
    <br>

Open `app.component.html` and change it as follows:

```html 
<wb-workbench/>
```

Import the SCION Workbench component in `app.component.ts`.

```ts
    import {Component} from '@angular/core';
[+] import {WorkbenchComponent} from '@scion/workbench';

    @Component({
      selector: 'app-root',
      imports: [
[+]     WorkbenchComponent
      ],
      templateUrl: './app.component.html',
      styleUrl: './app.component.scss'
    })
    export class AppComponent {
      title = 'workbench-getting-started';
    }
```

The workbench itself does not position nor lay out the `<wb-workbench>` component. Depending on your requirements, you may want the workbench to fill the entire page viewport or only parts of it, for example, if you have an application header.

For a quick start, position the workbench absolutely and align it with the page viewport. Open `app.component.scss` and change it as follows:
```scss
  wb-workbench {
    position: absolute;
    inset: 0;
  }
```
</details>

<details>
    <summary><strong>Add SCION Workbench Styles</strong></summary>
    <br>

The workbench requires some styles to be imported into `styles.scss`, as follows:

```scss
@use '@scion/workbench';
```

Next, download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/scion-workbench-icons/fonts/fonts.zip">GitHub</a>. After downloading, unzip the font files and place the extracted files in the `/public/fonts` folder.

</details>

<details>
    <summary><strong>Install Material Icons and Roboto Font</strong></summary>
    <br>

In this getting started guide, we will use Material icons. To import Material icons, add the following line to `styles.scss`.


```scss
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded');
```

For a nice typography, you can also install the Roboto font by adding the following lines to `styles.scss`:

```scss
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100..900&display=swap');

html {
  font-family: Roboto, sans-serif;
  font-size: 14px;
}
```

> The SCION Workbench does not require Material Icons or the Roboto Font; they are included in this tutorial as examples.

</details>

<details>
    <summary><strong>Create Start Page</strong></summary>
    <br>


In this step, we will create a component that displays the number of pending todos when opening the application.

We will use the `TodoService` to get some sample todos. You can download the `todo.service.ts` file from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/apps/workbench-getting-started-app/src/app/todo.service.ts">here</a>.

1. Create a new component using the Angular CLI.

    ```console
    ng generate component overview --skip-tests
    ```

2. Open `overview.component.ts` component and change it as follows.

    ```ts
        import {Component, inject} from '@angular/core';
        import {TodoService} from '../todo.service';    

        @Component({
          selector: 'app-overview',
          templateUrl: './overview.component.html',
          styleUrl: './overview.component.scss',
        })
    [+] export default class OverviewComponent {      
    [+]   protected todoService = inject(TodoService);
        }
    ```
   We inject the `TodoService` to read the number of pending todos in the template.

   We also change the component to be exported by default, making it easier to register the route for the component.

3. Open `overview.component.html` and change it as follows:

    ```html
    You have {{todoService.todos.length}} pending todos.
    ```

4. Open `overview.component.scss` and add the following styles.

    ```scss
    :host {
      display: grid;
      place-content: start center;
      padding: 2em;
    }
    ```
   We add some CSS to center the content.

5. Register a route in `app.config.ts` for the component.

    ```ts
        import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
        import {provideWorkbench} from '@scion/workbench';
        import {provideRouter, withComponentInputBinding} from '@angular/router';
        import {provideAnimations} from '@angular/platform-browser/animations';
    
        export const appConfig: ApplicationConfig = {
          providers: [
            provideWorkbench(),
            provideRouter([
    [+]       {path: 'overview', loadComponent: () => import('./overview/overview.component')},
            ], withComponentInputBinding()),
            provideAnimations(),
            provideZoneChangeDetection(),
          ],
       };
    ```
6. Add the overview component to the workbench layout.

   Open `app.config.ts` and configure the workbench layout.

   ```ts
       import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
       import {provideWorkbench} from '@scion/workbench';
       import {provideRouter, withComponentInputBinding} from '@angular/router';
       import {provideAnimations} from '@angular/platform-browser/animations';
   [+] import {MAIN_AREA, WorkbenchLayoutFactory} from '@scion/workbench';
   
       export const appConfig: ApplicationConfig = {
         providers: [
           provideWorkbench({
   [+]       layout: (factory: WorkbenchLayoutFactory) => factory
   [+]         .addPart(MAIN_AREA)
   [+]         .navigatePart(MAIN_AREA, ['overview']),
           }),
           provideRouter([
             {path: 'overview', loadComponent: () => import('./overview/overview.component')},
           ], withComponentInputBinding()),
           provideAnimations(),
           provideZoneChangeDetection(),
         ],
      };
   ```

   We create a layout with a main area and display the overview component. The component is only displayed when no views are open in the main area.

   Run `ng serve` and open a browser to http://localhost:4200. You should see: *You have 20 pending todos*.

</details>

<details>
    <summary><strong>Create Todos Component</strong></summary>
    <br>

1. Create a new component using the Angular CLI.
    ```console
    ng generate component todos --skip-tests
    ```
2. Open `todos.component.ts` and change it as follows.

    ```ts
    [+] import {Component, inject} from '@angular/core';
    [+] import {WorkbenchRouterLinkDirective} from '@scion/workbench';
    [+] import {TodoService} from '../todo.service';
    
        @Component({
          selector: 'app-todos',
          templateUrl: './todos.component.html',
          imports: [
    [+]     WorkbenchRouterLinkDirective,
          ],
        })
    [+] export default class TodosComponent {

    [+]   protected todoService = inject(TodoService);
        }
    ```
   We inject the `TodoService` to iterate over the todos in the template.

   We change the component to be exported by default, making it easier to register the route for the component.

3. Open `todos.component.html` and change it as follows:

    ```html
    <ol>
      @for (todo of todoService.todos; track todo.id) {
        <li>
          <a [wbRouterLink]="['/todos', todo.id]">{{todo.task}}</a>
        </li>
      }
    </ol>
    ```

   For each todo, we create a link. When the user clicks on a link, a new view with the todo will open. In a next step we will create the todo component and register it under the route `/todos/:id`.

   > Note that we are using the `wbRouterLink` and not the `routerLink` directive. The `wbRouterLink` directive is the Workbench equivalent of the Angular Router link to navigate views.
4. Register a route in `app.config.ts` for the component.

    ```ts
        import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
        import {provideWorkbench} from '@scion/workbench';
        import {provideRouter, withComponentInputBinding} from '@angular/router';
        import {provideAnimations} from '@angular/platform-browser/animations';
    
        export const appConfig: ApplicationConfig = {
          providers: [
            provideWorkbench(),
            provideRouter([
              {path: 'overview', loadComponent: () => import('./overview/overview.component')},
    [+]       {path: 'todos', loadComponent: () => import('./todos/todos.component')}, 
            ], withComponentInputBinding()),
            provideAnimations(),
            provideZoneChangeDetection(),
          ],
       };
    ```

5. Add the todo list to the workbench layout.

   Open `app.config.ts` and configure the workbench layout.

   ```ts
       import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
       import {provideWorkbench} from '@scion/workbench';
       import {provideRouter, withComponentInputBinding} from '@angular/router';
       import {provideAnimations} from '@angular/platform-browser/animations';
       import {MAIN_AREA, WorkbenchLayoutFactory} from '@scion/workbench';
   
       export const appConfig: ApplicationConfig = {
         providers: [
           provideWorkbench({
             layout: (factory: WorkbenchLayoutFactory) => factory
               .addPart(MAIN_AREA)
               .navigatePart(MAIN_AREA, ['overview'])
   [+]         .addPart('todos', {dockTo: 'left-top'}, {label: 'Todos', icon: 'checklist'})
   [+]         .navigatePart('todos', ['todos'])
   [+]         .activatePart('todos'),
           }),
           provideRouter([
             {path: 'overview', loadComponent: () => import('./overview/overview.component')},
             {path: 'todos', loadComponent: () => import('./todos/todos.component')}, 
           ], withComponentInputBinding()),
           provideAnimations(),
           provideZoneChangeDetection(),
         ],
      };
   ```

   We add a new part `todos` to the layout and dock it to the left. We configure the part to have a label and an icon. By default, the workbench uses icons from the [Material icon font][link-material-icon-font].
   We then navigate the part to display the `todos` component and open it.

   For detailed explanations on defining the workbench layout, refer to [Defining the workbench layout][link-how-to-define-workbench-layout].

   Open a browser to http://localhost:4200. You should see the todo list left to the main area.
</details>

<details>
    <summary><strong>Create Todo Component</strong></summary>
    <br>

In this step, we will create a component to open a todo in a view in the main area.

1. Create a new component using the Angular CLI.
    ```console
    ng generate component todo --skip-tests
    ```
2. Open `todo.component.ts` and change it as follows.

    ```ts
    [+] import {Component, computed, effect, inject, input} from '@angular/core';
    [+] import {WorkbenchView} from '@scion/workbench';
    [+] import {TodoService} from '../todo.service';
    [+] import {DatePipe} from '@angular/common';

        @Component({
          selector: 'app-todo',
          templateUrl: './todo.component.html',
          styleUrl: './todo.component.scss',
          imports: [
    [+]     DatePipe,
          ],
        })
    [+] export default class TodoComponent {
        
    [+]   public id = input.required<string>();

    [+]   private todoService = inject(TodoService);
   
    [+]   protected todo = computed(() => this.todoService.getTodo(this.id()));

    [+]   constructor(view: WorkbenchView) {
    [+]     effect(() => view.title = this.todo().task);
    [+]   } 
        }
    ```
   In this step, we define an input property to read the id of the todo. Using the `computed` function, we fetch the todo based on the provided id. In the constructor, we inject `WorkbenchView` and use an effect to set the view's title.

   We also change the component to be exported by default, making it easier to register the route for the component.

   In the next step, we will render the todo in the template.

3. Open `todo.component.html` and change it as follows.

    ```html
    <span>Task:</span>{{todo().task}}
    <span>Due Date:</span>{{todo().dueDate | date:'short'}}
    <span>Description:</span>{{todo().description}}
    ```

4. Open `todo.component.scss` and add the following styles.

    ```css
    :host {
      padding: 1em;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: .5em 2em;
      place-content: start;
    }
    ```
   We add some CSS to get a tabular presentation of the todo.

5. Register a route in `app.config.ts` for the component.

   Finally, we need to register a route for the component.

   ```ts
       import {ApplicationConfig, provideZoneChangeDetection} from '@angular/core';
       import {provideWorkbench} from '@scion/workbench';
       import {provideRouter, withComponentInputBinding} from '@angular/router';
       import {provideAnimations} from '@angular/platform-browser/animations';
       import {MAIN_AREA, WorkbenchLayoutFactory} from '@scion/workbench';
   
       export const appConfig: ApplicationConfig = {
         providers: [
           provideWorkbench({
             layout: (factory: WorkbenchLayoutFactory) => factory
               .addPart(MAIN_AREA)
               .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
               .addView('todos', {partId: 'left'})
               .navigateView('todos', ['todos'])
           }),
         provideRouter([
           {path: 'overview', loadComponent: () => import('./overview/overview.component')},
           {path: 'todos', loadComponent: () => import('./todos/todos.component')},
   [+]     {path: 'todos/:id', loadComponent: () => import('./todo/todo.component')},  
         ], withComponentInputBinding()),
         provideAnimations(),
         provideZoneChangeDetection(),
        ],
       };
   ```

   Below the code from the previous step how we open the todo view using the `wbRouterLink` directive.
   ```html
   <ol>
     @for (todo of todoService.todos; track todo.id) {
       <li>
         <a [wbRouterLink]="['/todos', todo.id]">{{todo.task}}</a>
       </li>
     }
   </ol>
   ```

   Open a browser to http://localhost:4200. You should see the todo list left to the main area. When you click on a todo, a new view opens displaying the todo. Different todos open a different view. To open a todo multiple times, also press the Ctrl key.

</details>

<details>
    <summary><strong>Further Steps</strong></summary>
    <br>

This short guide has introduced you to the basics of SCION Workbench. For more advanced topics, please refer to our [How-To][link-how-to] guides.

</details>

[link-how-to-define-workbench-layout]: /docs/site/howto/how-to-define-layout
[link-material-icon-font]: https://fonts.google.com/icons


[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md

[link-how-to]: /docs/site/howto/how-to.md
