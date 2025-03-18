# Testing Plan and Report

## Table of Contents
- [Release 1](#release-1)
  - [1.6.1 Unit Testing](#161-unit-testing)
  - [1.6.2 Test Code Coverage](#162-test-code-coverage)
  - [1.6.3 Acceptance Testing](#163-acceptance-testing)
  - [1.6.4 System Tests](#164-system-tests)
  - [1.6.6 SonarQube Report](#166-sonarqube-report)

- [Release 2](#release-2)
  - [6.1 Unit Testing](#261-unit-testing)
  - [6.2 Test Code Coverage](#262-test-code-coverage)
  - [6.3 Acceptance Testing](#263-acceptance-testing)
  - [6.4 System Tests](#264-system-tests)
  - [6.5 Usability Testing](#264-system-tests)
  - [6.6 SonarQube Report](#266-sonarqube-report)

## 1.6.1 Unit Testing

For unit testing, we will be using **Jest** with **React Testing Library** as React Native comes with built-in support for Jest. React Testing Library will be used in tests to render React Native components, querying elements, and simulating user interactions. Tests will include assertions, snapshot testing, and mocking functions, database queries, modules, API calls, and dependencies. We will be using these tools to test React components, API calls, functions, and navigation. We will also be using diverse practices like TDD and testing techniques like IDM, Monkey, Graph, Logic Coverage, and Jest.

### Sprint 1

- No unit tests written yet, as feature implementation has not started.
- Mocking will be used to simulate real dependencies, define controlled outputs, and verify interactions with native modules.
- Ensures components and business logic are tested independently, without relying on external systems like databases, APIs, or device-specific features.

### Sprint 2

- **20 unit tests** written covering API calls, components, and Feature 1: *Exploring the map campuses*.
- Unit tests have been implemented for each issue in the **user stories**.
- **Sign-up and login features** have not been tested yet as they were not fully completed.
- Test folder: ```https://github.com/vibqetowi/Minicap/tree/108-ut---task-79/src/__test__```
#### 📄 Unit Tests Report:

- Produced by Worflow: 
[Unit Test Report](https://github.com/vibqetowi/Minicap/actions/runs/13272775553/job/37055902406)
- Run ```npm run test```
![image](https://github.com/user-attachments/assets/6dbf6674-f1fb-49bd-8a85-3a6011dbe809)
---

## 1.6.2 Test Code Coverage

Code coverage is monitored through **Codecov**.

📊 **[Codecov Report](https://app.codecov.io/gh/AsifAliKhan2001/Minicap?displayType=list)**
- Screenshots from ```src/coverage/*.html```
![image](https://github.com/user-attachments/assets/9ba3f607-620d-424a-9d6f-7f8518c19256)

---

## 1.6.3 Acceptance Testing
* 1.1 - Support both SGW and Loyola Campus Maps
* 1.2 - Distinguish Campus Buildings from City Buildings
* 1.3 - Toggle Between SGW and Loyola Maps
* 1.4 - Show Current Location Building
* 1.5 - Show Additional Building Information

Acceptance testing is documented and approved by the **Teaching Assistant (TA).**

📋 **[Acceptance Testing Document](https://docs.google.com/spreadsheets/d/18Wtc-ROJasvmf_37tXjRKmPG577I3O61qfTMKf7J0ac/edit?gid=0#gid=0)**


---

## 1.6.4 System Tests

### 🎥 Video Documentation:
📌 **[Feature 1 System Test Video](https://github.com/user-attachments/assets/c2706b15-7545-45bc-bb8a-baa7ae5e55f3)**



### System Testing Approach

- For End-to-End (E2E) testing, we are using Maestro with a GitHub Actions workflow to automate tests (Have an issue currently with the setup) and generate GIF videos for each user test.
- System tests are developed using automation tools to validate the overall system functionality.
- Testing involves interacting with the system itself to verify its behavior under real-world conditions.
- A set of steps is designed to ensure that each feature (user story) works as expected.
- Each system test is recorded and stored in the repository for documentation and validation purposes.

E2E Tests: ```https://github.com/vibqetowi/Minicap/tree/End-to-end-testing/src/maestro```

### Acceptance Test GIFs

#### US 1.1
Links to [US 1.1 issue](https://github.com/vibqetowi/Minicap/issues/20)
![Test GIF](https://raw.githubusercontent.com/vibqetowi/Minicap/End-to-end-testing/src/maestro/test1-1.gif)

#### US 1.2
Links to [US 1.2 issue](https://github.com/vibqetowi/Minicap/issues/22)

#### US 1.3
Links to [US 1.3 issue](https://github.com/vibqetowi/Minicap/issues/23)
![Test GIF](https://raw.githubusercontent.com/vibqetowi/Minicap/End-to-end-testing/src/maestro/test1-3.gif)


#### US 1.4
Links to [US 1.4 issue](https://github.com/vibqetowi/Minicap/issues/25)

#### US 1.5
Links to [US 1.5 issue](https://github.com/vibqetowi/Minicap/issues/24)



---

## 1.6.6 SonarQube Report

### 🛡️ Security Vulnerabilities

![Picture1](https://github.com/user-attachments/assets/99e49dd7-a0a1-4196-bcb9-73f257dc7d6e)

As per SonarQubes analysis, we have no security vulnerabilities in our codebase and have maintained a security rating of “A”, attributed when there are no vulnerabilities. Because we have had no vulnerabilities, we have had no need for code remediation efforts.

### 🔁 Code Duplication

![Picture2](https://github.com/user-attachments/assets/ff3fb87c-c2f1-4564-bbfc-634ce0c283a0)

Here we observe a duplicated code density on our overall codebase of 1.6%, with 505 duplicated lines and 23 duplicated code blocks. This is a very strong rating, as our duplication can be traced back to index.html files in our coverage module. This shows we have minimal code duplication, and for now there is no need to divert more effort into ensuring no code duplication. 


### 📊 Code Complexity

![Picture3](https://github.com/user-attachments/assets/7c034a9f-2d37-40e9-b7aa-e16c8e88515c)

This graph shows our cyclomatic code complexity over time, with our complexity peaking at 384, and settling back to 243 for the latest release. The file with the biggest complexity is at 24, which means it is “complex and high risk” (Tom McCabe, Software Quality Metrics to Identify Risk). 106 of our total rating comes from our viewmodel module, 64 from our coverage module and 46 from our app module. This shows that our complexity is highly concentrated in few modules, and few key files, yet our highest file complexitiy sits at 24. As of right now this raises no flags, and no refactoring is needed.

### 🛠️ Issues Report

SonarQube has identified 162 total issues on our latest release, culminating in a technical debt of 1d4h at a ratio of 0.8%. 143 of those issues originate from our coverage module. 62 of those issues are in the file ```Minicap/src/coverage/lcov-report/components/ThemedText.tsx.html``` where SonarQube flags code duplication or intentionality/consistency issues on multiple lines as an attribute which is used many times has been deprecated. This does not affect functionality, and are very minor issues. Only 21 of our SonarQube issues are marked as high severity, all of which flag a misuse of var (and to use const or let instead). As such our issues affect our clean code attribute but not our functionality or debugging needs.
In our issues we have 5 listed as potential bugs, 4 of which state a missing ```<th>``` header to a table, and the last potential bug flagging a missing generic font family. These are quickly fixable. 

---

This document provides an **overview of the testing strategy, reports, and analysis** to ensure the **quality and security** of our system throughout development.

# Release 2

## 2.6.1 Unit Testing
Unit testing details for Release 2.

## 2.6.2 Test Code Coverage
Test code coverage for Release 2.

## 2.6.3 Acceptance Testing
Acceptance testing for Release 2.

## 2.6.4 System Tests
System tests for Release 2.

## 2.6.5 Usability testing
Usability tests for Release 2.

## 2.6.6 SonarQube Report
SonarQube details for Release 2.

Issues report for Release 2.





