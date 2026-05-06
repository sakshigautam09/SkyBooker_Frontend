import { Routes } from '@angular/router';
import { Home } from './features/home/home';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'flights',
    loadComponent: () => import('./features/flight-results/flight-results').then(m => m.FlightResults)
  },
  {
    path: 'flight-results',
    loadComponent: () => import('./features/flight-results/flight-results').then(m => m.FlightResults)
  },
  {
    path: 'booking',
    loadComponent: () => import('./features/booking/booking').then(m => m.Booking)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
  },
  {
    path: 'bookings',
    loadComponent: () => import('./features/my-bookings/my-bookings').then(m => m.MyBookings)
  },
  {
    path: 'add-flight',
    loadComponent: () => import('./features/add-flight/add-flight').then(m => m.AddFlight)
  },
  { path: '**', redirectTo: '' }
];