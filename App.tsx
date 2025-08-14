import React, { useState } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { CLASS_NAMES } from './constants';
import type { AppState, ClassData } from './types';
import StudentManager from './components/StudentManager';
import { CalendarIcon, UserGroupIcon, DocumentChartBarIcon } from './components/Icons';
import AllClassesReport from './components/AllClassesReport';

const initialAppState: AppState = CLASS_NAMES.reduce((acc, className) => {
  acc[className] = { students: [], records: {} };
  return acc;
}, {} as AppState);

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

function App() {
  const [appData, setAppData] = useLocalStorage<AppState>('tardinessApp', initialAppState);
  const [selectedClass, setSelectedClass] = useState(CLASS_NAMES[0]);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [currentView, setCurrentView] = useState<'class' | 'all_classes'>('class');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string, duration = 3000) => {
    setNotification(message);
    setTimeout(() => {
        setNotification(null);
    }, duration);
  };

  const handleUpdateClassData = (newClassData: ClassData) => {
    setAppData(prevData => ({
      ...prevData,
      [selectedClass]: newClassData
    }));
  };

  return (
    <div className="min-h-screen font-sans">
      {notification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
          {notification}
        </div>
      )}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white text-center sm:text-left">
            Catatan Keterlambatan Siswa
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Class Selector */}
            {currentView === 'class' && (
              <div className="relative w-full sm:w-auto">
                <UserGroupIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 appearance-none"
                  aria-label="Pilih Kelas"
                >
                  {CLASS_NAMES.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
            {/* Date Picker */}
            <div className="relative w-full sm:w-auto">
              <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 appearance-none"
                aria-label="Pilih Tanggal"
              />
            </div>
             {/* View Toggle Button */}
            <button
                onClick={() => setCurrentView(currentView === 'class' ? 'all_classes' : 'class')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors w-full sm:w-auto"
            >
                {currentView === 'class' ? <DocumentChartBarIcon className="w-5 h-5"/> : <UserGroupIcon className="w-5 h-5" />}
                <span>{currentView === 'class' ? 'Laporan Gabungan' : 'Laporan per Kelas'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {currentView === 'class' ? (
            <StudentManager
              classData={appData[selectedClass] || { students: [], records: {} }}
              onUpdateClassData={handleUpdateClassData}
              selectedDate={selectedDate}
              onShowNotification={showNotification}
            />
        ) : (
            <AllClassesReport
                appData={appData}
                selectedDate={selectedDate}
            />
        )}
      </main>
      
      <footer className="text-center py-4 mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">Dibuat dengan ❤️ untuk pendataan yang lebih baik.</p>
      </footer>
    </div>
  );
}

export default App;