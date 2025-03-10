# Team Work Procedures (Updated - 2025-02-02)

## Quick Start for Developers

### Your Tasks
**View all your tasks here:** https://github.com/users/vibqetowi/projects/4/views/6

### Key Schedule
* **Bi-weekly PR Review Meetings (Required)**
  * PRs to `dev` can only be merged during these meetings
  * Team Leads must attend to present their team's PRs
  * 3 reviewers required for each PR
  * Bring your PRs ready for review

### Basic Workflow
1. Get your task from the project board
2. Create branch from the issue
3. Code and test
4. Open PR to `dev`
5. Get reviews and merge at bi-weekly

For detailed git procedures, see: [Git Rules](./Git-Rules.md)

---

## Detailed Procedures

### Introduction

For efficient application development with an 11-person team, we use overlapping roles across **Design** and **Development** phases within a 28-day release cycle (2 x 2-week sprints).

* **Sprint 1 (Weeks 1-2):** Focus on Design (first 3 days) and feature development (Feature 1).
* **Sprint 2 (Weeks 3-4):** Feature development (Feature 2), bug fixes, reporting.
* **Goal:** Deliver one feature *coded* per 2-week sprint, with a full release report and testing suite per 28-day release cycle.  Features may not be fully tested by sprint end, but all feature-related tasks must be coded.
* **Design Pattern:** MVVM.
* **Documentation:** All documentation will be pushed to GitHub. QA procedures are documented separately: [Testing Procedures](./testing-procedures.md)

## 28-Day Release Cycle Timeline

* **Days 1-3: Design Phase (Sprint 1 - Week 1)**
  * Diagrams (System Context, Component, ERD)
  * Operation Contracts
  * Wireframes
  * Sprint Plan & Backlog Refinement
* **Days 4-14: Code Phase - Sprint 1 (Weeks 1-2)**
  * Sprint Backlog Task Execution - Feature 1 Development (Coding)
  * Code Development & Unit Testing (ongoing)
  * Pull Requests & Code Reviews (ongoing)
  * **Day 14 (End of Sprint 1): Feature 1 Code Complete.** All tasks related to Feature 1 coding must be finished.
* **Days 15-27: Code Phase - Sprint 2 (Weeks 3-4)**
  * Sprint Backlog Task Execution - Feature 2 Development (Coding)
  * Code Development & Unit Testing (ongoing)
  * Pull Requests & Code Reviews (ongoing)
  * **Day 28 (End of Sprint 2 / Release Day): Feature 2 Code Complete.** All tasks related to Feature 2 coding must be finished.
* **Days 25-27: Report Phase (End of Sprint 2 - Week 4) - *Scrum Masters and QA Only***
  * Scrum Master Reports & Retrospectives
  * Release Documentation Finalization
  * **Important:** The Report Phase is *exclusively* for Scrum Masters and QA. All other team members (Frontend Developers, Backend Developers, Team Leads, System Designers, UI/UX Designers) continue coding on new tasks during this phase.

## Team Roles

Roles are assigned per release. Discuss role changes with Scrum Masters.

* **Scrum Master (3):** Sprint planning, project management, meeting documentation, user stories/tasks, sprint execution, *Report Phase activities*, *Panel member for bi-weekly meetings*.
* **Team Lead (4):** Subteam communication (to/from Scrum Masters), team progress updates, *Must attend bi-weekly meetings to present tasks and participate in Panel reviews*.
* **System Designer (2):** System diagrams, operation contracts, ERDs (completed before coding)
* **UI/UX Designer (2):** Wireframes (based on personas, usability, completed before development)
* **Frontend Developer (6-7):** UI implementation (wireframes, styling, UI library)
* **Backend Developer (2):** API development/maintenance,data model, data persistence
* **QA Team (2)**: Unit tests, system tests (TDD) and code quality reports

## Story Points and Task Assignment

### Story Point System

* 1 Story Point = ~1 day of work (relative to student workload)
* Points reflect complexity and time needed
* Most stories should be 3 points or less (completable within one biweekly)
* Scrum Masters discuss point estimates with developers
* If a story is > 3 points, break it down into smaller stories

### Task Assignment Process

* Scrum Masters create and assign tasks in GitHub Projects board
* Scrum Masters discuss with developers to:
  * Verify point estimates are accurate
  * Ensure developer has capacity
  * Adjust points if needed based on developer feedback
* Once assigned, move task to `In Progress` column

## General Procedures

### For Developers

1. View your tasks at: https://github.com/users/vibqetowi/projects/4/views/6
2. When starting work:
   * Find your assigned task
   * Create branch from the issue
   * Follow [Git Rules](./Git-Rules.md) for all coding work
3. When finished:
   * Open PR following Git Rules
   * Wait for reviews
   * Address any feedback

**Note:** Board management and task status updates are handled by Scrum Masters.

### Meetings

* **Scrum Master - Project Manager Meetings:** Weekly updates and feedback
* **Subteam Meetings:** Team Lead scheduled as needed. Tasks sized for ~3 days for sprint momentum
* **Bi-weekly Meetings (Panel Review & PR Management):**
  * **Purpose:** Team Leads present tasks ready for Pull Requests (PRs) to the *Panel of Peers* for collaborative review and merging
  * **Panel Definition:** Team Leads and Scrum Masters, fostering shared responsibility for code quality
  * **Attendance:** Open to all team members, but Team Leads *must* attend to present their team's tasks and participate in the peer review Panel
  * **Outcome:** Progress review, PR merging, issue resolution, and sprint alignment
  * **PR Closing:** PRs can only be merged and closed during these sessions by panelists

## Design Phase Procedures

* **User Stories & Tasks (Scrum Masters):** Write user stories, break into tasks, planning poker, dependency trees, sprint backlog population. Goal: Design tasks done in first 3 days of Sprint 1.
* **Design Outputs (System/UI/UX Designers):** Diagrams, operation contracts, ERDs, wireframes. Inputs for development; must be fast-tracked in Sprint 1.

## Development Phase Procedures

* **Task Assignment & Dependencies (Scrum Masters):** Ensure independent tasks in backlog for parallel development across Sprints 1 & 2 (based on design phase dependencies).
* **Pair Programming (Recommended):** Tasks sized for pairs (ideally with a Team Lead or Scrum Master in each pair). Team leads must present at the biweekly, so if there's no team lead in the sub unit, you must come to the biweekly.
* **Unit Testing - "Implement then Test, Immediately":** After implementing, *immediately* write unit tests (Jest). Create "Write Unit Tests" sub-task in Zenhub for tracking.

## Scrum Master Guidelines

* **Design Phase Task Size:** Solvable by one person to minimize dependencies and ensure fast design phase in Sprint 1.
* **Development Phase Task Size:** For teams of two, completable within Sprint 1 & early Sprint 2.
* **Unit Testing Sub-tasks:** Add "Write Unit Tests" sub-tasks to track unit testing. Once PR is done
* **Scrum Masters will ensure task dependencies and parent/child issue relationships are properly defined and managed.**

## Changelog

* **2025-02-11:** Changed merging rules to ensure completely tested code in main
* **2025-02-02 Story Point Update:** Team member met with a professional Scrum Master who shared industry practices. **Changes:** Story points now explicitly defined (1 point = ~1 day of student work), Scrum Masters discuss point estimates with developers to verify capacity and adjust if needed.
* **2025-01-25 Initial Doc:** After Sprint 1 review. Issues: Tasks were too big, weekly meetings insufficient to catch mistakes early. **Changes:** Tasks sized for 1-2 people, 3-day target; bi-weekly PR closing for better sprint visibility.
