# Guide to System Diagrams

# Guide to System Diagrams

## Overview

System diagrams are now maintained externally as separate .puml files under the "plantuml/src" folder.
A new processing system is in place:
1. Edit the individual .puml files (e.g., plantuml/src/use-case-diagram.puml).
2. Run the script:
   ```bash
   ./generate-diagrams.sh
   ```
   This will generate the corresponding PNG images in plantuml/img/.
3. The markdown files (e.g., System-Diagrams.md) reference these generated images using the path plantuml/img/{diagram-name}.png.

## Design Philosophy

### MVVM Architecture

- Use interfaces to define clear contracts between layers
- Keep models technology-agnostic (no framework-specific types)
- Avoid exposing implementation details in interfaces
- ViewModels handle state management and business logic
- Models represent pure domain concepts

### Database Design

- Avoid embedding foreign keys in entities - use relationships instead
- Prefer association classes over complex relationships
- Design for reusability - extract common patterns into base classes/interfaces
- Use inheritance and composition to model "is-a" and "has-a" relationships
- Keep entities focused and cohesive - split large entities when appropriate

### Best Practices

- Follow Single Responsibility Principle
- Make relationships explicit through association classes
- Use enums for fixed value sets
- Document constraints and business rules
- Design for extensibility

## PlantUML Guide

### Basic Elements

#### Class Notation

![Basic Elements](plantuml/img/basic-elements.png)

```plantuml
@startuml
abstract        abstract
abstract class  "abstract class"
annotation      annotation
circle          circle
()              circle_short_form
class           class
class           class_stereo  <<stereotype>>
diamond         diamond
<>              diamond_short_form
entity          entity
enum            enum
exception       exception
interface       interface
metaclass       metaclass
protocol        protocol
stereotype      stereotype
struct          struct
@enduml
```

#### Relationships

![Relationships](plantuml/img/relationships.png)

| Type           | Symbol | Purpose                                       |
|----------------|--------|-----------------------------------------------|
| Extension      | <\|--  | Specialization of a class in hierarchy        |
| Implementation | <\|..  | Realization of an interface by a class        |
| Composition    | *--    | Part cannot exist without the whole           |
| Aggregation    | o--    | Part can exist independently of the whole     |
| Dependency     | -->    | Object uses another object                    |
| Dependency     | ..>    | Weaker form of dependency                     |

Replace -- with .. for dotted lines.

#### Examples

![Relationships Example](plantuml/img/relationships.png)

```plantuml
@startuml
Class01 <|-- Class02    
Class03 *-- Class04     
Class05 o-- Class06     
Class07 .. Class08      
Class09 -- Class10      
@enduml
```

#### Association Classes

![Association Classes](plantuml/img/association-classes.png)

```plantuml
@startuml
class Student
class Course
class Enrollment {
  enrollmentDate: Date
  grade: String
}

Student "1" -- "many" Enrollment
Enrollment "many" -- "1" Course
@enduml
```

### Styling

![Styling](plantuml/img/styling.png)

#### Skinparam Settings

Use skinparam to control diagram appearance:

```plantuml
@startuml
skinparam class {
    BackgroundColor White
    ArrowColor Black
    BorderColor Black
}
skinparam stereotypeCBackgroundColor Yellow
skinparam stereotypeCBorderColor Brown

class Example
@enduml
```

Common skinparam options:
- `BackgroundColor`
- `BorderColor`
- `ArrowColor`
- `FontName`
- `FontSize`
- `Shadowing`

### Advanced Features

#### Labels and Cardinality

![Labels](plantuml/img/labels.png)

```plantuml
@startuml
Class01 "1" *-- "many" Class02 : contains
Class03 o-- Class04 : aggregation
Class05 --> "1" Class06
@enduml
```

#### Visibility Modifiers

![Visibility](plantuml/img/visibility.png)

- `-` private
- `#` protected
- `~` package private
- `+` public

```plantuml
@startuml
class Dummy {
  -private field
  #protected field
  ~package method()
  +public method()
}
@enduml
```

#### Notes

![Notes](plantuml/img/notes.png)

```plantuml
@startuml
class Foo
note left: A note can be\nplaced left
note right: Or right
note top: Or top
note bottom: Or below
@enduml
```

#### Stereotypes

![Stereotypes](plantuml/img/stereotypes.png)

```plantuml
@startuml
class Object << general >>
class User << entity >>
class Order << value object >>
@enduml
```

### Layout Tips

#### Direction

![Direction](plantuml/img/direction.png)

```plantuml
@startuml
' Top to bottom (default)
top to bottom direction
class A
class B
A --> B

' Left to right
left to right direction
class C
class D
C --> D
@enduml
```

#### Grouping

![Grouping](plantuml/img/grouping.png)

```plantuml
@startuml
together {
  class A
  class B
}
A --> B
@enduml
```

#### Hidden Links

![Hidden](plantuml/img/hidden.png)

Use [hidden] to force layout without showing relationship:

```plantuml
@startuml
class A
class B
A -[hidden]-> B
@enduml
```

## Use Case Diagrams

### Complete Example

![Use Case](plantuml/img/use-case.png)

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle
actor customer
actor clerk
rectangle checkout {
  customer -- (checkout)
  (checkout) .> (payment) : include
  (help) .> (checkout) : extends
  (checkout) -- clerk
}
@enduml
```

This example demonstrates key concepts in use case diagrams:

1. **Direction**: `left to right direction` makes the diagram read horizontally
2. **Style**: `skinparam packageStyle rectangle` sets visual style
3. **Actors**: External users (`customer` and `clerk`)
4. **System Boundary**: `rectangle checkout { }` groups related use cases
5. **Relationships**:
   - Solid line (`--`): Basic association between actor and use case
   - Dotted arrow with open head (`.>`): Include or extend relationship
   - Labels: `: include` and `: extends` specify relationship type

### Basic Elements

#### Actors

Actors can be defined using:
- `:Actor Name:` syntax
- `actor` keyword
- Optional alias with `as` keyword

```plantuml
@startuml
:First Actor:
:Another\nactor: as Man2
actor Woman3
actor :Last actor: as Person1
@enduml
```

#### Use Cases

Use cases can be defined using:
- Parentheses `(Use Case Name)`
- `usecase` keyword
- Optional alias with `as` keyword

```plantuml
@startuml
(First usecase)
(Another usecase) as (UC2)
usecase UC3
usecase (Last\nusecase) as UC4
@enduml
```

### Relationships

- Basic association: `->`
- Include relationship: `..>`
- Extend relationship: `<..`
- Generalization: `--|>`

```plantuml
@startuml
User -> (Login)
(Checkout) ..> (Payment) : include
(Help) <.. (Checkout) : extend
Admin --|> User
@enduml
```

### Packages

Group related elements using packages:

```plantuml
@startuml
package "Shopping Cart" {
  (Add Item)
  (Remove Item)
  (Checkout)
}

User -> (Add Item)
User -> (Remove Item)
User -> (Checkout)
@enduml
```

### Notes and Comments

Add explanatory notes:

```plantuml
@startuml
:User: -> (Login)
note right of (Login)
  Enter username
  and password
end note
@enduml
```

### Best Practices

1. Keep diagrams focused and simple
2. Use meaningful names for actors and use cases
3. Group related elements in packages
4. Add notes to clarify complex interactions
5. Use consistent naming conventions:
   - Actors only connect to main use cases (manage/view/get)
   - Use includes/extends for sub-functionality
   - Accessibility features should extend both indoor/outdoor navigation
6. Maintain proper spacing and layout
7. Include only relevant relationships
8. Document assumptions and constraints
