<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| SCION Workbench | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | [Contributing][menu-contributing] | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## [SCION Workbench][menu-home] > [How To Guides][menu-how-to] > View

### How to install the SCION Workbench

Follow these steps to install the SCION Workbench in an Angular application.

<details>
    <summary><strong>Install SCION Workbench from NPM</strong></summary>
    <br>

Run the following command to install the SCION Workbench and required dependencies.

```console
npm install @scion/workbench @scion/workbench-client @scion/toolkit @scion/components @scion/microfrontend-platform @angular/cdk --save
```

</details>

<details>
    <summary><strong>Import SCION Workbench module</strong></summary>
    <br>

Open `app.module.ts` and import the `WorkbenchModule`. The lines to be added are marked with `[+]`.

```ts
    import {NgModule} from '@angular/core';
    import {AppComponent} from './app.component';
[+] import {WorkbenchModule} from '@scion/workbench';
[+] import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
    import {RouterModule} from '@angular/router';
    import {BrowserModule} from '@angular/platform-browser';

    @NgModule({
      declarations: [AppComponent],
      imports: [
[+]     WorkbenchModule.forRoot(),
        RouterModule.forRoot([]),
        BrowserModule,
[+]     BrowserAnimationsModule,
      ],
      bootstrap: [AppComponent],
    })
    export class AppModule {
    }
```
</details>

<details>
    <summary><strong>Insert workbench component</strong></summary>
    <br>

Open `app.component.html` and replace it with the following content:

```html 
<wb-workbench></wb-workbench>
```

The workbench itself does not position nor lay out the `<wb-workbench>` component. Depending on your requirements, you may want the workbench to fill the entire page viewport or only parts of it, for example, if you have a header, footer, or navigation panel.

For a quick start, position the workbench absolutely and align it with the page viewport. Open `app.component.scss` and replace it with the following content:
```scss
  wb-workbench {
    position: absolute;
    inset: 0;
  }
```
</details>

<details>
    <summary><strong>Add workbench styles</strong></summary>
    <br>

The workbench requires some styles to be imported into `styles.scss`, as follows:

```scss
@use '@scion/workbench';
``` 

Also, download the workbench icon font from <a href="https://github.com/SchweizerischeBundesbahnen/scion-workbench/raw/master/resources/scion-workbench-icons/fonts/fonts.zip">GitHub</a>, unzip the font files, and place the extracted files in the `assets/fonts` folder.

</details>

After completing the above steps, start your application by running `ng serve`. Open a browser at http://localhost:4200. You should see a blank page.

Continue with guide [How to define an initial layout][link-how-to-define-initial-layout] to define an initial layout for the workbench.

[link-how-to-define-initial-layout]: /docs/site/howto/how-to-define-initial-layout.md

[menu-how-to]: /docs/site/howto/how-to.md

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
