- documentation alternative to empty path (navigateDesktop)

- wb-content-projection: should align microfrontend to desktop bounds when switching perspective

Add tests:
[x] test desktop dom change preserve state
[x] test to restore scrollbar position
[x] test desktop visible primary outlet / explicit desktop navigation
[x] add test to navigate between desktop and non-desktop perspective

Motivation NavigateDesktop vs. Route CanMatch
+ Single Source of Truth (whole definition in perspective)
+ Nesting does not matter
+ Can pass data, css class, etc.

Routing.activatedRoute$
- NavigationCancel and NavigationError should revert route in pairwise

Debug:
- Injector Destroyed in z.B. in WorkbenchLayoutSerializer und GridMergerTest und workbench.spec: Grund: Desktop registriert Route nach initialer Navigation.
  Weil wir in diesen Tests die Workbench Providers provider, welche eine Initial Navigation auslösen, geht die initiale Navigation länger (wegen Evaluierung der Route)
  Im Test wird die aber nicht auf das Startup gewartet und der Test beendet während initialer Navigation.
