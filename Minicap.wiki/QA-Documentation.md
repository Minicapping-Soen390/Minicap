# QA Documentation

**Table of Contents**

* [QA Test Procedures](#qa-test-procedures)
  * [Introduction](#introduction)
  * [QA Phases](#qa-phases)
    * [Phase 1: Test Planning &amp; Preparation (6 Days - Before Coding)](#phase-1-test-planning--preparation-6-days---before-coding)
    * [Phase 2: Unit &amp; Integration Testing (19 Days - During Coding)](#phase-2-unit--integration-testing-19-days---during-coding)
    * [Phase 3: Quality Reporting (3 Days - Release Preparation)](#phase-3-quality-reporting-3-days---release-preparation)
  * [CI &amp; CD - GitHub Actions](#ci--cd---github-actions)
  * [6.1 Unit Testing (Jest &amp; React Testing Library)](#61-unit-testing-jest--react-testing-library)
  * [6.2 System Testing (Appium)](#62-system-testing-appium)
  * [Resources](#resources)
  * [Handling Bug Reports](#handling-bug-reports)
  * [Bug Strategies](#bug-strategies)
* [Unit Testing for Components](#unit-testing-for-components)
  * [1. Testing File Structure](#1-testing-file-structure)
  * [2. What Do I Even Test?](#2-what-do-i-even-test)
  * [3. Snapshot Testing](#3-snapshot-testing)
  * [4. Functional Unit Tests](#4-functional-unit-tests)
    * [Handy Links for Unit Testing](#handy-links-for-unit-testing-1)
  * [5. Gotcha&#39;s and Common Questions](#5-gotchas-and-common-questions)
    * [Testing Functional Classes with React Hooks](#testing-functional-classes-with-react-hooks-1)

---

## QA Test Procedures `<a name="qa-test-procedures"></a>`

### Introduction `<a name="introduction"></a>`

This section outlines the test procedures for the Quality Assurance (QA) team, integrated within the 28-day release cycle. QA activities are structured in three phases, ensuring comprehensive testing throughout the development process.  Refer to the main "Team Work Procedures" document for the overall project workflow.

### QA Phases `<a name="qa-phases"></a>`

* **Phase 1: Test Planning & Preparation (6 Days - Before Coding) `<a name="phase-1-test-planning--preparation-6-days---before-coding"></a>`**

  * **Timeline:** Days 1-6 of the 28-day release cycle (overlapping with Design Phase and early Code Phase of Sprint 1).
  * **Activities:**
    * Write system tests (automated, to run on `main` branch and ideally for pre-commit hooks on feature branches in future releases).
    * Write automated tests where possible based on user stories and finalized initial code structure.
    * Prepare unit test frameworks and structures in anticipation of development.
    * Review user stories and initial code to understand testing requirements.
* **Phase 2: Unit & Integration Testing (19 Days - During Coding) `<a name="phase-2-unit--integration-testing-19-days---during-coding"></a>`**

  * **Timeline:** Days 7-25 of the 28-day release cycle (spanning the majority of Code Phase in Sprint 1 and Sprint 2).
  * **Workflow:**
    1. **PR Opened & Moved to "Review/QA":** Developer completes a task, opens a Pull Request (PR) on GitHub, and moves the corresponding task to the `Review/QA` pipeline in Zenhub.
    2. **QA Test Issue Creation and Workflow:** Once a Pull Request (PR) is opened and moved to the `Review/QA` pipeline, the Scrum Master will create a dedicated *QA testing issue*.  This is done by generating a *sub-issue* under the original development task within Zenhub, and labeling it "Test - {original issue name}". This "Test" issue becomes available in the `Sprint Backlog` pipeline, signaling to the QA team that they can start testing the code in the PR.  The QA team will then proceed with testing.  If tests pass, QA will submit a Pull Request containing their test code and GIFs demonstrating successful test results. Conversely, if tests fail or bugs are identified, QA will open a new bug issue to document their findings.
    3. **QA Testing on Sub-Issue:** QA team members take ownership of the sub-issue and perform the following:
       * **Run Unit Tests:** Execute the unit tests written by developers on the PR branch.
       * **Perform System Tests:** Run automated system tests (and manual system tests as needed).
       * **Code Review (Optional):**  Review code changes in the PR for potential quality or testing concerns.
    4. **QA Decision and Actions:** Based on test results:
       * **Tests Pass:** If unit tests and system tests pass, and no critical issues are found, QA will:
         * **Close the QA sub-issue** in Zenhub, indicating testing completion.
         * **Approve the Pull Request** on GitHub, signaling that the code is ready to be merged.
       * **Tests Fail or Bugs Found:** If unit tests or system tests fail, or if QA identifies bugs, QA will:
         * **Open a Bug Report:** Create a new issue in the `Sprint Backlog` pipeline in Zenhub, detailing the bug, steps to reproduce, and failure information.
         * **Reject/Request Changes to the Pull Request:**  Communicate to the developer via the PR comments the reasons for rejection or requested changes.  The PR remains open for developer updates.
* **Phase 3: Quality Reporting (3 Days - Release Preparation) `<a name="phase-3-quality-reporting-3-days---release-preparation"></a>`**

  * **Timeline:** Days 25-27 of the 28-day release cycle (Report Phase at the end of Sprint 2).
  * **Activities:**
    * Generate quality reports for the release presentation.
    * Reports should include metrics from SonarQube and CodeCov, summarizing code quality, test coverage, and identified issues.
    * Compile a summary of testing activities and overall quality assessment for the release.

### CI & CD - GitHub Actions `<a name="ci--cd---github-actions"></a>`

We utilize the following tools within GitHub Actions for Continuous Integration and Continuous Delivery:

* **CodeCov:** Code coverage reporting and analysis.
* **SonarQube:** Automated code quality analysis, bug and vulnerability detection.
* **SuperLinter:** Code linting and style checking.
* **Node.js project workflows:** For build, test, and deployment automation of Node.js based projects (React Native).

### 6.1 Unit Testing (Jest & React Testing Library) `<a name="61-unit-testing-jest--react-testing-library"></a>`

* **Frameworks:** Jest (testing framework), React Testing Library (for React Native component testing).
* **Techniques:**
  * Assertions to verify expected outcomes.
  * Snapshot testing to detect UI changes.
  * Mocking functions, database queries, modules, API calls, and dependencies to isolate unit tests.
* **Scope:** Unit tests cover:
  * React Native components.
  * API call logic.
  * Individual functions.
  * Navigation flows.

### 6.2 System Testing (Maestro) `<a name="62-system-testing-maestro"></a>`

* **Framework**: For system testing, we will use Maestro, an open-source automation framework for testing mobile applications. Maestro is especially suited for React Native apps because it interacts directly with native components, supports both iOS and Android platforms, and provides robust tools for automating end-to-end workflows and capturing test execution (e.g., as videos or GIFs).
* **Purpose**: The goal of system testing is to validate the full functionality of individual features (user stories) by simulating user interactions with the application. This ensures that the app behaves as intended and meets user requirements.
* **Testing Workflow**:
  For each system test, we will follow these steps:

  * Define the User Story:
    Identify the functionality being tested (e.g., user login, map navigation, etc.).
  * Develop Test Steps
    Create a series of steps that simulate user behavior:
    * Example: "User opens the app → logs in → searches for a location → navigates to the destination."
  * Write Automated Test Scripts
    Use Maestro to automate these steps. The scripts will:
    * Launch the app on a simulator/emulator.
    * Interact with UI elements like buttons, text fields, and maps.
    * Validate expected outcomes (e.g., successful login, correct navigation path).
  * Execute the Tests
    Tests will run automatically on both iOS and Android platforms.
    Record the test execution as a video or GIF for documentation.
  * Analyze Results
    Verify whether the expected outcomes match the actual results.
    Address any errors or regressions by filing bug reports.
  * Integrate with CI/CD
    System tests will be triggered on the main branch during the CI/CD pipeline.
    Future updates will include implementing pre-commit hooks to run system tests on feature branches.

### Resources `<a name="resources"></a>`

* **React Testing Library:** [https://testing-library.com/docs/react-testing-library/intro/](https://testing-library.com/docs/react-testing-library/intro/)
* **Jest:** [https://jestjs.io/docs/getting-started](https://jestjs.io/docs/getting-started)
* **CodeCov:**
  * [https://github.com/apps/codecov](https://github.com/apps/codecov)
  * [https://docs.codecov.com/docs/quick-start](https://docs.codecov.com/docs/quick-start)
  * [https://docs.codecov.com/docs/github-tutorial](https://docs.codecov.com/docs/github-tutorial)
* **SonarQube:** [https://www.sonarsource.com/products/sonarqube/](https://www.sonarsource.com/products/sonarqube/)

---

**Note:** Implementing pre-commit hooks on feature branches to run system tests helps ensure code quality early in the development cycle by preventing commits that break existing system functionality, embodying a "don't break what's already there" approach to TDD.

### Handling Bug Reports `<a name="handling-bug-reports"></a>`

- When creating a bug report, ensure to fill it out properly.
- Once filled out, present the bug during scrum.

### Bug Strategies `<a name="bug-strategies"></a>`

We have two strategies to handle bugs:

**Strategy #1: `Fix it now`**

- For bugs that break the user's UX
- For bugs that break the app
- Immediately pulled into the sprint, and a person must be assigned to fix this bug ASAP

**Strategy #2: `Fix it later`**

- For bugs that don't break the user's UX
- For bugs that don't need immediate attention and can be pulled into future sprints

## Unit Testing for Components `<a name="unit-testing-for-components"></a>`

### 1. Testing File Structure `<a name="1-testing-file-structure"></a>`

Say you have your component ready. The very first thing you want to do is set up a test suite for good practices.

* `describe`: test suite encompassing individual tests
* `it`: individual tests

tsx
describe("Test suite component", () => {
  it("description/expectation of your test #1", () => {
    ...
  });

  it("description/expectation of your test #2", () => {
    ...
  });
  ...
});

### 2. What Do I Even Test? `<a name="2-what-do-i-even-test"></a>`

* You can see multiple example unit tests in our [tests folder](https://github.com/RGPosadas/WayFinder/tree/develop/__tests__).
* You may be asking yourself: `what am I even supposed to be testing anyway?`
* Jest has you covered! Run `npm test --coverage` and Jest will tell you which lines you need to cover. For example, this code snippet is telling you to test the uncovered lines in order to reach 100% code coverage.

-------------------------------------|---------|----------|---------|---------|-----------------------------------------------

| File                            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| ------------------------------- | ------- | -------- | ------- | ------- | ----------------- |
| All files                       | 56.9    | 32.14    | 26.92   | 58.93   |                   |
| components/building-highlights  | 63.64   | 66.67    | 40      | 63.64   | 23,24,41,49       |
| components/building-information | 38.1    | 7.14     | 23.08   | 38.1    | 67,68,73          |
