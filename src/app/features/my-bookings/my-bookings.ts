import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleCasePipe, DatePipe, DecimalPipe } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

interface BookingDisplay {
  id: string;
  pnrCode: string;
  flightId: number;
  tripType: string;
  status: string;
  totalFare: number;
  baseFare: number;
  contactEmail: string;
  contactPhone: string;
  bookedAt: string;
  statusDisplay: 'confirmed' | 'past' | 'cancelled';
}

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, TitleCasePipe, DatePipe, DecimalPipe],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookings implements OnInit {
  activeTab: 'upcoming' | 'past' | 'cancelled' = 'upcoming';
  bookings: BookingDisplay[] = [];
  loading = false;
  errorMsg = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const userId = parseInt(localStorage.getItem('userId') || '0');
    if (!userId) { this.errorMsg = 'Please login to view bookings.'; return; }

    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (res: any[]) => {
        this.loading = false;
        this.bookings = res.map(b => ({
          id:           b.bookingId || b.id,
          pnrCode:      b.pnrCode   || b.bookingReference || '------',
          flightId:     b.flightId,
          tripType:     b.tripType  || 'OneWay',
          status:       b.status,
          totalFare:    b.totalFare || b.totalPrice || 0,
          baseFare:     b.baseFare  || b.basePrice  || 0,
          contactEmail: b.contactEmail || '',
          contactPhone: b.contactPhone || '',
          bookedAt:     b.bookedAt  || b.bookingDate || '',
          statusDisplay: this.mapStatus(b.status)
        }));
      },
      error: () => {
        this.loading  = false;
        this.errorMsg = 'Could not load bookings.';
      }
    });
  }

  mapStatus(status: string): 'confirmed' | 'past' | 'cancelled' {
    const s = (status || '').toLowerCase();
    if (s === 'cancelled') return 'cancelled';
    if (s === 'completed' || s === 'no_show') return 'past';
    return 'confirmed';
  }

  get filteredBookings(): BookingDisplay[] {
    const map: Record<string, string> = {
      upcoming: 'confirmed', past: 'past', cancelled: 'cancelled'
    };
    return this.bookings.filter(b => b.statusDisplay === map[this.activeTab]);
  }

  downloadTicket(booking: BookingDisplay) {
    const ticketHtml = `<!DOCTYPE html>
<html>
<head>
  <title>E-Ticket - ${booking.pnrCode}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
    .header { background: #312e81; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 24px; }
    .pnr { background: #eef2ff; border: 2px dashed #6366f1; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px; }
    .pnr .label { font-size: 12px; color: #6366f1; font-weight: bold; letter-spacing: 2px; }
    .pnr .code  { font-size: 32px; font-weight: 800; color: #312e81; letter-spacing: 6px; }
    .section { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .section h3 { margin: 0 0 12px; font-size: 14px; color: #6366f1; text-transform: uppercase; }
    .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .row .label { color: #64748b; font-size: 13px; }
    .row .value { font-weight: 600; font-size: 13px; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header"><h1>✈ SkyBooker — E-Ticket</h1></div>
  <div class="pnr">
    <div class="label">PNR CODE</div>
    <div class="code">${booking.pnrCode}</div>
  </div>
  <div class="section">
    <h3>Booking Details</h3>
    <div class="row"><span class="label">Booking ID</span><span class="value">${booking.id}</span></div>
    <div class="row"><span class="label">Flight ID</span><span class="value">${booking.flightId}</span></div>
    <div class="row"><span class="label">Trip Type</span><span class="value">${booking.tripType}</span></div>
    <div class="row"><span class="label">Status</span><span class="value">${booking.status}</span></div>
    <div class="row"><span class="label">Booked On</span><span class="value">${new Date(booking.bookedAt).toLocaleString('en-IN')}</span></div>
  </div>
  <div class="section">
    <h3>Contact</h3>
    <div class="row"><span class="label">Email</span><span class="value">${booking.contactEmail}</span></div>
    <div class="row"><span class="label">Phone</span><span class="value">${booking.contactPhone || 'N/A'}</span></div>
  </div>
  <div class="section">
    <h3>Fare</h3>
    <div class="row"><span class="label">Base Fare</span><span class="value">₹${booking.baseFare.toLocaleString('en-IN')}</span></div>
    <div class="row"><span class="label">Total Fare</span><span class="value">₹${booking.totalFare.toLocaleString('en-IN')}</span></div>
  </div>
  <div class="footer"><p>Computer-generated e-ticket. SkyBooker © ${new Date().getFullYear()}</p></div>
</body>
</html>`;

    const blob = new Blob([ticketHtml], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `SkyBooker-Ticket-${booking.pnrCode}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  checkIn(booking: BookingDisplay) {
    alert(`Online check-in initiated for PNR: ${booking.pnrCode}`);
  }
}