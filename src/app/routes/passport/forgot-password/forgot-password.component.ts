import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'passport-forgot-password',
  template: `
    <form nz-form [formGroup]="form" (ngSubmit)="submit()" class="forgot-password-form">
      <h3 class="title">重置密碼</h3>
      <p class="description">請輸入您的註冊 Email，我們將發送密碼重置連結給您</p>

      <nz-form-item>
        <nz-form-control nzErrorTip="請輸入有效的 Email 地址">
          <nz-input-group nzPrefixIcon="mail">
            <input
              type="email"
              nz-input
              formControlName="email"
              placeholder="Email"
              autocomplete="email"
            />
          </nz-input-group>
        </nz-form-control>
      </nz-form-item>

      <button
        nz-button
        nzType="primary"
        nzBlock
        nzSize="large"
        [nzLoading]="loading"
        [disabled]="form.invalid"
        type="submit"
      >
        發送重置郵件
      </button>

      <div class="footer">
        <a routerLink="/passport/login">返回登入</a>
      </div>
    </form>
  `,
  styles: [`
    .forgot-password-form {
      max-width: 368px;
      margin: 0 auto;
    }
    
    .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .description {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      margin-bottom: 32px;
      text-align: center;
    }
    
    .footer {
      margin-top: 24px;
      text-align: center;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule
  ]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private msg = inject(NzMessageService);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  
  loading = false;

  async submit(): Promise<void> {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    
    this.loading = true;
    const email = this.form.value.email;
    
    try {
      await sendPasswordResetEmail(this.auth, email, {
        url: `${window.location.origin}/passport/login`,
        handleCodeInApp: false
      });
      
      this.msg.success('密碼重置郵件已發送，請檢查您的信箱（包含垃圾郵件夾）');
      
      // 延遲後自動跳轉回登入頁
      setTimeout(() => {
        this.router.navigateByUrl('/passport/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          this.msg.error('此 Email 未註冊，請先註冊帳號');
          break;
        case 'auth/invalid-email':
          this.msg.error('Email 格式不正確');
          break;
        case 'auth/too-many-requests':
          this.msg.error('請求過於頻繁，請稍後再試');
          break;
        default:
          this.msg.error('發送失敗，請稍後再試');
      }
    } finally {
      this.loading = false;
    }
  }
}

// END OF FILE
