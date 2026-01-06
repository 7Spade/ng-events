%% Event Flow + Event Sourcing + Causality Tracking with Causality Links
flowchart TD
    %% 層級節點
    subgraph Identity["Identity Layer"]
        A[Account]
    end

    subgraph WorkspaceLayer["Workspace Layer"]
        B[Workspace]
    end

    subgraph Domain["Domain Layer"]
        C[Module]
        D[Entity]
    end

    subgraph EventLayer["Event Layer"]
        E1[Event 1]
        E2[Event 2]
        E3[Event 3]
    end

    subgraph Processing["Processing Layer"]
        F[Event Sourcing]
        G[Causality Tracking]
    end

    %% 核心流程
    A --> B
    B --> C
    C --> D
    D --> E1
    E1 --> E2
    E2 --> E3
    E3 --> F
    F --> G

    %% Event 延伸處理箭頭
    E1 -.-> F
    E2 -.-> F
    E3 -.-> F
    E1 -.-> G
    E2 -.-> G
    E3 -.-> G

    %% 因果鏈示意（Causality Tracking）
    E1 ==> E2
    E2 ==> E3

    %% 节点样式
    style A fill:#ffe0b2,stroke:#fb8c00,stroke-width:2px
    style B fill:#fff59d,stroke:#fbc02d,stroke-width:2px
    style C fill:#b2dfdb,stroke:#00796b,stroke-width:2px
    style D fill:#80cbc4,stroke:#004d40,stroke-width:2px
    style E1 fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style E2 fill:#ffab91,stroke:#d84315,stroke-width:2px
    style E3 fill:#ff8a65,stroke:#d84315,stroke-width:2px
    style F fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    style G fill:#bbdefb,stroke:#1565c0,stroke-width:2px
