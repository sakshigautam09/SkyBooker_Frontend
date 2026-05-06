import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { PassengerService } from '../../services/passenger.service';
import { FlightService } from '../../services/flight.service';
import { SeatService, Seat } from '../../services/seat.service';
import { NotificationService } from '../../services/notification.service';

interface PassengerForm {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  passportNumber: string;
  nationality: string;
  passportExpiry: string;
}

function emptyPassenger(): PassengerForm {
  return {
    title: '', firstName: '', lastName: '', email: '',
    phone: '', dob: '', gender: '', passportNumber: '',
    nationality: '', passportExpiry: ''
  };
}

@Component({
  selector: 'app-booking',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit, OnDestroy {
  step = 1;
  bookingComplete = false;
  processing = false;
  randomRef = '';
  flightId = 0;
  airlineCode  = 'EK';
  flightNumber = '511';
  origin       = 'N/A';
  destination  = 'N/A';
  departureTime = '';

  // ── Multi-passenger ────────────────────────────────────────────────────────
  passengers = 1;
  passengerForms: PassengerForm[] = [emptyPassenger()];
  errors: { [key: string]: string }[] = [{}];

  // ── Seat Map ───────────────────────────────────────────────────────────────
  allSeats: Seat[] = [];
  seatRows: number[] = [];
  seatColumns: string[] = [];
  seatsLoading = false;
  seatsError = '';
  selectedSeat: Seat | null = null;  // ✅ explicit type — fixes 'never' error
  holdingInProgress = false;
  holdError = '';

  // ── Pricing ────────────────────────────────────────────────────────────────
  basePrice = 0;
  tax = 0;

  private userId = 0;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private passengerService: PassengerService,
    private flightService: FlightService,
    private seatService: SeatService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.userId = parseInt(localStorage.getItem('userId') || '0');

    this.route.queryParams.subscribe(params => {
      this.flightId      = params['flightId']      ? parseInt(params['flightId'])    : 1;
      this.basePrice     = params['basePrice']     ? parseFloat(params['basePrice']) : 0;
      this.passengers    = params['passengers']    ? parseInt(params['passengers'])  : 1;
      this.airlineCode   = params['airlineCode']   ?? 'EK';
      this.flightNumber  = params['flightNumber']  ?? '511';
      this.origin        = params['origin']        ?? 'N/A';
      this.destination   = params['destination']   ?? 'N/A';
      this.departureTime = params['departureTime'] ?? new Date().toISOString();
      this.tax = Math.round(this.basePrice * this.passengers * 0.18);

      this.passengerForms = Array.from({ length: this.passengers }, () => emptyPassenger());
      this.errors         = Array.from({ length: this.passengers }, () => ({}));
    });
  }

  ngOnDestroy() {
    if (this.selectedSeat && this.userId) {
      this.seatService.releaseSeat(this.selectedSeat.seatId, this.userId).subscribe();
    }
  }

  // ── Step Navigation ────────────────────────────────────────────────────────
  nextStep() {
    if (this.step === 1 && !this.validateAllPassengers()) return;
    if (this.step === 1) {
      this.step = 2;
      this.loadSeatMap();
      return;
    }
    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  // ── Seat Map ───────────────────────────────────────────────────────────────
  loadSeatMap() {
    this.seatsLoading = true;
    this.seatsError   = '';

    this.seatService.getSeatsByFlight(this.flightId).subscribe({
      next: (seats) => {
        this.seatsLoading = false;
        this.allSeats     = seats;
        this.seatRows     = [...new Set(seats.map(s => s.row))].sort((a, b) => a - b);
        this.seatColumns  = [...new Set(seats.map(s => s.column))].sort();
      },
      error: () => {
        this.seatsLoading = false;
        this.seatsError   = 'Could not load seat map. Please try again.';
      }
    });
  }

  getSeat(row: number, col: string): Seat | undefined {
    return this.allSeats.find(s => s.row === row && s.column === col);
  }

  getSeatClass(seat: Seat | undefined): string {
    if (!seat) return 'seat-empty';
    if (seat.status === 'Confirmed' || seat.status === 'Held') return 'seat-occupied';
    if (seat.status === 'Blocked') return 'seat-blocked';
    if (this.selectedSeat?.seatId === seat.seatId) return 'seat-selected';
    return 'seat-available';
  }

  onSeatClick(seat: Seat | undefined) {
    if (!seat) return;
    if (seat.status === 'Confirmed' || seat.status === 'Held' || seat.status === 'Blocked') return;
    if (this.holdingInProgress) return;

    if (this.selectedSeat?.seatId === seat.seatId) {
      this.releaseCurrent();
      return;
    }

    if (this.selectedSeat) {
      this.seatService.releaseSeat(this.selectedSeat.seatId, this.userId).subscribe();
      this.selectedSeat = null;
    }

    this.holdSeat(seat);
  }

  private holdSeat(seat: Seat) {
    this.holdingInProgress = true;
    this.holdError         = '';

    this.seatService.holdSeat(seat.seatId, this.userId).subscribe({
      next: (updatedSeat: Seat) => {
        this.holdingInProgress = false;
        this.selectedSeat      = updatedSeat;
        const idx = this.allSeats.findIndex(s => s.seatId === seat.seatId);
        if (idx !== -1) this.allSeats[idx] = updatedSeat;
      },
      error: (err: any) => {
        this.holdingInProgress = false;
        this.holdError = err.error?.message || 'Seat unavailable. Please choose another.';
        this.loadSeatMap();
      }
    });
  }

  private releaseCurrent() {
    if (!this.selectedSeat) return;
    const seatId = this.selectedSeat.seatId;
    this.selectedSeat = null;
    this.seatService.releaseSeat(seatId, this.userId).subscribe({
      next: (updatedSeat: Seat) => {
        const idx = this.allSeats.findIndex(s => s.seatId === seatId);
        if (idx !== -1) this.allSeats[idx] = updatedSeat;
      }
    });
  }

  // ── Pricing ────────────────────────────────────────────────────────────────
  getSeatPrice(): number {
    if (!this.selectedSeat) return 0;
    return Math.round(this.basePrice * (this.selectedSeat.priceMultiplier - 1));
  }

  getTotalAmount(): number {
    return (this.basePrice * this.passengers) + this.tax + this.getSeatPrice();
  }

  getTotal(): string        { return this.getTotalAmount().toLocaleString('en-IN'); }
  getBasePrice(): string    { return (this.basePrice * this.passengers).toLocaleString('en-IN'); }
  getTax(): string          { return this.tax.toLocaleString('en-IN'); }
  getSeatPriceStr(): string { return this.getSeatPrice().toLocaleString('en-IN'); }

  // ── Validation ─────────────────────────────────────────────────────────────
  validateAllPassengers(): boolean {
    let allValid = true;

    this.passengerForms.forEach((p, i) => {
      const err: { [key: string]: string } = {};

      if (!p.title)                 err['title']          = 'Title is required.';
      if (!p.firstName.trim())      err['firstName']      = 'First name is required.';
      if (!p.lastName.trim())       err['lastName']       = 'Last name is required.';
      if (!p.email.trim())          err['email']          = 'Email is required.';
      else if (!this.isValidEmail(p.email.trim())) err['email'] = 'Enter a valid email.';
      if (!p.dob)                   err['dob']            = 'Date of birth is required.';
      if (!p.gender)                err['gender']         = 'Gender is required.';
      if (!p.passportNumber.trim()) err['passportNumber'] = 'Passport number is required.';
      if (!p.nationality.trim())    err['nationality']    = 'Nationality is required.';
      if (!p.passportExpiry)        err['passportExpiry'] = 'Expiry date is required.';
      else if (new Date(p.passportExpiry) <= new Date())
                                    err['passportExpiry'] = 'Expiry must be a future date.';

      this.errors[i] = err;
      if (Object.keys(err).length > 0) allValid = false;
    });

    return allValid;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ── Complete Booking ───────────────────────────────────────────────────────
  completeBooking() {
    this.processing = true;

    const primaryPassenger = this.passengerForms[0];

    const bookingReq = {
      userId:         this.userId,
      flightId:       this.flightId,
      tripType:       'OneWay',
      seatIds:        this.selectedSeat ? [this.selectedSeat.seatId] : [],
      mealPreference: null,
      luggageKg:      0,
      contactEmail:   primaryPassenger.email.trim(),
      contactPhone:   primaryPassenger.phone?.trim() || null,
      basePrice:      this.basePrice * this.passengers
    };

    this.bookingService.createBooking(bookingReq).subscribe({
      next: (bookingRes: any) => {
        const bookingId = bookingRes.bookingId;

        // Confirm seat
        if (this.selectedSeat) {
          this.seatService.confirmSeat(this.selectedSeat.seatId, this.userId).subscribe({
            error: (err: any) => console.error('Seat confirm failed:', err)
          });
        }

        // Decrement available seats on flight
        this.flightService.decrementSeats(this.flightId).subscribe({
          error: (err: any) => console.error('Decrement failed:', err)
        });

        // Save ALL passengers
        const passengerSaves = this.passengerForms.map(p =>
          this.passengerService.addPassenger({
            bookingId:      bookingId,
            title:          p.title,
            firstName:      p.firstName.trim(),
            lastName:       p.lastName.trim(),
            dateOfBirth:    new Date(p.dob).toISOString(),
            gender:         p.gender,
            passportNumber: p.passportNumber.trim().toUpperCase(),
            nationality:    p.nationality.trim(),
            passportExpiry: new Date(p.passportExpiry).toISOString(),
            airlineCode:    this.airlineCode,
            flightNumber:   this.flightNumber
          })
        );

        let saved = 0;
        passengerSaves.forEach(obs => {
          obs.subscribe({
            next:  () => { saved++; if (saved === passengerSaves.length) this.finalizeBooking(bookingRes); },
            error: () => { saved++; if (saved === passengerSaves.length) this.finalizeBooking(bookingRes); }
          });
        });
      },
      error: (err: any) => {
        this.processing = false;
        alert('Booking failed: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  private finalizeBooking(bookingRes: any) {
    this.processing      = false;
    this.bookingComplete = true;
    this.randomRef = bookingRes.pnrCode
      || bookingRes.bookingReference
      || String(Math.floor(Math.random() * 90000) + 10000);

    const primaryPassenger = this.passengerForms[0];

    // ✅ capture seat before clearing — fixes 'never' type error
    const confirmedSeat: Seat | null = this.selectedSeat;
    this.selectedSeat = null; // prevent ngOnDestroy release

    // Send booking confirmation email with e-ticket PDF
    this.notificationService.sendBookingConfirmation({
      bookingId:      bookingRes.bookingId,
      recipientId:    this.userId,
      recipientName:  `${primaryPassenger.title} ${primaryPassenger.firstName} ${primaryPassenger.lastName}`.trim(),
      recipientEmail: primaryPassenger.email.trim(),
      recipientPhone: primaryPassenger.phone?.trim() || '',
      pnrCode:        bookingRes.pnrCode || this.randomRef,
      flightNumber:   `${this.airlineCode}-${this.flightNumber}`,
      origin:         this.origin,
      destination:    this.destination,
      departureTime:  this.departureTime || new Date().toISOString(),
      seatNumber:     confirmedSeat ? confirmedSeat.seatNumber : 'Not Selected',
      totalFare:      this.getTotalAmount()
    }).subscribe({
      next: () => console.log('Confirmation email sent.'),
      error: (err: any) => console.error('Notification failed (non-blocking):', err)
    });
  }
}