<a href="/README.md"><img src="/resources/branding/scion-workbench-banner.svg" height="50" alt="SCION Workbench"></a>

| [SCION Workbench][menu-home] | [Projects Overview][menu-projects-overview] | [Changelog][menu-changelog] | Contributing | [Sponsoring][menu-sponsoring] |  
| --- | --- | --- | --- | --- |

## Contributing
We encourage other developers to join the project and contribute to making SCION products constantly better and more stable. If you are missing a feature, please create a feature request so we can discuss it and coordinate further development. To report a bug, please check existing issues first, and if found, leave a comment on the issue. Otherwise, file a bug or create a pull request with a proposed fix.

<details>
  <summary><strong>Submitting a Pull Request</strong></summary>
  <br>
  
This section explains how to submit a pull request.

1. Login to your GitHub account and fork the `SchweizerischeBundesbahnen/scion-workbench` repo.
1. Make your changes in a new Git branch. Name your branch in the form `issue/123` with `123` as the related GitHub issue number. Before submitting the pull request, please make sure that you comply with our coding and commit guidelines.
1. Run the command `npm run before-push` to make sure that the project builds, passes all tests, and has no lint violations. Alternatively, you can also run the commands one by one, as following:
   - `npm run lint`\
      Lints all project files.
   - `npm run build`\
      Builds the project and related artifacts.
   - `npm run test:headless`\
      Runs all unit tests.
   - `npm run e2e:headless`\
      Runs all end-to-end tests.
1. Commit your changes using a descriptive commit message that follows our commit guidelines.
1. Before submitting the pull request, ensure to have rebased your branch based on the master branch as we stick to the rebase policy to keep the repository history linear. 
1. Push your branch to your fork on GitHub. In GitHub, send a pull request to `scion-workbench:master`.
1. If we suggest changes, please amend your commit and force push it to your GitHub repository.

> When we receive a pull request, we will carefully review it and suggest changes if necessary. This may require triage and several iterations. Therefore, we kindly ask you to discuss proposed changes with us in advance via the GitHub issue.

</details>

<details>
  <summary><strong>Development</strong></summary>
  <br>

Before you start development, we recommend that you build all projects using the `npm run build` command. Please make sure that path overrides are disabled in `tsconfig.json`.

**Node Version**

Make sure to use Node.js version `20.14.0` for contributing to SCION. We recommend using [Node Version Manager](https://github.com/nvm-sh/nvm) if you need different Node.js versions for other projects.

**Disable Angular Cache**

When working with the workbench testing application, we recommend disabling the Angular cache because we have experienced unexpected caching errors when starting multiple applications at once.
```console
ng cache disable
```

**Enable Hot Code Replacement**

To enable hot code replacement for `@scion/workbench` and `@scion/workbench-client`, uncomment the `PATH-OVERRIDE-FOR-DEVELOPMENT` section in the `tsconfig.json` file.

*Optional*: To debug dependent SCION libraries:
1. Clone dependent repositories into a directory at the same level as the workbench checkout folder:
   ``` 
   ├── scion-workbench
   ├── scion-toolkit (git clone git@github.com:SchweizerischeBundesbahnen/scion-toolkit.git)
   ├── scion-microfrontend-platform (git clone git@github.com:SchweizerischeBundesbahnen/scion-microfrontend-platform.git)
   ```
2. Run `npm run copy-src` to copy their source into the `src-lib` folder. This folder is referenced in the path overrides in `tsconfig.json`.

**Commands for working on the @scion/workbench library**
 
- `npm run workbench:lint`\
  Lints the workbench source.

- `npm run workbench:build`\
  Builds the workbench source.

- `npm run workbench:test`\
  Runs unit tests of the workbench.

**Commands for working on the @scion/workbench-client library**
 
- `npm run workbench-client:lint`\
  Lints the workbench-client source.

- `npm run workbench-client:build`\
  Builds the workbench-client source.

- `npm run workbench-client:test`\
  Runs unit tests of the workbench-client.

**Commands for running end-to-end tests**

- `npm run e2e:run`\
  Runs end-to-end tests of the workbench and workbench-client. Prior to test execution, starts the testing app `workbench-testing-app` and two instances of the `workbench-client-testing-app`.

- `npm run e2e:debug`\
  Runs end-to-end tests of the workbench and workbench-client in debug mode. Prior to test execution, starts the testing app `workbench-testing-app` and two instances of the `workbench-client-testing-app`.

- `npm run e2e:lint`\
  Lints end-to-end tests.

**Commands for working on the testing application**

- `npm start`\
  Serves the `workbench-testing-app` and two instances of the `workbench-client-testing-app`. Open the page http://localhost:4200 to load the workbench host app into your browser.\
  Uncomment the section `PATH-OVERRIDE-FOR-DEVELOPMENT` in `tsconfig.json` to have hot code replacement.

- `npm run workbench-testing-app:lint`\
  Lints the `workbench-testing-app`.

- `npm run workbench-client-testing-app:lint`\
  Lints the `workbench-client-testing-app`.

**Commands for working on the getting started application**

- `npm run workbench-getting-started-app:serve`\
  Serves the `workbench-getting-started-app` on http://localhost:4500.\
  Uncomment the section `PATH-OVERRIDE-FOR-DEVELOPMENT` in `tsconfig.json` to have hot code replacement.

- `npm run workbench-getting-started-app:lint`\
  Lints the `workbench-testing-app`.

**Commands for generating the project documentation**

We generate separate changelogs for the packages `@scion/workbench` and `@scion/workbench-client` because of their independent release cycles.

- `npm run workbench:changelog`\
  Use to generate the changelog for `@scion/workbench` based on the commit history. Only commits that involve files under `projects/scion/workbench` are included in the changelog. The output is written to `CHANGELOG_WORKBENCH.md`, which will be included in `docs/site/changelog-workbench/changelog.md` using the template `docs/site/changelog-workbench/changelog.template.md`. 
- `npm run workbench-client:changelog`\
  Use to generate the changelog for `@scion/workbench-client` based on the commit history. Only commits that involve files under `projects/scion/workbench-client` are included in the changelog. The output is written to `CHANGELOG_WORKBENCH_CLIENT.md`, which will be included in `docs/site/changelog-workbench-client/changelog.md` using the template `docs/site/changelog-workbench-client/changelog.template.md`. 

</details>

<details>
  <summary><strong>Code Formatting</strong></summary>
  <br>

To ensure consistency within our code base, please use the following formatting settings.  
  
- **For IntelliJ IDEA**\
  Import the code style settings of `.editorconfig.intellij.xml` located in the project root.

- **For other IDEs**\
  Import the code style settings of `.editorconfig` located in the project root.
  
</details>

<details>
  <summary><strong>Coding Guidelines</strong></summary>
  <br>
  
In additional to the linting rules, we have the following conventions:

- We believe in the [Best practices for a clean and performant Angular application](https://medium.freecodecamp.org/best-practices-for-a-clean-and-performant-angular-application-288e7b39eb6f) and the [Angular Style Guide](https://angular.io/guide/styleguide).
- We expect line endings to be Unix style (LF) only. Please check your Git settings to not convert line endings to CRLF. You can run the following command to find files with `windows-style` line endings: `find . -type f | xargs file | grep CRLF`.
- Observable names are suffixed with the dollar sign (`$`) to indicate that it is an `Observable` which we must subscribe to and unsubscribe from.
- We use explicit public and private visibility modifiers (except for constructors) to make the code more explicit.
- We prefix private members with an underscore.
- We write each RxJS operator on a separate line, except when piping a single RxJS operator. Then, we write it on the same line as the pipe method.
- We avoid nested RxJS subscriptions.
- We document all public API methods, constants, functions, classes or interfaces.
- We structure the CSS selectors in CSS files similar to the structure of the companion HTML file and favor the direct descendant selector (`>`) over the non-restrictive descendant selector (` `), except if there are good reasons not to do it. This gives us a visual by only reading the CSS file. 
- When referencing CSS classes from within E2E tests, we always prefix them with `e2e-`. We never reference e2e prefixed CSS classes in stylesheets.

</details>

<details>
  <summary><strong>Commit Guidelines</strong></summary>
  <br>
  
We believe in a compact and well written Git commit history. Every commit should be a logically separated changeset. We use the commit messages to generate the changelog.
 
Each commit message consists of a **header**, a **summary** and a **footer**.  The header has a special format that includes a **type**, an optional **scope**, and a **subject**, as following:

```
<type>(<scope>): <subject>

[optional summary]

[optional footer]
```

<details>
  <summary><strong>Type</strong></summary>
  
- `feat`: new feature
- `fix`: bug fix
- `docs`: changes to the documentation
- `refactor`: changes that neither fixes a bug nor adds a feature
- `perf`: changes that improve performance
- `test`: adding missing tests, refactoring tests; no production code change
- `chore`: other changes like formatting, updating the license, removal of deprecations, etc
- `deps`: changes related to updating dependencies
- `ci`: changes to our CI configuration files and scripts
- `revert`: revert of a previous commit
- `release`: publish a new release
</details>

<details>
  <summary><strong>Scope</strong></summary>
  
The scope should be the name of the NPM package or application affected by the change.

The following scopes are allowed:
  
- `workbench`: If the change affects the `@scion/workbench` NPM package.
- `workbench-client`: If the change affects the `@scion/workbench-client` NPM package.
- `workbench-testing-app`: If the change affects the internal testing app for the workbench.
- `workbench-client-testing-app`: If the change affects the internal testing app for the workbench client.
- `workbench-getting-started-app`: If the change affects the getting started app for the workbench.
</details>


<details>
  <summary><strong>Subject</strong></summary>
  
The subject contains a succinct description of the change and follows the following rules:
- written in the imperative, present tense ("change" not "changed" nor "changes")
- starts with a lowercase letter
- has no punctuation at the end
</details>

<details>
  <summary><strong>Summary</strong></summary>
  
The summary describes the change. You can include the motivation for the change and contrast this with previous behavior.  
</details>

<details>
  <summary><strong>Footer</strong></summary>
  
In the footer, reference the GitHub issue and optionally close it with the `Closes` keyword, as following:

```
closes #123
```

And finally, add notes about breaking changes, if there are any. Breaking changes start with the keyword `BREAKING CHANGE: `. The rest of the commit message is then used to describe the breaking change and should contain information about the migration.
  
```
BREAKING CHANGE: Removed deprecated API for xy.

To migrate:
- do xy
- do xy
  ```
</details>

</details>


<details>
  <summary><strong>Deprecation Policy</strong></summary>
  <br>

You can deprecate API in any version. However, it will still be present in the next major release. Removal of deprecated API will occur only in a major release.

When deprecating API, mark it with the `@deprecated` JSDoc comment tag and include the current library version. Optionally, you can also specify which API to use instead, as following: 

```ts
/**
 * @deprecated since version 2.0. Use {@link otherMethod} instead.
 */
function someMethod(): void {
}

```  

</details>

<details>
  <summary><strong>Deployments</strong></summary>
  <br>
  
We deploy our documentations and applications to [Vercel](https://vercel.com/docs). Vercel is a cloud platform for static sites and serverless functions. Applications are deployed using the SCION collaborator account (scion.collaborator@gmail.com) under the [SCION organization](https://vercel.com/scion).

We have the following workbench related projects:
- https://vercel.com/scion/scion-workbench-client-api
- https://vercel.com/scion/scion-workbench-testing-app
- https://vercel.com/scion/scion-workbench-client-testing-app
- https://vercel.com/scion/scion-workbench-getting-started-app

</details>

<details>
  <summary><strong>NPM Packages</strong></summary>
  <br>
  
We publish our packages to the [NPM registry](https://www.npmjs.com/). Packages are published using the SCION collaborator account (scion.collaborator) under the [SCION organization](https://www.npmjs.com/org/scion).

We have the following workbench related packages:
- https://www.npmjs.com/package/@scion/workbench
- https://www.npmjs.com/package/@scion/workbench-client

</details>

<details>
  <summary><strong>Versioning</strong></summary>
  <br>  

We follow the same SemVer (Semantic Versioning) philosophy as Angular, with major versions being released at the same time as major versions of the Angular framework.

### Semantic Versioning Scheme (SemVer)

**Major Version:**\
Major versions contain breaking changes.

**Minor Version**\
Minor versions add new features or deprecate existing features without breaking changes.

**Patch Level**\
Patch versions fix bugs or optimize existing features without breaking changes. 
  
</details>

<details>
  <summary><strong>Release Checklist for @scion/workbench and related artifacts</strong></summary>
  <br>

This chapter describes the tasks to publish a new release for `@scion/workbench` to NPM.

1. Update `/projects/scion/workbench/package.json` with the new version.
1. Run `npm run workbench:changelog` to generate the changelog. Then, review the generated changelog carefully and correct typos and formatting errors, if any.
1. Commit the changed files using the following commit message: `release(workbench): vX.X.X`. Replace `X.X.X` with the current version. Later, when merging the branch into the master branch, a commit message of this format triggers the release action in our [GitHub Actions workflow][link-github-actions-workflow].
1. Push the commit to the branch `release/X.X.X` and submit a pull request to the master branch. Replace `X.X.X` with the current version.
1. When merged into the master branch, the release action in our [GitHub Actions workflow][link-github-actions-workflow] does the following:
   - Creates a Git release tag
   - Publishes `@scion/workbench` package to NPM (https://www.npmjs.com/package/@scion/workbench)
   - Creates a release on GitHub (https://github.com/SchweizerischeBundesbahnen/scion-workbench/releases)
   - Deploys following apps to Vercel:
     - https://workbench-getting-started.scion.vercel.app
     - https://workbench-testing-app.scion.vercel.app
     - https://workbench-client-testing-app1.scion.vercel.app (contributes microfrontends)
     - https://workbench-client-testing-app2.scion.vercel.app (contributes microfrontends)

</details>

<details>
  <summary><strong>Release Checklist for @scion/workbench-client and related artifacts</strong></summary>
  <br>

This chapter describes the tasks to publish a new release for `@scion/workbench-client` to NPM.

1. Update `/projects/scion/workbench-client/package.json` with the new version.
1. Run `npm run workbench-client:changelog` to generate the changelog. Then, review the generated changelog carefully and correct typos and formatting errors, if any.
1. Commit the changed files using the following commit message: `release(workbench-client): vX.X.X`. Replace `X.X.X` with the current version. Later, when merging the branch into the master branch, a commit message of this format triggers the release action in our [GitHub Actions workflow][link-github-actions-workflow].
1. Push the commit to the branch `release/workbench-client-X.X.X` and submit a pull request to the master branch. Replace `X.X.X` with the current version.
1. When merged into the master branch, the release action in our [GitHub Actions workflow][link-github-actions-workflow] does the following:
    - Creates a Git release tag (prefixed with workbench-client-)
    - Publishes `@scion/workbench-client` package to NPM (https://www.npmjs.com/package/@scion/workbench-client)
    - Creates a release on GitHub (https://github.com/SchweizerischeBundesbahnen/scion-workbench/releases)
    - Deploys following apps to Vercel:
        - https://workbench-getting-started.scion.vercel.app
        - https://workbench-testing-app.scion.vercel.app
        - https://workbench-client-testing-app1.scion.vercel.app (contributes microfrontends)
        - https://workbench-client-testing-app2.scion.vercel.app (contributes microfrontends)
    - Publishes API documentation (TypeDoc) to Vercel:
        - https://workbench-client-api.scion.vercel.app
        - https://workbench-client-api-vX-X-X.scion.vercel.app 
</details>

[link-github-actions-workflow]: https://github.com/SchweizerischeBundesbahnen/scion-workbench/actions

[menu-home]: /README.md
[menu-projects-overview]: /docs/site/projects-overview.md
[menu-changelog]: /docs/site/changelog.md
[menu-contributing]: /CONTRIBUTING.md
[menu-sponsoring]: /docs/site/sponsoring.md
