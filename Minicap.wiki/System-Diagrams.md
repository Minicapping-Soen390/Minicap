# System Diagrams

## Use Case Diagram

![Use Case Diagram](plantuml/img/use-case-diagram.png)

## Component Diagram

![Component Diagram](plantuml/img/component-diagram.png)

## Entity Relationship Diagram (ERD)

### Original ERD
![ER Diagram](plantuml/img/erd.png)

### Complete System ERD (with Shuttle Integration)
![Complete System ER Diagram](plantuml/img/complete-system-erd.png)

This updated ERD includes all system entities and their relationships, including the shuttle bus integration feature. Key additions include:
- Shuttle-related entities (ShuttleSchedule, ShuttleStop, Shuttle, ShuttleDeparture, ShuttleRoute)
- New enums (ShuttleStatus, CampusType)
- Integration with existing entities (Building, Route, Location)
- Complete relationship mapping between shuttle and core system components

## Domain Model

![Domain Model](plantuml/img/domain-model.png)
