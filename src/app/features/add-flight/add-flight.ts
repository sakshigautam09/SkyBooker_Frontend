import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService } from '../../services/flight.service';
import { SeatService } from '../../services/seat.service';

interface SeatConfig {
  seatClass: 'Economy' | 'Business' | 'First';
  rows: number;
  columns: string[];
  priceMultiplier: number;
}

@Component({
  selector: 'app-add-flight',
  imports: [FormsModule],
  templateUrl: './add-flight.html',
  styleUrl: './add-flight.css'
})
export class AddFlight {
  loading = false;
  successMsg = '';
  errorMsg = '';
  seedingSeats = false;
  seatSeedMsg = '';

  flight = {
    flightNumber: '',
    airlineId: null as number | null,
    originAirportCode: '',
    destinationAirportCode: '',
    departureTime: '',
    arrivalTime: '',
    aircraftType: '',
    totalSeats: null as number | null,
    basePrice: null as number | null,
    status: 'ON_TIME'
  };

  addSeatsEnabled = true;

  seatConfigs: SeatConfig[] = [
    { seatClass: 'Economy',  rows: 20, columns: ['A','B','C','D','E','F'], priceMultiplier: 1.0 },
    { seatClass: 'Business', rows: 4,  columns: ['A','B','C','D'],         priceMultiplier: 2.5 },
    { seatClass: 'First',    rows: 2,  columns: ['A','B'],                 priceMultiplier: 4.0 }
  ];

  statuses = ['ON_TIME', 'DELAYED', 'CANCELLED', 'DEPARTED', 'ARRIVED'];
  aircraftTypes = [
    'Boeing 737', 'Boeing 777', 'Boeing 787 Dreamliner',
    'Airbus A320', 'Airbus A321', 'Airbus A330', 'Airbus A350', 'ATR 72'
  ];

  allColumns = ['A', 'B', 'C', 'D', 'E', 'F'];

  constructor(
    private flightService: FlightService,
    private seatService: SeatService,
    private router: Router
  ) {}

  getTotalSeatCount(): number {
    return this.seatConfigs.reduce((sum, cfg) => sum + cfg.rows * cfg.columns.length, 0);
  }

  isColSelected(config: SeatConfig, col: string): boolean {
    return config.columns.includes(col);
  }

  toggleColumn(config: SeatConfig, col: string) {
    const idx = config.columns.indexOf(col);
    if (idx === -1) config.columns.push(col);
    else config.columns.splice(idx, 1);
    config.columns.sort();
  }

  isFormValid(): boolean {
  const f = this.flight;

  const effectiveTotalSeats = this.addSeatsEnabled
    ? this.getTotalSeatCount()
    : f.totalSeats;

  const airlineId = Number(f.airlineId);
  const basePrice = Number(f.basePrice);

  return !!(
    f.flightNumber?.trim() &&
    airlineId > 0 &&                          // ✅ force number
    f.originAirportCode?.trim() &&
    f.destinationAirportCode?.trim() &&
    f.departureTime &&
    f.arrivalTime &&
    f.aircraftType &&
    effectiveTotalSeats && effectiveTotalSeats > 0 &&
    basePrice > 0 &&                          // ✅ force number
    f.originAirportCode.trim().toUpperCase() !== f.destinationAirportCode.trim().toUpperCase() &&
    new Date(f.arrivalTime) > new Date(f.departureTime)
  );
}

  onSubmit() {
    this.errorMsg    = '';
    this.successMsg  = '';
    this.seatSeedMsg = '';

    // ✅ KEY FIX: sync totalSeats BEFORE validation
    // When addSeatsEnabled=true, flight.totalSeats is null (readonly display)
    // so we must set it from getTotalSeatCount() before isFormValid() runs
    if (this.addSeatsEnabled) {
      this.flight.totalSeats = this.getTotalSeatCount();
    }

    if (!this.isFormValid()) {
      this.errorMsg = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;

    const payload = {
  ...this.flight,
  flightNumber:           this.flight.flightNumber.trim().toUpperCase(),
  originAirportCode:      this.flight.originAirportCode.trim().toUpperCase(),
  destinationAirportCode: this.flight.destinationAirportCode.trim().toUpperCase(),
  totalSeats:             this.addSeatsEnabled ? this.getTotalSeatCount() : this.flight.totalSeats,
  airlineId:              Number(this.flight.airlineId),   // ✅ add this
  basePrice:              Number(this.flight.basePrice),   // ✅ add this
};

    this.flightService.addFlight(payload).subscribe({
      next: (createdFlight: any) => {
        this.loading = false;
        const flightId = createdFlight.flightId;

        if (this.addSeatsEnabled) {
          this.seedSeats(
            flightId,
            payload.flightNumber,
            payload.originAirportCode,
            payload.destinationAirportCode
          );
        } else {
          this.successMsg = `Flight ${payload.flightNumber} added successfully!`;
          this.resetForm();
        }
      },
      error: (err: any) => {
        this.loading  = false;
        this.errorMsg = err.error?.message || 'Failed to add flight. Please try again.';
      }
    });
  }

  private seedSeats(flightId: number, flightNum: string, origin: string, dest: string) {
    this.seedingSeats = true;
    this.seatSeedMsg  = 'Adding seats...';

    const seatRequests: any[] = [];
    let startRow = 1;

    // First → Business → Economy order
    const orderedConfigs = [...this.seatConfigs].sort((a, b) => {
      const order: any = { 'First': 0, 'Business': 1, 'Economy': 2 };
      return order[a.seatClass] - order[b.seatClass];
    });

    for (const cfg of orderedConfigs) {
      if (cfg.rows === 0 || cfg.columns.length === 0) continue;

      for (let r = 0; r < cfg.rows; r++) {
        const rowNum = startRow + r;
        for (const col of cfg.columns) {
          seatRequests.push({
            flightId,
            seatNumber:      `${rowNum}${col}`,
            seatClass:       cfg.seatClass,
            row:             rowNum,
            column:          col,
            isWindow:        col === 'A' || col === cfg.columns[cfg.columns.length - 1],
            isAisle:         col === 'C' || col === 'D',
            hasExtraLegroom: r === 0, // first row of each class
            priceMultiplier: cfg.priceMultiplier
          });
        }
      }
      startRow += cfg.rows;
    }

    // Single bulk API call — POST /api/seats with full array
    this.seatService.addSeatsBulk(seatRequests).subscribe({
      next: () => {
        this.seedingSeats = false;
        this.seatSeedMsg  = '';
        this.successMsg   = `Flight ${flightNum} (${origin} → ${dest}) added with ${seatRequests.length} seats!`;
        this.resetForm();
      },
      error: (err: any) => {
        this.seedingSeats = false;
        this.errorMsg = err.error?.message
          || 'Flight added but seat seeding failed. Please retry manually via Swagger.';
      }
    });
  }

  resetForm() {
    this.flight = {
      flightNumber: '', airlineId: null,
      originAirportCode: '', destinationAirportCode: '',
      departureTime: '', arrivalTime: '',
      aircraftType: '', totalSeats: null, basePrice: null,
      status: 'ON_TIME'
    };
    this.seatConfigs = [
      { seatClass: 'Economy',  rows: 20, columns: ['A','B','C','D','E','F'], priceMultiplier: 1.0 },
      { seatClass: 'Business', rows: 4,  columns: ['A','B','C','D'],         priceMultiplier: 2.5 },
      { seatClass: 'First',    rows: 2,  columns: ['A','B'],                 priceMultiplier: 4.0 }
    ];
  }

  getDuration(): string {
    if (!this.flight.departureTime || !this.flight.arrivalTime) return '';
    const diff = new Date(this.flight.arrivalTime).getTime()
               - new Date(this.flight.departureTime).getTime();
    if (diff <= 0) return '';
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  }
}