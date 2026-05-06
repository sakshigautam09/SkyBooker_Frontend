import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../auth.css'
})
export class Register {
  role: 'Passenger' | 'Admin' = 'Passenger';
  fullName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  adminSecretKey = '';
  loading = false;
  errorMsg = '';

  constructor(private router: Router, private authService: AuthService) {}

  validatePassword(pwd: string): string | null {
    if (pwd.length < 8)         return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(pwd))     return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(pwd))     return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(pwd))     return 'Password must contain at least one digit (0-9).';
    if (!/[@$!%*?&]/.test(pwd)) return 'Password must include a special character (@$!%*?&).';
    return null;
  }

  onRegister() {
    this.errorMsg = '';

    if (!this.fullName.trim() || !this.email.trim() || !this.password) {
      this.errorMsg = 'Please fill in all required fields.'; return;
    }
    const pwdError = this.validatePassword(this.password);
    if (pwdError) { this.errorMsg = pwdError; return; }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Passwords do not match.'; return;
    }
    if (this.role === 'Admin' && !this.adminSecretKey.trim()) {
      this.errorMsg = 'Admin secret key is required.'; return;
    }

    // Strip spaces from phone before sending
    const phoneClean = this.phone.trim().replace(/\s/g, '') || null;

    this.loading = true;

    const payload: any = {
      fullName: this.fullName.trim(),
      email:    this.email.trim(),
      password: this.password,
      phone:    phoneClean,
      role:     this.role,
      ...(this.role === 'Admin' && { adminSecretKey: this.adminSecretKey.trim() })
    };

    // Step 1: Register
    this.authService.register(payload).subscribe({
      next: () => {
        // Step 2: Auto-login — login response contains the real role from DB
        this.authService.login({ email: payload.email, password: this.password }).subscribe({
          next: () => {
            this.loading = false;
            // Use role from auth service (set from login response) — not from form
            const actualRole = this.authService.getRole();
            this.router.navigate([actualRole === 'Admin' ? '/add-flight' : '/']);
          },
          error: () => {
            this.loading = false;
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        const body = err.error;
        if (body?.errors && Array.isArray(body.errors)) {
          this.errorMsg = body.errors[0];
        } else if (body?.errors && typeof body.errors === 'object') {
          const first = Object.values(body.errors)[0] as string[];
          this.errorMsg = Array.isArray(first) ? first[0] : 'Validation error.';
        } else if (body?.message) {
          this.errorMsg = body.message;
        } else if (err.status === 401) {
          this.errorMsg = 'Invalid admin secret key.';
        } else if (err.status === 409) {
          this.errorMsg = 'Email is already registered.';
        } else {
          this.errorMsg = 'Registration failed. Please try again.';
        }
      }
    });
  }
}