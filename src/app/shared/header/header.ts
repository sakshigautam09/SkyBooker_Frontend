import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, CurrentUser } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  currentUser: CurrentUser | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get isAdmin() { return this.currentUser?.role === 'Admin'; }
  get isPassenger() { return this.currentUser?.role === 'Passenger'; }
  get isLoggedIn() { return !!this.currentUser; }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}