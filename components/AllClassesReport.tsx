import React, { useMemo } from 'react';
import type { AppState, CombinedMonthlyTardinessReport } from '../types';

interface AllClassesReportProps {
  appData: AppState;
  selectedDate: string;
}

const AllClassesReport: React.FC<AllClassesReportProps> = ({ appData, selectedDate }) => {
  
  const getMonthName = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // To avoid timezone issues
    return date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  };

  const combinedReport = useMemo((): CombinedMonthlyTardinessReport[] => {
    const report: { [key: string]: { className: string, studentName: string, totalMinutes: number; lateCount: number } } = {};
    const [year, month] = selectedDate.split('-');
    
    for (const className in appData) {
      const classData = appData[className];
      for (const date in classData.records) {
        if (date.startsWith(`${year}-${month}`)) {
          const dailyRecord = classData.records[date];
          for (const studentName in dailyRecord) {
            const key = `${className}-${studentName}`; // Unique key per student per class
            if (!report[key]) {
              report[key] = { studentName, className, totalMinutes: 0, lateCount: 0 };
            }
            report[key].totalMinutes += dailyRecord[studentName];
            report[key].lateCount += 1;
          }
        }
      }
    }

    return Object.values(report)
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [appData, selectedDate]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">
        Laporan Gabungan Keterlambatan - {getMonthName(selectedDate)}
      </h2>
      
      {combinedReport.length > 0 ? (
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left table-auto">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700 z-10">
              <tr>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">No.</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Siswa</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Kelas</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Total Menit</th>
                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Jumlah Hari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {combinedReport.map(({ studentName, className, totalMinutes, lateCount }, index) => (
                <tr key={`${className}-${studentName}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3 text-slate-500 dark:text-slate-400">{index + 1}</td>
                  <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{studentName}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{className}</td>
                  <td className="p-3 text-center text-red-600 dark:text-red-400 font-bold">{totalMinutes}</td>
                  <td className="p-3 text-center text-slate-500 dark:text-slate-400">{lateCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 py-10">
          Tidak ada keterlambatan yang tercatat di bulan ini untuk seluruh kelas.
        </p>
      )}
    </div>
  );
};

export default AllClassesReport;
