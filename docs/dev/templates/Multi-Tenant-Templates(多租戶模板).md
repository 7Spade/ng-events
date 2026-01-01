# Multi-Tenant Templates (多租戶模板)

本文檔提供多租戶 SaaS 平台的完整模板，包含租戶隔離、權限控制與協作模型。

---

## 租戶模型 (Tenant Model)

### 租戶類型定義

```typescript
/**
 * Tenant types in the system
 * 系統中的租戶類型
 */
export enum TenantType {
  /** 帳戶 - 個人/用戶/組織/BOT 統一為 account */
  ACCOUNT = 'account',
  
  /** 團隊 - 組織內的團隊 */
  TEAM = 'team',
  
  /** 夥伴 - 組織外的合作夥伴 */
  PARTNER = 'partner',
  
  /** 協作者 - 跨組織協作者 */
  COLLABORATOR = 'collaborator'
}

/**
 * Blueprint (Tenant boundary)
 * Blueprint 即為多租戶邊界
 */
export interface Blueprint {
  /** Blueprint ID (多租戶隔離邊界) */
  id: string;
  
  /** 名稱 */
  name: string;
  
  /** 描述 */
  description: string;
  
  /** 擁有者 (Account) */
  ownerId: string;
  
  /** 類型 */
  type: 'personal' | 'team' | 'organization' | 'bot';
  
  /** 建立時間 */
  createdAt: Timestamp;
  
  /** 設定 */
  settings: BlueprintSettings;
  
  /** 狀態 */
  status: 'active' | 'suspended' | 'deleted';
}

export interface BlueprintSettings {
  /** 時區 */
  timezone: string;
  
  /** 語言 */
  language: string;
  
  /** 貨幣 */
  currency: string;
  
  /** 功能開關 */
  features: {
    taskManagement: boolean;
    paymentProcessing: boolean;
    issueTracking: boolean;
    analytics: boolean;
  };
}
```

---

## Account 模型 (Account Model)

### Account 定義

```typescript
/**
 * Account (統一個人/用戶/組織/BOT)
 */
export interface Account {
  /** Account ID */
  id: string;
  
  /** 名稱 */
  name: string;
  
  /** 類型 */
  type: 'individual' | 'organization' | 'bot';
  
  /** Email (個人/組織) */
  email?: string;
  
  /** 電話 */
  phone?: string;
  
  /** 頭像 */
  avatar?: string;
  
  /** 關聯的 Blueprints */
  blueprints: string[];
  
  /** 建立時間 */
  createdAt: Timestamp;
  
  /** 狀態 */
  status: 'active' | 'inactive' | 'suspended';
}

/**
 * Account with Blueprint membership
 * Account 與 Blueprint 的成員關係
 */
export interface BlueprintMember {
  /** Account ID */
  accountId: string;
  
  /** Blueprint ID */
  blueprintId: string;
  
  /** 角色 */
  role: 'owner' | 'admin' | 'member' | 'viewer';
  
  /** 權限 */
  permissions: string[];
  
  /** 加入時間 */
  joinedAt: Timestamp;
  
  /** 邀請者 */
  invitedBy: string;
}
```

---

## Team 模型 (Team Model)

### Team 定義 (組織內團隊)

```typescript
/**
 * Team (組織內的團隊)
 */
export interface Team {
  /** Team ID */
  id: string;
  
  /** 所屬 Blueprint */
  blueprintId: string;
  
  /** 團隊名稱 */
  name: string;
  
  /** 描述 */
  description: string;
  
  /** 團隊領導 */
  leaderId: string;
  
  /** 成員 */
  members: TeamMember[];
  
  /** 建立時間 */
  createdAt: Timestamp;
  
  /** 狀態 */
  status: 'active' | 'archived';
}

export interface TeamMember {
  /** Account ID */
  accountId: string;
  
  /** 角色 */
  role: 'leader' | 'member';
  
  /** 權限 */
  permissions: string[];
  
  /** 加入時間 */
  joinedAt: Timestamp;
}
```

---

## Partner 模型 (Partner Model)

### Partner 定義 (組織外夥伴)

```typescript
/**
 * Partner (組織外的合作夥伴)
 */
export interface Partner {
  /** Partner ID */
  id: string;
  
  /** 主 Blueprint (發起方) */
  hostBlueprintId: string;
  
  /** 夥伴 Blueprint */
  partnerBlueprintId: string;
  
  /** 合作關係名稱 */
  relationshipName: string;
  
  /** 合作類型 */
  type: 'vendor' | 'client' | 'collaborator';
  
  /** 權限範圍 */
  accessScope: PartnerAccessScope;
  
  /** 建立時間 */
  createdAt: Timestamp;
  
  /** 到期時間 */
  expiresAt?: Timestamp;
  
  /** 狀態 */
  status: 'active' | 'suspended' | 'expired';
}

export interface PartnerAccessScope {
  /** 可訪問的資源類型 */
  resources: ('task' | 'payment' | 'issue')[];
  
  /** 權限 */
  permissions: string[];
  
  /** 限制條件 */
  restrictions?: {
    /** 只能訪問特定專案 */
    projectIds?: string[];
    
    /** 只能訪問特定標籤 */
    tags?: string[];
  };
}
```

---

## Collaborator 模型 (Collaborator Model)

### Collaborator 定義 (跨組織協作者)

```typescript
/**
 * Collaborator (跨組織協作者)
 */
export interface Collaborator {
  /** Collaborator ID */
  id: string;
  
  /** 主 Blueprint (邀請方) */
  hostBlueprintId: string;
  
  /** 協作者 Account ID */
  collaboratorAccountId: string;
  
  /** 協作範圍 */
  scope: CollaboratorScope;
  
  /** 邀請者 */
  invitedBy: string;
  
  /** 邀請時間 */
  invitedAt: Timestamp;
  
  /** 接受時間 */
  acceptedAt?: Timestamp;
  
  /** 狀態 */
  status: 'pending' | 'active' | 'revoked';
}

export interface CollaboratorScope {
  /** 可訪問的資源 */
  resources: {
    type: 'task' | 'payment' | 'issue';
    ids: string[];
  }[];
  
  /** 權限 (只讀/編輯/評論) */
  permissions: ('read' | 'edit' | 'comment')[];
  
  /** 到期時間 */
  expiresAt?: Timestamp;
}
```

---

## 租戶隔離服務 (Tenant Isolation Service)

### 實作多租戶隔離

```typescript
/**
 * Tenant isolation service
 * 租戶隔離服務
 */
export class TenantIsolationService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  /**
   * Get current blueprint ID
   */
  getCurrentBlueprintId(): string {
    const blueprint = this.authService.currentBlueprint;
    if (!blueprint) {
      throw new Error('No blueprint selected');
    }
    return blueprint.id;
  }

  /**
   * Validate access to resource
   */
  async validateAccess(
    resourceId: string,
    resourceType: 'task' | 'payment' | 'issue'
  ): Promise<boolean> {
    const blueprintId = this.getCurrentBlueprintId();
    const userId = this.authService.currentUser!.id;

    // 檢查資源是否屬於當前 Blueprint
    const resource = await this.getResource(resourceType, resourceId);
    if (resource.blueprintId !== blueprintId) {
      // 檢查是否為 Partner/Collaborator 訪問
      return await this.checkExternalAccess(
        userId,
        blueprintId,
        resourceId,
        resourceType
      );
    }

    return true;
  }

  /**
   * Filter entities by blueprint
   */
  filterByBlueprint<T extends { blueprintId: string }>(
    entities: T[]
  ): T[] {
    const blueprintId = this.getCurrentBlueprintId();
    return entities.filter(e => e.blueprintId === blueprintId);
  }

  /**
   * Scope Firestore query to blueprint
   */
  scopeToBlueprint(collectionPath: string): Query {
    const blueprintId = this.getCurrentBlueprintId();
    return query(
      collection(this.firestore, collectionPath),
      where('blueprintId', '==', blueprintId)
    );
  }

  /**
   * Check external access (Partner/Collaborator)
   */
  private async checkExternalAccess(
    userId: string,
    currentBlueprintId: string,
    resourceId: string,
    resourceType: string
  ): Promise<boolean> {
    // 檢查 Partner 訪問
    const partnerAccess = await this.checkPartnerAccess(
      userId,
      currentBlueprintId,
      resourceId,
      resourceType
    );
    
    if (partnerAccess) return true;

    // 檢查 Collaborator 訪問
    const collaboratorAccess = await this.checkCollaboratorAccess(
      userId,
      resourceId,
      resourceType
    );

    return collaboratorAccess;
  }

  private async checkPartnerAccess(
    userId: string,
    blueprintId: string,
    resourceId: string,
    resourceType: string
  ): Promise<boolean> {
    // 查詢 Partner 關係
    const partnerQuery = query(
      collection(this.firestore, 'partners'),
      where('partnerBlueprintId', '==', blueprintId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(partnerQuery);
    
    for (const doc of snapshot.docs) {
      const partner = doc.data() as Partner;
      
      // 檢查資源類型是否在權限範圍內
      if (partner.accessScope.resources.includes(resourceType as any)) {
        // 進一步檢查具體權限
        return true;
      }
    }

    return false;
  }

  private async checkCollaboratorAccess(
    userId: string,
    resourceId: string,
    resourceType: string
  ): Promise<boolean> {
    // 查詢 Collaborator 關係
    const collaboratorQuery = query(
      collection(this.firestore, 'collaborators'),
      where('collaboratorAccountId', '==', userId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(collaboratorQuery);
    
    for (const doc of snapshot.docs) {
      const collaborator = doc.data() as Collaborator;
      
      // 檢查資源是否在協作範圍內
      const hasAccess = collaborator.scope.resources.some(
        r => r.type === resourceType && r.ids.includes(resourceId)
      );
      
      if (hasAccess) return true;
    }

    return false;
  }
}
```

---

## 權限檢查服務 (Permission Check Service)

### 多租戶權限檢查

```typescript
/**
 * Permission service for multi-tenant access control
 * 多租戶權限檢查服務
 */
export class PermissionService {
  constructor(
    private authService: AuthService,
    private tenantService: TenantIsolationService
  ) {}

  /**
   * Check if user has permission for action
   */
  async hasPermission(
    action: string,
    resourceId?: string,
    resourceType?: string
  ): Promise<boolean> {
    const user = this.authService.currentUser;
    const blueprintId = this.tenantService.getCurrentBlueprintId();

    if (!user) return false;

    // 1. 檢查 Blueprint 成員權限
    const memberPermissions = await this.getBlueprintMemberPermissions(
      user.id,
      blueprintId
    );
    
    if (memberPermissions.includes(action)) return true;

    // 2. 檢查 Team 權限
    const teamPermissions = await this.getTeamPermissions(user.id, blueprintId);
    if (teamPermissions.includes(action)) return true;

    // 3. 檢查 Partner 權限
    if (resourceId && resourceType) {
      const partnerPermissions = await this.getPartnerPermissions(
        user.id,
        resourceId,
        resourceType
      );
      if (partnerPermissions.includes(action)) return true;
    }

    // 4. 檢查 Collaborator 權限
    if (resourceId && resourceType) {
      const collaboratorPermissions = await this.getCollaboratorPermissions(
        user.id,
        resourceId,
        resourceType
      );
      if (collaboratorPermissions.includes(action)) return true;
    }

    return false;
  }

  /**
   * Get blueprint member permissions
   */
  private async getBlueprintMemberPermissions(
    userId: string,
    blueprintId: string
  ): Promise<string[]> {
    // 查詢用戶在 Blueprint 中的角色和權限
    const memberQuery = query(
      collection(this.firestore, 'blueprint_members'),
      where('accountId', '==', userId),
      where('blueprintId', '==', blueprintId)
    );

    const snapshot = await getDocs(memberQuery);
    
    if (snapshot.empty) return [];

    const member = snapshot.docs[0].data() as BlueprintMember;
    return member.permissions;
  }

  /**
   * Get team permissions
   */
  private async getTeamPermissions(
    userId: string,
    blueprintId: string
  ): Promise<string[]> {
    // 查詢用戶所屬的團隊
    const teamQuery = query(
      collection(this.firestore, 'teams'),
      where('blueprintId', '==', blueprintId),
      where('members', 'array-contains', { accountId: userId })
    );

    const snapshot = await getDocs(teamQuery);
    
    const allPermissions: string[] = [];
    
    for (const doc of snapshot.docs) {
      const team = doc.data() as Team;
      const member = team.members.find(m => m.accountId === userId);
      
      if (member) {
        allPermissions.push(...member.permissions);
      }
    }

    return [...new Set(allPermissions)];
  }
}
```

---

## Firestore 資料結構 (Firestore Data Structure)

### 多租戶集合結構

```
firestore/
├── blueprints/              # Blueprint (租戶邊界)
│   └── {blueprintId}/
│       ├── name
│       ├── ownerId
│       └── settings
│
├── accounts/                # Account (個人/組織/BOT)
│   └── {accountId}/
│       ├── name
│       ├── type
│       └── blueprints[]
│
├── blueprint_members/       # Blueprint 成員關係
│   └── {memberId}/
│       ├── accountId
│       ├── blueprintId
│       ├── role
│       └── permissions[]
│
├── teams/                   # Team (組織內團隊)
│   └── {teamId}/
│       ├── blueprintId      # 必須
│       ├── name
│       ├── leaderId
│       └── members[]
│
├── partners/                # Partner (組織外夥伴)
│   └── {partnerId}/
│       ├── hostBlueprintId
│       ├── partnerBlueprintId
│       ├── accessScope
│       └── status
│
├── collaborators/           # Collaborator (協作者)
│   └── {collaboratorId}/
│       ├── hostBlueprintId
│       ├── collaboratorAccountId
│       ├── scope
│       └── status
│
└── tasks/                   # 業務資料 (範例)
    └── {taskId}/
        ├── blueprintId      # 必須：租戶隔離
        ├── title
        ├── assigneeId
        └── metadata
```

---

## 最佳實踐

### ✅ DO
- 所有聚合根包含 blueprintId
- 使用 TenantIsolationService 進行隔離
- 實作細粒度權限控制
- 支援 Partner/Collaborator 訪問
- 定期審計訪問記錄
- 實作資料導出功能 (GDPR)

### ❌ DON'T
- 跨 Blueprint 查詢資料
- 硬編碼 Blueprint ID
- 忽略外部訪問檢查
- 共享敏感資料
- 缺少訪問日誌

---

## 檢查清單

- [ ] 所有資料包含 blueprintId
- [ ] 實作租戶隔離服務
- [ ] 支援 4 種租戶類型
- [ ] 權限細粒度控制
- [ ] Partner 訪問控制
- [ ] Collaborator 訪問控制
- [ ] 訪問日誌記錄
- [ ] 資料導出功能

---

**版本**: 1.0 | **更新**: 2026-01-01
