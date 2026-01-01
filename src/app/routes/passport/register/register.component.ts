import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { I18nPipe } from '@delon/theme';
import { MatchControl } from '@delon/util/form';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'passport-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    I18nPipe,
    RouterLink,
    NzAlertModule,
    NzFormModule,
    NzInputModule,
    NzPopoverModule,
    NzProgressModule,
    NzButtonModule
  ]
})
export class UserRegisterComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly cdr = inject(ChangeDetectorRef);

  // #region fields

  form = inject(FormBuilder).nonNullable.group(
    {
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), UserRegisterComponent.checkPassword.bind(this)]],
      confirm: ['', [Validators.required, Validators.minLength(6)]]
    },
    {
      validators: MatchControl('password', 'confirm')
    }
  );
  error = '';
  loading = false;
  visible = false;
  status = 'pool';
  progress = 0;
  passwordProgressMap: Record<string, 'success' | 'normal' | 'exception'> = {
    ok: 'success',
    pass: 'normal',
    pool: 'exception'
  };

  // #endregion

  static checkPassword(control: FormControl): NzSafeAny {
    if (!control) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: NzSafeAny = this;
    self.visible = !!control.value;
    if (control.value && control.value.length > 9) {
      self.status = 'ok';
    } else if (control.value && control.value.length > 5) {
      self.status = 'pass';
    } else {
      self.status = 'pool';
    }

    if (self.visible) {
      self.progress = control.value.length * 10 > 100 ? 100 : control.value.length * 10;
    }
  }

  submit(): void {
    this.error = '';
    Object.keys(this.form.controls).forEach(key => {
      const control = (this.form.controls as NzSafeAny)[key] as AbstractControl;
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    if (this.form.invalid) {
      return;
    }

    const formValue = this.form.value;
    const mail = (formValue.mail as unknown as string) || '';
    const password = (formValue.password as unknown as string) || '';
    
    if (!mail || !password) {
      this.error = '請填寫所有必填欄位';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    // 使用 Firebase Auth 建立帳號
    createUserWithEmailAndPassword(this.auth, mail, password)
      .then(async (credential) => {
        // 更新用戶 profile
        await updateProfile(credential.user, {
          displayName: mail.split('@')[0] // 使用 email 前綴作為顯示名稱
        });

        // 在 Firestore 建立用戶資料
        await setDoc(doc(this.firestore, 'users', credential.user.uid), {
          email: mail,
          createdAt: new Date(),
          role: 'user'
        });

        // 跳轉到註冊成功頁面
        this.router.navigate(['passport', 'register-result'], { queryParams: { email: mail } });
      })
      .catch((error) => {
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
      'auth/email-already-in-use': '此電子郵件已被使用',
      'auth/invalid-email': '無效的電子郵件地址',
      'auth/operation-not-allowed': '註冊功能未啟用',
      'auth/weak-password': '密碼強度不足（至少 6 個字元）',
      'auth/network-request-failed': '網路連線失敗',
    };
    
    return errorMessages[errorCode] || '註冊失敗，請稍後再試';
  }
}

// END OF FILE

