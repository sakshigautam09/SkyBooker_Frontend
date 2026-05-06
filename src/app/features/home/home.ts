import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { resolveAirportCode } from '../../services/flight.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  tripType = 'one-way';
  isAdmin = localStorage.getItem('role') === 'Admin';

  // 1–9 passengers
  passengerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  searchForm = {
    from: '',
    to: '',
    departure: '',
    passengers: 1
  };

  destinations = [
    { city: 'Paris',     code: 'CDG', price: '₹28,500', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80' },
    { city: 'Dubai',     code: 'DXB', price: '₹14,200', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
    { city: 'New York',  code: 'JFK', price: '₹42,000', img: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=600&q=80' },
    { city: 'Singapore', code: 'SIN', price: '₹18,900', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
    { city: 'Tokyo',     code: 'NRT', price: '₹35,000', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
    { city: 'London',    code: 'LHR', price: '₹39,800', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' }
  ];

  features = [
    { icon: '💸', title: 'Best Price Guarantee', desc: 'We match any lower price you find, guaranteed every time.' },
    { icon: '⚡', title: 'Instant Booking',       desc: 'Confirm your flight in seconds with our streamlined booking process.' },
    { icon: '🔒', title: 'Secure Payments',       desc: '100% secure payment gateway with end-to-end encryption.' },
    { icon: '🛎️', title: '24/7 Support',          desc: 'Our team is always available to help you at any time of day.' }
  ];

  deals = [
    { id: 1, from: 'DEL', to: 'DXB', airline: 'Emirates',        duration: '3h 45m', price: '₹9,499',  discount: '35%' },
    { id: 2, from: 'BOM', to: 'SIN', airline: 'IndiGo',          duration: '5h 10m', price: '₹12,799', discount: '28%' },
    { id: 3, from: 'BLR', to: 'LHR', airline: 'British Airways', duration: '9h 30m', price: '₹31,500', discount: '20%' }
  ];

  constructor(private router: Router) {}

  searchFlights() {
    if (!this.searchForm.from || !this.searchForm.to || !this.searchForm.departure) return;

    const from = resolveAirportCode(this.searchForm.from);
    const to   = resolveAirportCode(this.searchForm.to);

    this.router.navigate(['/flight-results'], {
      queryParams: {
        from,
        to,
        departure:  this.searchForm.departure,
        passengers: this.searchForm.passengers
      }
    });
  }

  searchTo(code: string) {
    this.searchForm.to = code;
    this.router.navigate(['/flight-results'], { queryParams: { to: code } });
  }

  bookDeal(deal: any) {
    this.router.navigate(['/flight-results'], {
      queryParams: { from: deal.from, to: deal.to }
    });
  }
}