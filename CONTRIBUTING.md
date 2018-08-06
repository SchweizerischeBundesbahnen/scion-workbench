![SCION Workbench](/resources/site/logo/scion-workbench-banner.png)

[Overview][menu-overview] | [Demo][menu-demo] | [Getting&nbsp;Started][menu-getting-started] | [How&nbsp;To][menu-how-to] | [Contributing][menu-contributing] | [Changelog][menu-changelog] | [Sponsoring][menu-sponsoring] | [Links][menu-links]
|---|---|---|---|---|---|---|---|


# Contributing

[Contribution](#contribution)\
[Build SCION Workbench](#build-scion-workbench)\
[NPM Versioning Guidelines](#npm-versioning-guidelines)\
[Release Guidelines](#release-guidelines)\
[Commit Guidelines](#commit-guidelines)\
[Coding guidelines](#coding-guidelines)\
[Line endings](#line-endings)

***

## Contribution
We encourage other developers to join the project and contribute to make SCION Workbench constantly better and more stable. If you are missing a feature, please create a feature request so we can discuss it and coordinate further development. To report a bug, please check existing issues first, and if found, leave a comment on the issue. Otherwise, file a bug or, even better, create a pull request (PR) with a fix.

### Submitting a Pull Request (PR)
Please follow the guidelines below:

1. Search GitHub for an open or closed PR that relates to your submission.
2. Login to your GitHub account and fork the `SchweizerischeBundesbahnen/scion-workbench` repo.
3. Make your changes in a new Git branch. Name your branch in the form 'issue/123' with '123' as the relevant GitHub issue number.
4. Create your patch and stick to our [Coding guidelines](#coding-guidelines). 
5. Run all specs using `ng test` command.
6. Lint source using `ng lint` command.
7. Commit your changes using a descriptive commit message that follows our [commit message conventions](#commit-guidelines). 
8. Push your branch to your fork on GitHub
9. In GitHub, send a pull request to `scion-workbench:master`.
10. If we suggest changes, please rebase your branch and force push to your GitHub repository.

> Please be in mind that large pull requests take a lot of time to review.

## Build SCION Workbench
The project is built with Travis CI and is automatically built, its tests executed and linted as you push it to GitHub.

[![Build Status](https://travis-ci.com/SchweizerischeBundesbahnen/scion-workbench.svg?token=sT5ouhFsqwt9RmkLsQb8&branch=master)](https://travis-ci.com/SchweizerischeBundesbahnen/scion-workbench)

## NPM Versioning Guidelines
For SCION Workbench versioning, we stick to the versioning practices of the Angular project.

### NPM Pre-Releases
Pre-Releases are early versions of the next major release. They are are named in the form `x.0.0-beta.0`, where `x` is the major release number. When publishing a pre-release to NPM, its version number is increment like `x.0.0-beta.1`,  `x.0.0-beta.2`, ..., `x.0.0-beta.n`. Before the official stable release is published, one or more release candidates (RC0, RC1, etc.) are published: `x.0.0-rc.0`, `x.0.0-rc.1`, ..., `x.0.0-rc.n`. Then, if no critical problems are found, the stable major release is finally published at version `x.0.0`.

> Minor and patch releases do not require to publish pre-releases up front.

### NPM Distribution tags:
We use NPM distribution tags to differentiate between pre-releases (x.0.0-beta.0, x.0.0-beta.1, x.0.0-rc.0, x.0.0-rc.0, etc) and stable releases (x.x.x). Pre-releases are tagged with the distribution tag `next`, and stable releases with `latest`. The latest tag is automatically updated by NPM whenever you publish without setting a distribution tag.

### Example for releasing 2.x.x

```bash
2.0.0-beta.0 with "next" distribution tag
2.0.0-beta.1 with "next" distribution tag
2.0.0-beta.x with "next" distribution tag

2.0.0-rc.0 with "next" distribution tag
2.0.0-rc.1 with "next" distribution tag
2.0.0-rc.x with "next" distribution tag

2.0.0 with "latest" distribution tag
2.0.1 with "latest" distribution tag
2.1.0 with "latest" distribution tag
```

## Release Guidelines
Whenever you publish a new version to NPM (pre-release, major, minor, patch), please follow the instructions below:

- update `package.json` with the new version, e.g. `2.0.0-beta.1`
- update `changelog.md`, if applicable
- create a Git release commit that consists of the two files and a commit message like 'Release version 2.0.0-beta.1'
- create a Git release tag pointing to the previously added release commit, and use the exact version as tagname, e.g. `2.0.0-beta.1`.
- Build the project using NPM command-line tool:
  ```cmd
  npm run build
  ```
- Change to `dist/scion/workbench` directory and publish the distribution to NPM registry. For pre-release versions, always use `next` distribution tag.
  ```
  npm config set registry http://registry.npmjs.org
  npm login
  npm publish --tag next --otp=123456 // required for pre-release versions
  npm publish --otp=123456 // for major, minor or patch release versions
  ```

  SCION workbench packages are published under `@scion` scope. In order to publish a new version, you must be member of SCION organization, and have 2FA (Two Factor Authentication) enabled in your NPM user account. To get access to SCION organization, please file an issue in the project issue tracker.
  
  > Use `otp` flag to add your One-Time Password (OTP) to the publish command, e.g. `--otp=123456`.

## Commit Guidelines
We believe in a compact and well written Git commit history. Every commit should be a logically separate changeset.
As a general rule, your messages should start with a single line in imperative present tense and refer a GitHub issue.

Example:

```
Capitalized, short summary of changes in imperative present tense (#issue)

More detailed explanatory text, if necessary.
```

## Coding Guidelines
Besides linting rules, the following rules apply:

- Observable names are suffixed with dollar sign $ to indicate that it represents a stream which must be subscribed to and unsubscribed from
- we use explicit public or private visibility modifiers (except for constructors) to make code more explicit
- we use single quotes for string literals or import statements
- we use 2 spaces per indentation
- all features or bug fixes related to `routing` or `view grid` must be tested by one or more specs placed in `/projects/scion/workbench/src/lib/spec` directory
- all public API must be documented

## Line endings
This project expects line endings of textual files to be Unix style (LF) only, and which is in the responsibility of the committer. There is no automatic line ending conversation done by Git on checkout nor when indexing files. Instead, configure your editor to use unix-style delimiter for new files and disable auto conversion in Git. However, the linting rule `linebreak-style` enforces a unix-style linebreak style for TypeScript files.

Global Git settings: `core.autocrlf=false`

Run the following command to find files with 'windows-style' line ending:

```
find . -type f | xargs file | grep CRLF
```

[menu-overview]: /README.md
[menu-demo]: https://blog.sbb.technology/scion-workbench-demo/#/(view.6:heatmap//view.5:person/79//view.4:person/39//view.3:person/15//view.2:person/38//view.1:person/66//activity:person-list)?viewgrid=eyJpZCI6MSwic2FzaDEiOlsidmlld3BhcnQuMSIsInZpZXcuMSIsInZpZXcuMiIsInZpZXcuMSJdLCJzYXNoMiI6eyJpZCI6Miwic2FzaDEiOlsidmlld3BhcnQuMiIsInZpZXcuMyIsInZpZXcuMyJdLCJzYXNoMiI6eyJpZCI6Mywic2FzaDEiOlsidmlld3BhcnQuNCIsInZpZXcuNiIsInZpZXcuNiJdLCJzYXNoMiI6WyJ2aWV3cGFydC4zIiwidmlldy40Iiwidmlldy40Iiwidmlldy41Il0sInNwbGl0dGVyIjowLjQ4NTk2MTEyMzExMDE1MTEsImhzcGxpdCI6ZmFsc2V9LCJzcGxpdHRlciI6MC41NTk0MjQzMjY4MzM3OTc1LCJoc3BsaXQiOnRydWV9LCJzcGxpdHRlciI6MC4zMjI2Mjc3MzcyMjYyNzczLCJoc3BsaXQiOmZhbHNlfQ%3D%3D
[menu-getting-started]: /resources/site/getting-started.md
[menu-how-to]: /resources/site/how-to.md
[menu-contributing]: /CONTRIBUTING.md
[menu-changelog]: /resources/site/changelog.md
[menu-sponsoring]: /resources/site/sponsors.md
[menu-links]: /resources/site/links.md
