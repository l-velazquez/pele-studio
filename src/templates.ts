export interface Template {
  id: string
  name: string
  description: string
  source: string
}

export const TEMPLATES: Template[] = [
  {
    id: 'architecture',
    name: 'Web architecture',
    description: 'Request flow through a typical stack',
    source: `flowchart LR
  user([Browser]) --> proxy[Traefik]
  proxy --> app[Django app]
  app --> cache[(Redis)]
  app --> db[(PostgreSQL)]
  app -. async .-> worker[Celery worker]
  worker --> db
  subgraph Dokploy
    proxy
    app
    worker
  end`,
  },
  {
    id: 'flowchart',
    name: 'Decision flow',
    description: 'Flowchart with branches',
    source: `flowchart TD
  A[Write Mermaid] --> B[Preview with Pele]
  B --> C{Looks good?}
  C -->|Yes| D[Pick a theme]
  C -->|No| A
  D --> E[Export PNG or SVG]`,
  },
  {
    id: 'sequence',
    name: 'Login sequence',
    description: 'Actors exchanging messages',
    source: `sequenceDiagram
  actor U as User
  participant W as Web app
  participant A as Auth API
  participant D as Database
  U->>W: Submit credentials
  W->>A: POST /login
  A->>D: Look up user
  D-->>A: User record
  alt valid password
    A-->>W: 200 + session token
    W-->>U: Redirect to dashboard
  else invalid
    A-->>W: 401
    W-->>U: Show error
  end`,
  },
  {
    id: 'er',
    name: 'Database model',
    description: 'Entity relationships',
    source: `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "ordered in"
  CUSTOMER {
    int id PK
    string name
    string email
  }
  ORDER {
    int id PK
    int customer_id FK
    date created_at
  }
  PRODUCT {
    int id PK
    string title
    decimal price
  }`,
  },
  {
    id: 'class',
    name: 'Class diagram',
    description: 'Types and inheritance',
    source: `classDiagram
  class Shape {
    +String name
    +area() float
  }
  class Circle {
    +float radius
    +area() float
  }
  class Rectangle {
    +float width
    +float height
    +area() float
  }
  Shape <|-- Circle
  Shape <|-- Rectangle`,
  },
  {
    id: 'state',
    name: 'State machine',
    description: 'Order lifecycle',
    source: `stateDiagram-v2
  [*] --> Pending
  Pending --> Paid: payment received
  Pending --> Cancelled: timeout
  Paid --> Shipped
  Shipped --> Delivered
  Delivered --> [*]
  Cancelled --> [*]`,
  },
  {
    id: 'gantt',
    name: 'Project plan',
    description: 'Gantt timeline',
    source: `gantt
  title Diagram Studio MVP
  dateFormat YYYY-MM-DD
  section Editor
    Mermaid input + preview :a1, 2026-11-02, 7d
    Zoom and pan            :a2, after a1, 3d
  section Design
    Theme presets           :b1, after a1, 5d
    Color studio            :b2, after b1, 5d
  section Polish
    Export options          :c1, after b2, 4d
    Templates + autosave    :c2, after c1, 3d`,
  },
  {
    id: 'pie',
    name: 'Pie chart',
    description: 'Uses the series colors',
    source: `pie title Where the time goes
  "Layout" : 12
  "Styling" : 38
  "Exporting" : 27
  "Fixing fonts" : 23`,
  },
  {
    id: 'mindmap',
    name: 'Mind map',
    description: 'Brainstorm a topic',
    source: `mindmap
  root((Diagram Studio))
    Write
      Mermaid
      Templates
    Customize
      Themes
      Fonts
      Colors
    Export
      PNG
      SVG
      Transparent`,
  },
  {
    id: 'git',
    name: 'Git branches',
    description: 'Feature branch workflow',
    source: `gitGraph
  commit
  branch feature
  checkout feature
  commit
  commit
  checkout main
  merge feature
  commit`,
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Milestones over time',
    source: `timeline
  title Release history
  2024 : Prototype
  2025 : Public beta : Theme studio
  2026 : 1.0 launch : Plugin API`,
  },
  {
    id: 'quadrant',
    name: 'Quadrant chart',
    description: 'Prioritization matrix',
    source: `quadrantChart
  title Feature prioritization
  x-axis Low effort --> High effort
  y-axis Low impact --> High impact
  quadrant-1 Plan carefully
  quadrant-2 Do first
  quadrant-3 Maybe later
  quadrant-4 Avoid
  Presets: [0.2, 0.85]
  Export: [0.35, 0.9]
  Drag editing: [0.9, 0.55]
  Accounts: [0.7, 0.15]`,
  },
]

export const DEFAULT_SOURCE = TEMPLATES[1].source
