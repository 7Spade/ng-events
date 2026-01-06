import type { User } from '@angular/fire/auth';
import type { ITokenService } from '@delon/auth';

/**
 * AuthStateService (skeleton)
 *
 * 集中化 auth state 監聽，並透過 @delon/auth 的 ITokenService 處理
 * token 存取 / 變更事件。保持方法簽名供 UI facade 使用，不填充邏輯。
 */
/**
 * Align with Firebase User to keep skeleton compatible with upstream bridge.
 * Using the SDK type removes union assignment errors when wiring providers.
 */
export type AuthUserSnapshot = User;

export abstract class AuthStateService {
  /**
   * @delon/auth ITokenService 應由具體實作注入，用於唯一 token 來源。
   */
  protected tokenService?: ITokenService;

  /**
   * 初始化單一路徑監聽（例如 onAuthStateChanged），並透過 ITokenService 設定 token。
   */
  abstract init(): void;

  /**
   * 等待第一次 auth 狀態；實作時可代理 ITokenService change 事件。
   */
  abstract waitForAuthState(): Promise<AuthUserSnapshot | null>;

  /**
   * 強制刷新 token；實作時應透過 provider 取得，再交由 ITokenService 儲存。
   */
  abstract refreshToken(): Promise<string>;

  /**
   * 將 auth 狀態同步進 ITokenService（單一來源）。
   */
  abstract syncToTokenService(user: AuthUserSnapshot | null): Promise<void>;
}

// END OF FILE
