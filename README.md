# Shakuntalam College — ERP V6 Working Fix

This package contains the repaired demo website and portals.

## Important fixes in this build
- Fixed blank/white page caused by missing `noticeCard` and `subjectsForCourse` helpers.
- Added safe migration for older browser data where website social-link data was incomplete.
- Restored teacher profile photo/signature upload handler.
- Fixed Admin → Students hierarchy routing so Department → Course → Semester → Student Details renders correctly.
- Student sign-in accepts a full name, username or student ID for accounts created by the administrator.
- Fixed the admin and teacher course → semester routes so matching students appear in the roster and attendance register.
- Added a teacher student directory with course and semester filters.
- Preserved Admin → Teachers hierarchy: Department → Course → Teacher.
- Preserved scroll-position fixes.
- The demo starts with no student or teacher records. The administrator can add, edit and delete both account types.
- Teachers can update their own faculty profile and photo after signing in.
- Unified interface typography to Oswald, with Anton reserved for the college wordmark.
- Extended the portal shell to fill the viewport and preserved sidebar position while navigating portal sections.

## Demo login
- Admin: `admin` / `admin123`
- Student and teacher accounts: create them from the admin portal before signing in.

## Run
Open `index.html` in a modern browser. The demo stores its temporary database in browser storage.
