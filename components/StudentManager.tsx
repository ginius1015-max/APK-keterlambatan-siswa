import React, { useState, useMemo, useEffect } from 'react';
import type { ClassData, MonthlyTardinessReport } from '../types';
import { EditIcon, PlusIcon, SaveIcon, TrashIcon } from './Icons';

interface StudentManagerProps {
  classData: ClassData;
  onUpdateClassData: (newClassData: ClassData) => void;
  selectedDate: string;
  onShowNotification: (message: string) => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ classData, onUpdateClassData, selectedDate, onShowNotification }) => {
  const [isEditingStudents, setIsEditingStudents] = useState(false);
  const [studentListText, setStudentListText] = useState(classData.students.join('\n'));
  const [editingLateStudent, setEditingLateStudent] = useState<string | null>(null);
  const [lateMinutes, setLateMinutes] = useState(1);

  // Update student list text if class data changes from parent (e.g., class selection change)
  useEffect(() => {
    setStudentListText(classData.students.join('\n'));
  }, [classData.students]);

  const dailyTardyStudents = useMemo(() => {
    return classData.records[selectedDate] || {};
  }, [classData.records, selectedDate]);

  const monthlyReport = useMemo((): MonthlyTardinessReport[] => {
    const report: { [studentName: string]: { totalMinutes: number; lateCount: number } } = {};
    const [year, month] = selectedDate.split('-');
    
    for (const date in classData.records) {
      if (date.startsWith(`${year}-${month}`)) {
        const dailyRecord = classData.records[date];
        for (const studentName in dailyRecord) {
          if (!report[studentName]) {
            report[studentName] = { totalMinutes: 0, lateCount: 0 };
          }
          report[studentName].totalMinutes += dailyRecord[studentName];
          report[studentName].lateCount += 1;
        }
      }
    }

    return Object.entries(report)
      .map(([studentName, data]) => ({ studentName, ...data }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [classData.records, selectedDate]);

  const handleSaveStudents = () => {
    const newStudents = studentListText.split('\n').map(s => s.trim()).filter(Boolean);
    const newStudentsSet = new Set(newStudents);

    // Rebuild the records, only keeping entries for students who are still in the new list.
    const updatedRecords: ClassData['records'] = {};
    for (const date in classData.records) {
        const dailyRecord = classData.records[date];
        const newDailyRecord: typeof dailyRecord = {};
        let hasEntries = false;
        
        for(const studentName in dailyRecord) {
            if(newStudentsSet.has(studentName)) {
                newDailyRecord[studentName] = dailyRecord[studentName];
                hasEntries = true;
            }
        }

        if (hasEntries) {
            updatedRecords[date] = newDailyRecord;
        }
    }

    onUpdateClassData({ students: newStudents, records: updatedRecords });
    setIsEditingStudents(false);
    onShowNotification('Daftar siswa berhasil disimpan!');
  };
  
  const handleCancelEdit = () => {
    setStudentListText(classData.students.join('\n'));
    setIsEditingStudents(false);
  };

  const handleMarkLate = (studentName: string) => {
    const newRecords = { ...classData.records };
    if (!newRecords[selectedDate]) {
      newRecords[selectedDate] = {};
    }
    newRecords[selectedDate][studentName] = lateMinutes;
    onUpdateClassData({ ...classData, records: newRecords });
    setEditingLateStudent(null);
    setLateMinutes(1);
  };

  const handleRemoveLateEntry = (studentName: string) => {
    const newRecords = { ...classData.records };
    if (newRecords[selectedDate]) {
      delete newRecords[selectedDate][studentName];
      if (Object.keys(newRecords[selectedDate]).length === 0) {
        delete newRecords[selectedDate];
      }
    }
    onUpdateClassData({ ...classData, records: newRecords });
  };
  
  const handleStartEditingLate = (studentName: string) => {
    setLateMinutes(dailyTardyStudents[studentName] || 1);
    setEditingLateStudent(studentName);
  }

  return (
    <div className="space-y-8">
      {/* Student List and Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Daftar Siswa</h2>
          {!isEditingStudents ? (
             <button onClick={() => setIsEditingStudents(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <EditIcon className="w-5 h-5"/>
              <span>Ubah Daftar</span>
            </button>
          ) : (
             <div className="flex gap-2">
                <button onClick={handleSaveStudents} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <SaveIcon className="w-5 h-5"/>
                    <span>Simpan</span>
                </button>
                 <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Batal
                </button>
            </div>
          )}
        </div>

        {isEditingStudents ? (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Masukkan satu nama siswa per baris. Perubahan akan menghapus catatan keterlambatan untuk siswa yang dihapus dari daftar.</p>
            <textarea
              value={studentListText}
              onChange={(e) => setStudentListText(e.target.value)}
              className="w-full h-64 p-3 border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="Contoh:&#10;Budi Hartono&#10;Siti Aminah"
            />
          </div>
        ) : (
          <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {classData.students.length > 0 ? classData.students.sort().map(student => {
              const isLate = student in dailyTardyStudents;
              const isEditingThisStudent = editingLateStudent === student;

              return (
                <li
                  key={student}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${isLate ? 'bg-red-100 dark:bg-red-900/50' : 'bg-slate-100 dark:bg-slate-700/50'}`}
                >
                  <span className={`font-medium ${isLate ? 'text-red-800 dark:text-red-200' : 'text-slate-700 dark:text-slate-200'}`}>{student}</span>
                  
                  {isLate ? (
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-red-700 dark:text-red-300 bg-red-200 dark:bg-red-800 px-2 py-1 rounded">{dailyTardyStudents[student]} menit</span>
                        <button onClick={() => handleRemoveLateEntry(student)} className="text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                     </div>
                  ) : (
                    isEditingThisStudent ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={lateMinutes}
                          onChange={(e) => setLateMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 p-1 text-center border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleMarkLate(student)}
                        />
                        <button onClick={() => handleMarkLate(student)} className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600">Simpan</button>
                        <button onClick={() => setEditingLateStudent(null)} className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-sm rounded-md hover:bg-gray-400">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => handleStartEditingLate(student)} className="flex items-center gap-1 px-3 py-1 text-sm text-orange-600 dark:text-orange-400 border border-orange-500 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
                        <PlusIcon className="w-4 h-4" />
                        <span>Tandai Terlambat</span>
                      </button>
                    )
                  )}
                </li>
              );
            }) : <p className="text-center text-slate-500 dark:text-slate-400 py-8">Belum ada siswa di kelas ini. Klik 'Ubah Daftar' untuk menambahkan.</p>}
          </ul>
        )}
      </div>

      {/* Reports */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Daily Report */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Laporan Harian ({selectedDate})</h3>
          {Object.keys(dailyTardyStudents).length > 0 ? (
            <ul className="space-y-2">
              {Object.entries(dailyTardyStudents).sort(([, a], [, b]) => b - a).map(([name, minutes]) => (
                <li key={name} className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{name}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{minutes} menit</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-6">Tidak ada siswa yang terlambat hari ini. Bagus!</p>
          )}
        </div>

        {/* Monthly Report */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Laporan Bulanan</h3>
          {monthlyReport.length > 0 ? (
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                  <tr>
                    <th className="p-2 font-semibold text-slate-600 dark:text-slate-300">Siswa</th>
                    <th className="p-2 font-semibold text-slate-600 dark:text-slate-300">Total Menit</th>
                    <th className="p-2 font-semibold text-slate-600 dark:text-slate-300">Jumlah Hari</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {monthlyReport.map(({ studentName, totalMinutes, lateCount }) => (
                    <tr key={studentName}>
                      <td className="p-2 font-medium text-slate-600 dark:text-slate-300">{studentName}</td>
                      <td className="p-2 text-center text-red-600 dark:text-red-400 font-semibold">{totalMinutes}</td>
                      <td className="p-2 text-center text-slate-500 dark:text-slate-400">{lateCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-6">Belum ada catatan keterlambatan di bulan ini.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManager;