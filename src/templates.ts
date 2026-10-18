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
  {
    id: 'c4',
    name: 'C4 components',
    description: 'Software architecture in C4 notation',
    source: `C4Component
title Component diagram for Internet Banking System - API Application

Container(spa, "Single Page Application", "javascript and angular", "Provides all the internet banking functionality to customers via their web browser.")
Container(ma, "Mobile App", "Xamarin", "Provides a limited subset to the internet banking functionality to customers via their mobile device.")
ContainerDb(db, "Database", "Relational Database Schema", "Stores user registration information, hashed authentication credentials, access logs, etc.")
System_Ext(mbs, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

Container_Boundary(api, "API Application") {
    Component(sign, "Sign In Controller", "MVC Rest Controller", "Allows users to sign in to the internet banking system")
    Component(accounts, "Accounts Summary Controller", "MVC Rest Controller", "Provides customers with a summary of their bank accounts")
    Component(security, "Security Component", "Spring Bean", "Provides functionality related to singing in, changing passwords, etc.")
    Component(mbsfacade, "Mainframe Banking System Facade", "Spring Bean", "A facade onto the mainframe banking system.")

    Rel(sign, security, "Uses")
    Rel(accounts, mbsfacade, "Uses")
    Rel(security, db, "Read & write to", "JDBC")
    Rel(mbsfacade, mbs, "Uses", "XML/HTTPS")
}

Rel_Back(spa, sign, "Uses", "JSON/HTTPS")
Rel(spa, accounts, "Uses", "JSON/HTTPS")

Rel(ma, sign, "Uses", "JSON/HTTPS")
Rel(ma, accounts, "Uses", "JSON/HTTPS")

UpdateRelStyle(spa, sign, $offsetY="-40")
UpdateRelStyle(spa, accounts, $offsetX="40", $offsetY="40")

UpdateRelStyle(ma, sign, $offsetX="-90", $offsetY="40")
UpdateRelStyle(ma, accounts, $offsetY="-40")

    UpdateRelStyle(sign, security, $offsetX="-160", $offsetY="10")
    UpdateRelStyle(accounts, mbsfacade, $offsetX="140", $offsetY="10")
    UpdateRelStyle(security, db, $offsetY="-40")
    UpdateRelStyle(mbsfacade, mbs, $offsetY="-40")`,
  },
  {
    id: 'architecture-services',
    name: 'Cloud services',
    description: 'Grouped services with icons',
    source: `architecture-beta
    group sources(cloud)[Sources]
        service src_a(server)[Source A] in sources
        service src_b(server)[Source B] in sources
        service src_c(server)[Source C] in sources

    group storage(database)[Storage]
        service db_one(database)[DB One] in storage
        service db_two(database)[DB Two] in storage
        service db_three(database)[DB Three] in storage

    group output(disk)[Output]
        service brief(disk)[Brief] in output
        service analyst(server)[Analyst] in output
        service delivery(cloud)[Delivery] in output

    src_a:B --> T:db_one
    src_b:B --> T:db_two
    src_c:B --> T:db_three
    db_two:B --> T:brief
    brief:R --> L:analyst
    analyst:R --> L:delivery

    align row src_a src_b src_c
    align row db_one db_two db_three
    align row brief analyst delivery

    align column src_a db_one
    align column src_b db_two brief
    align column src_c db_three`,
  },
  {
    id: 'block',
    name: 'Block layout',
    description: 'Columns and nested blocks',
    source: `block
  columns 3
  a:3
  block:group1:2
    columns 2
    h i j k
  end
  g
  block:group2:3
    %% columns auto (default)
    l m n o p q r
  end`,
  },
  {
    id: 'swimlane',
    name: 'Swimlane',
    description: 'Process across teams',
    source: `swimlane-beta LR
  subgraph Customer
    request[Request service]
    receive[Receive update]
  end

  subgraph Support
    triage[Triage request]
    answer[Send answer]
  end

  subgraph Engineering
    investigate[Investigate issue]
    fix[Prepare fix]
  end

  request --> triage
  triage -->|Known issue| answer
  triage -->|Needs code change| investigate
  investigate --> fix --> answer
  answer --> receive`,
  },
  {
    id: 'agentflow',
    name: 'Agent flow',
    description: 'Pipeline of agent steps',
    source: `agentflow-beta TB
  flow intake["Intake"]
    receive["Receive request"]@{ shape: input }
  end

  flow processing["Processing"]
    validate["Validate"]@{ shape: task }
    enrich["Enrich"]@{ shape: task }
    validate --> enrich
  end
  processing@{ view: "collapsed" }

  flow output["Output"]
    publish["Publish"]@{ shape: action }
  end

  receive --> validate
  enrich --> publish`,
  },
  {
    id: 'eventmodeling',
    name: 'Event model',
    description: 'Commands, events, and processors',
    source: `eventmodeling

timeframe 01 ui CartUI
timeframe 02 command AddItem
timeframe 03 event ItemAdded

resetframe 04 event External.InventoryChanged
timeframe 05 processor InventoryProcessor
timeframe 06 command ChangeInventory
timeframe 07 event Cart.InventoryChanged`,
  },
  {
    id: 'requirement',
    name: 'Requirements',
    description: 'Requirements and what satisfies them',
    source: `requirementDiagram
  requirement checkout_req {
    id: 1
    text: Orders must be payable online.
    risk: high
    verifymethod: test
  }
  functionalRequirement payment_req {
    id: 1.1
    text: Card payments must be authorized.
    risk: high
    verifymethod: test
  }
  element checkout_service {
    type: service
  }
  checkout_req - contains -> payment_req
  checkout_service - satisfies -> payment_req`,
  },
  {
    id: 'usecase',
    name: 'Use cases',
    description: 'Actors and system boundaries',
    source: `usecase-beta
direction LR
actor Customer
actor Support
systemBoundary Storefront
  Browse("Browse catalog")
  Checkout("Checkout")
end
systemBoundary Fulfilment
  Track("Track delivery")
end
Customer --> Browse
Customer --> Checkout
Customer --> Track
Support --> Track
Checkout ..> : include Browse`,
  },
  {
    id: 'kanban',
    name: 'Kanban board',
    description: 'Tasks by status',
    source: `kanban
  Todo
    [Create Documentation]
    docs[Create Blog about the new diagram]
  [In progress]
    id6[Create renderer so that it works in all cases. We also add some extra text here for testing purposes. And some more just for the extra flare.]
  id9[Ready for deploy]
    id8[Design grammar]@{ assigned: 'knsv' }
  id10[Ready for test]
    id4[Create parsing tests]@{ ticket: MC-2038, assigned: 'K.Sveidqvist', priority: 'High' }
    id66[last item]@{ priority: 'Very Low', assigned: 'knsv' }
  id11[Done]
    id5[define getData]
    id2[Title of diagram is more than 100 chars when user duplicates diagram with 100 char]@{ ticket: MC-2036, priority: 'Very High'}
    id3[Update DB function]@{ ticket: MC-2037, assigned: knsv, priority: 'High' }

  id12[Can't reproduce]
    id3[Weird flickering in Firefox]`,
  },
  {
    id: 'journey',
    name: 'User journey',
    description: 'Steps scored by satisfaction',
    source: `journey
    title My working day
    section Go to work
      Make tea: 5: Me
      Go upstairs: 3: Me
      Do work: 1: Me, Cat
    section Go home
      Go downstairs: 5: Me
      Sit down: 5: Me`,
  },
  {
    id: 'packet',
    name: 'Packet layout',
    description: 'TCP header bit fields',
    source: `---
title: "TCP Packet"
---
packet
0-15: "Source Port"
16-31: "Destination Port"
32-63: "Sequence Number"
64-95: "Acknowledgment Number"
96-99: "Data Offset"
100-105: "Reserved"
106: "URG"
107: "ACK"
108: "PSH"
109: "RST"
110: "SYN"
111: "FIN"
112-127: "Window"
128-143: "Checksum"
144-159: "Urgent Pointer"
160-191: "(Options and Padding)"
192-255: "Data (variable length)"`,
  },
  {
    id: 'xychart',
    name: 'XY chart',
    description: 'Bars and a line over months',
    source: `xychart
    title "Ocean Temperature"
    x-axis [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
    y-axis "Temperature (in °F)" 74 --> 82
    bar [76.3, 75.9, 76.0, 76.7, 77.8, 78.9, 79.9, 80.7, 81.1, 80.5, 79.1, 77.4]
    line [76.3, 75.9, 76.0, 76.7, 77.8, 78.9, 79.9, 80.7, 81.1, 80.5, 79.1, 77.4]`,
  },
  {
    id: 'sankey',
    name: 'Sankey',
    description: 'Flows between nodes',
    source: `sankey

%% source,target,value
Electricity grid,Over generation / exports,104.453
Electricity grid,Heating and cooling - homes,113.726
Electricity grid,H2 conversion,27.14`,
  },
  {
    id: 'radar',
    name: 'Radar chart',
    description: 'Compare options across axes',
    source: `radar-beta
  title Restaurant Comparison
  axis food["Food Quality"], service["Service"], price["Price"]
  axis ambiance["Ambiance"]

  curve a["Restaurant A"]{4, 3, 2, 4}
  curve b["Restaurant B"]{3, 4, 3, 3}
  curve c["Restaurant C"]{2, 3, 4, 2}
  curve d["Restaurant D"]{2, 2, 4, 3}

  graticule polygon
  max 5`,
  },
  {
    id: 'treemap',
    name: 'Treemap',
    description: 'Nested budget breakdown',
    source: `---
config:
  treemap:
    valueFormat: '$0,0'
---
treemap-beta
"Budget"
    "Operations"
        "Salaries": 700000
        "Equipment": 200000
        "Supplies": 100000
    "Marketing"
        "Advertising": 400000
        "Events": 100000`,
  },
  {
    id: 'venn',
    name: 'Venn diagram',
    description: 'Overlapping sets',
    source: `venn-beta
  title What makes a good feature
  set Desirable
  set Feasible
  set Viable
  union Desirable,Feasible["Buildable"]
  union Feasible,Viable["Sustainable"]
  union Desirable,Viable["Marketable"]
  union Desirable,Feasible,Viable["Ship it"]`,
  },
  {
    id: 'ishikawa',
    name: 'Fishbone',
    description: 'Root cause analysis',
    source: `ishikawa-beta
    Blurry Photo
    Process
        Out of focus
        Shutter speed too slow
        Protective film not removed
        Beautification filter applied
    User
        Shaky hands
    Equipment
        LENS
            Inappropriate lens
            Damaged lens
            Dirty lens
        SENSOR
            Damaged sensor
            Dirty sensor
    Environment
        Subject moved too quickly
        Too dark`,
  },
  {
    id: 'cynefin',
    name: 'Cynefin',
    description: 'Sense-making domains',
    source: `cynefin-beta
  title Strategy Categorization

  complex
    "Market research"

  complicated
    "Competitive analysis"

  clear
    "Standard pricing"

  chaotic
    "Crisis management"

  complex --> complicated : "Pattern identified"
  complicated --> clear : "Best practice codified"
  clear --> chaotic : "Complacency"
  chaotic --> complex : "Stabilized"`,
  },
  {
    id: 'wardley',
    name: 'Wardley map',
    description: 'Value chain vs. evolution',
    source: `wardley-beta
title Tea Shop Value Chain

anchor Business [0.95, 0.63]
component Cup of Tea [0.79, 0.61]
component Tea [0.63, 0.81]
component Hot Water [0.52, 0.80]
component Kettle [0.43, 0.35]
component Power [0.10, 0.70]

Business -> Cup of Tea
Cup of Tea -> Tea
Cup of Tea -> Hot Water
Hot Water -> Kettle
Kettle -> Power

evolve Kettle 0.62
evolve Power 0.89

note "Standardizing power allows Kettles to evolve faster" [0.30, 0.49]`,
  },
  {
    id: 'railroad',
    name: 'Railroad grammar',
    description: 'Syntax diagram from EBNF',
    source: `railroad-ebnf-beta
title "Arithmetic Expression Grammar"

expression = term ( ( "+" | "-" ) term )* ;
term = factor ( ( "*" | "/" ) factor )* ;
factor = number | "(" expression ")" ;
number = digit+ ;
digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;`,
  },
  {
    id: 'treeview',
    name: 'File tree',
    description: 'Project folder structure',
    source: `treeView-beta
    my-project/
        src/
            App.tsx :::highlight icon(logos:react) ## main component
            index.js ## entry point
        .env ## environment variables
        Dockerfile
        package.json`,
  },
]

export const DEFAULT_SOURCE = TEMPLATES[1].source
