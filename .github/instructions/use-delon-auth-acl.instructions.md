# 使用說明：@delon/auth & @delon/acl 在 ui-angular Skeleton 的應用

## 1️⃣ Auth 部分（@delon/auth）

### 核心概念
- ITokenService：統一管理 token、認證資訊。
- Interceptor：自動在 HTTP 請求 header 附加 token（SimpleInterceptor / JWTInterceptor）。
- SocialService：第三方授權登入支援。
- Storage：默認 LocalStorage，可切換 SessionStorage / MemoryStore。

### Skeleton 對應
| 功能 | 對應檔案 / stub | 描述 |
|------|----------------|------|
| Auth 監聽 / token 變更 | `AuthStateService` (platform-adapters) | skeleton stub，內部使用 ITokenService.change() 監聽 |
| UI 消費 Auth | `AuthStateFacade` (ui-angular) | skeleton stub，對外提供 waitForAuthState() / refreshToken() 接口 |
| Interceptor / Header | `default.interceptor.ts` / `helper.ts` | 單一 header contract hook，token 附加交給 DelonInterceptor |

### 注意事項
- Skeleton 保留方法名稱，但邏輯由 @delon/auth 提供。
- 不再自行附加 / 刷新 token。

---

## 2️⃣ ACL 部分（@delon/acl）

### 核心概念
- ACLService：管理使用者角色與權限點。
- ACLGuard：路由守衛，可用於 canActivate / canLoad / canActivateChild。
- [acl] 指令：按鈕 / UI 元件的顯示控制。

### Skeleton 對應
| 功能 | 對應檔案 / stub | 描述 |
|------|----------------|------|
| 路由守衛 | `SessionGuard` (ui-angular) | skeleton stub，使用 ACLService.can() / canAbility() 判斷權限 |
| 按鈕 / 元件控制 | UI template | 可直接使用 `[acl]="'role'"` 或 `[acl]="{ ability: [1,2], mode:'allOf' }"` |
| UI 層依賴 | Facade / Guard stub | 不直接依賴 Angular/Firebase，僅注入 ACLService |

### 注意事項
- SessionGuard skeleton 保留 CanActivateFn 結構，實作時直接依賴 ACLService。
- ACLService 可以動態調整角色或權限（set / add / remove）。

---

## 3️⃣ Skeleton 使用流程

1. **UI 層**：透過 AuthStateFacade 取得 token / session。
2. **Guard**：SessionGuard 注入 ACLService，決定路由是否可訪問。
3. **HTTP 請求**：使用 DelonAuthModule 提供的 Interceptor 自動附加 token。
4. **SessionContext**：
   - 核心 interface 定義於 core-engine
   - Adapter 實作於 platform-adapters
   - UI 層透過 Facade / Guard 間接讀取，不直接依賴 SDK

---

## 4️⃣ 注意事項

- skeleton stub 只包含方法簽名與 DI 注入，邏輯由 @delon/auth / @delon/acl 提供。
- 測試請透過 Mock ITokenService / ACLService 進行 unit test。
- 分步實作時先確保依賴注入與接口保持一致，避免破壞 UI / Domain 邊界。
