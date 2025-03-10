# Backend Stack

## Background

Our backend stack selection was influenced by several factors including technical limitations, project philosophy, and practical considerations.

### Initial MongoDB Approach

Initially, we attempted to use MongoDB because our database administrator was confident in this solution. However, we encountered several issues during implementation.

This prompted our Scrum team to investigate alternatives. We discovered that Android locally uses SQLite, which already introduces a conversion problem form SQL to NoSQL

## Reconsidering Our Requirements

### Server Backup Necessity

We questioned the need for MongoDB: "Do we really need server backup?" Since this project is primarily a demonstration, we don't require extensive synchronization capabilities.

### Use Case Analysis

We examined our actual use cases and realized server-side synchronization is largely unnecessary:
- **Maps**: Users can download maps. When new versions are available, we simply push them for users to download.
- **Calendar**: We make refresh requests to Google and then download data locally.
- **Routing**: We make requests to Google Maps.

The application is designed to be usable offline, particularly for indoor navigation scenarios which are intended to run entirely on the device.

## Simplified Approach

These factors led us to abandon server-side synchronization. Even user accounts can function offline without the need for centralized storage.

### JSON-Based Data Structure

Since we initially defined our data in JSON files, we decided to maintain this approach. The MVVM pattern is still applied (see [MVVM guide](https://github.com/vibqetowi/Minicap/wiki/MVVM-guide)), but requests simply read from JSON files.

This approach is appropriate since our priority is creating a functional demonstration. A more robust backend would utilize SQLite, but rapid prototyping requirements made this impractical.

### MMKV Exploration

We explored using the MMKV protocol for storage due to its promising features but eventually abandoned it due to delays and the level of knowledge transfer required for the whole team, as determined by the Scrum team (see [issue #160](https://github.com/vibqetowi/Minicap/issues/160)).

## Current Implementation

Our hybrid approach is deemed acceptable due to all the points mentioned above.

In addition to the mocked API calls to JSON files through MVVM, our external APIs include:
- Google Maps API
- Google Calendar API (for retrieving routes and user schedules)
