export interface TardinessRecord {
  [studentName: string]: number; // key is student name, value is minutes late
}

export interface DailyRecords {
  [date: string]: TardinessRecord; // key is date in 'YYYY-MM-DD' format
}

export interface ClassData {
  students: string[];
  records: DailyRecords;
}

export interface AppState {
  [className: string]: ClassData; // key is class name e.g., "MIPA 1"
}

export interface MonthlyTardinessReport {
    studentName: string;
    totalMinutes: number;
    lateCount: number;
}

export interface CombinedMonthlyTardinessReport extends MonthlyTardinessReport {
    className: string;
}