# Shakuntalam College website and portals

A static, browser-based college website demo with public information pages and student, teacher, and administrator portals. The interface is built with HTML, CSS, and vanilla JavaScript; it does not require a package manager or build step.

## Run the demo

1. Extract the ZIP into a folder.
2. Open `index.html` in a modern browser.
3. Select **Portal Login** to sign in to a portal.

The demo uses browser `localStorage` for its temporary database. Data stays in that browser profile and is not shared between browsers or devices. Clearing site data resets the local demo database.

## Demo accounts

| Portal | Username | Password |
| --- | --- | --- |
| Administrator | `admin` | `admin123` |
| Student | `stu` | `stu123` |
| Teacher | `tea` | `tea123` |

The student and teacher demo accounts are sample records. Administrators can also create and manage accounts from the portal.

## What's included

- Public college pages for admissions, academics, departments, administration, events, campus gallery, contact, and education authorities.
- Student portal for profile, attendance, results, fees, notices, and assignments.
- Teacher portal for attendance registers, results, assignments, and profile information.
- Administrator portal for student, teacher, and administrator records; attendance, results, fees, notices, events, website settings, and IQAC materials.
- Responsive layouts for desktop and mobile, using the college's maroon, blue-gray, and gold identity.
- The supplied Shakuntalam College logo at `shakuntalam-logo.png` and supporting campus, gallery, and social images under `assets/`.

## Project files

- `index.html` — page shell and stylesheet/script loading.
- `styles.css` — shared public-site and portal styling.
- `app.js` — application data, base components, routing, and portal behavior.
- `final-upgrade.js` — current site and portal presentation, page workflows, and refinements.
- `assignment-files.js` — assignment upload and file-handling features.
- `assets/` — campus, gallery, and social-media images.
- `shakuntalam-logo.png` — transparent-background college logo.

## Demo limitations

This is a front-end demonstration. Authentication, uploaded files, and records are stored locally in browser storage; there is no server-side database, production authentication, or live payment gateway. Do not use real passwords or sensitive student information in the demo. Payment flows are illustrative only.

## ZIP contents

The project files are placed directly at the extracted folder's top level. There is no additional nested `Shakuntalam College v1` directory inside the project folder.
