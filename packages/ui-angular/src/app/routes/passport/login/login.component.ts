import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { I18nPipe } from '@delon/theme';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    I18nPipe,
    NzCheckboxModule,
    NzAlertModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule
  ]
})
export class UserLoginComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly reuseTabService = inject(ReuseTabService, { optional: true });
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly startupSrv = inject(StartupService);
  private readonly cdr = inject(ChangeDetectorRef);

  form = inject(FormBuilder).nonNullable.group({
    userName: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true]
  });
  error = '';
  loading = false;

  submit(): void {
    this.error = '';
    const { userName, password } = this.form.controls;
    userName.markAsDirty();
    userName.updateValueAndValidity();
    password.markAsDirty();
    password.updateValueAndValidity();
    if (userName.invalid || password.invalid) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    // 使用 Firebase Auth 登入
    signInWithEmailAndPassword(this.auth, userName.value, password.value)
      .then(async () => {
        // 清空路由復用信息
        this.reuseTabService?.clear();

        // Token 已經由 FirebaseAuthBridgeService 自動設定到 @delon/auth
        // 重新載入 StartupService
        this.startupSrv.load().subscribe(() => {
          let url = this.tokenService.referrer!.url || '/';
          if (url.includes('/passport')) {
            url = '/';
          }
          this.router.navigateByUrl(url);
        });
      })
      .catch(error => {
        this.loading = false;
        this.error = this.getFirebaseErrorMessage(error.code);
        this.cdr.detectChanges();
      });
  }

  /**
   * 將 Firebase 錯誤碼轉換為友善的訊息
   */
  private getFirebaseErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': '無效的電子郵件地址',
      'auth/user-disabled': '此帳號已被停用',
      'auth/user-not-found': '找不到此帳號',
      'auth/wrong-password': '密碼錯誤',
      'auth/invalid-credential': '帳號或密碼錯誤',
      'auth/too-many-requests': '登入嘗試次數過多，請稍後再試',
      'auth/network-request-failed': '網路連線失敗'
    };

    return errorMessages[errorCode] || '登入失敗，請稍後再試';
  }
}

// END OF FILE
