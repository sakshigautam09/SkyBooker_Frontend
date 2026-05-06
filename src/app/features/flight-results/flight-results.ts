import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FlightService, Flight } from '../../services/flight.service';

@Component({
  selector: 'app-flight-results',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './flight-results.html',
  styleUrl: './flight-results.css'
})
export class FlightResults implements OnInit {
  filters = { from: '', to: '', date: '', passengers: 1 };
  sortBy = 'price';
  maxPrice = 200000;

  allFlights: Flight[] = [];
  filteredFlights: Flight[] = [];
  loading = false;
  errorMsg = '';
  deletingId: number | null = null;

  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService
  ) {}

  ngOnInit() {
    this.isAdmin = localStorage.getItem('role') === 'Admin';

    this.route.queryParams.subscribe(params => {
      this.filters.from       = params['from']       || '';
      this.filters.to         = params['to']         || '';
      this.filters.date       = params['departure']  || '';
      this.filters.passengers = parseInt(params['passengers'] || '1');

      if (this.filters.from && this.filters.to && this.filters.date) {
        this.fetchFlights();
      }
    });
  }

  fetchFlights() {
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(this.filters.date);
    selected.setHours(0, 0, 0, 0);

    if (selected <= today) {
      this.errorMsg        = 'Please select a future date to search for available flights.';
      this.filteredFlights = [];
      this.allFlights      = [];
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    this.flightService.searchFlights(
      this.filters.from,
      this.filters.to,
      this.filters.date
    ).subscribe({
      next: (flights) => {
        this.loading    = false;
        this.allFlights = flights;
        this.applyFilters();
      },
      error: () => {
        this.loading         = false;
        this.errorMsg        = 'Could not fetch flights. Please try again.';
        this.filteredFlights = [];
      }
    });
  }

  applyFilters() {
    this.filteredFlights = this.allFlights.filter(f =>
      f.basePrice <= this.maxPrice && f.status !== 'Cancelled'
    );
    this.sortFlights();
  }

  sortFlights() {
    if (this.sortBy === 'price') {
      this.filteredFlights.sort((a, b) => a.basePrice - b.basePrice);
    } else if (this.sortBy === 'duration') {
      this.filteredFlights.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else {
      this.filteredFlights.sort((a, b) =>
        new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
      );
    }
  }

  getTotalPrice(basePrice: number): number {
    return basePrice * this.filters.passengers;
  }

  deleteFlight(event: Event, flightId: number) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this flight? This cannot be undone.')) return;

    this.deletingId = flightId;
    this.flightService.deleteFlight(flightId).subscribe({
      next: () => {
        this.deletingId  = null;
        this.allFlights  = this.allFlights.filter(f => f.flightId !== flightId);
        this.applyFilters();
      },
      error: (err: any) => {
        this.deletingId = null;
        alert(err.error?.message || 'Failed to delete flight. Please try again.');
      }
    });
  }

  bookFlight(flight: Flight) {
    this.router.navigate(['/booking'], {
      queryParams: {
        flightId:      flight.flightId,
        basePrice:     flight.basePrice,
        passengers:    this.filters.passengers,
        airlineCode:   flight.flightNumber.split('-')[0] ?? 'AI',
        flightNumber:  flight.flightNumber.split('-')[1] ?? flight.flightNumber,
        // ✅ These 3 are needed for the confirmation email
        origin:        flight.originAirportCode,
        destination:   flight.destinationAirportCode,
        departureTime: flight.departureTime
      }
    });
  }

  selectFlight(flight: Flight) { this.bookFlight(flight); }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}