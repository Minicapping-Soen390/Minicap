# **Meeting:** Post Presentation Debrief

**Date:** 2025-03-12
**Time:** 16h00 - 16h30
**Purpose:** Sprint Retrospective Review
**Attendees:** Minh, Edward, Hudson, Younes, Allaye
**Absent:** /

## **Summary**

Team met to discuss architectural improvements and quality assurance procedures following the presentation. Key focus areas included code refactoring using design patterns and enhancing the QA process.

## **Discussion Points**

### Architecture & Code Design

- Refactoring needs for CampusMap.tsx component
- Recommended design patterns for implementation
- Ongoing issues with "polygon shape invalid" error
- UI performance issues causing freezing

### Quality Assurance Process

- New procedures for the QA team
- Bug reporting standards
- Testing approach

## **Key Decisions**

### Design Pattern Implementation

- **Facade Pattern**: Will be used for refactoring CampusMaps.tsx (implementing MVVM architecture with repositories)
- **Strategy Pattern**: To be implemented for transportation method functions
- **Observer Pattern**: Team to verify if it's already being used correctly

### QA Process Improvements

- QA team will create formal issues for all discovered bugs
- Bug reports must include the problematic code section
- More thorough testing for UI transitions to identify freezing points

## **Action Items**

| Task                                                    | Owner            | Notes                              |
| ------------------------------------------------------- | ---------------- | ---------------------------------- |
| Implement Facade pattern for CampusMaps.tsx refactoring | Edward           | Use MVVM architecture approach     |
| Implement Strategy pattern for transportation methods   | Safaa            | Focus on mode selection logic      |
| Document design pattern decisions                       | Scrum Team       | Add to technical documentation     |
| Investigate UI freezing between page transitions        | Development Team | Priority issue                     |
| Debug persistent "polygon shape invalid" error          | Development Team | Check map rendering logic          |
