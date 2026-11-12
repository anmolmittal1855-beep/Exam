import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import Overview from './components/dashboard/Overview';
import ExamCalendar from './pages/ExamCalendar';
import Assignments from './pages/Assignments';
import StudyPlanner from './pages/StudyPlanner';
import Subjects from './pages/Subjects';
import Resources from './pages/Resources';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="calendar" element={<ExamCalendar />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="planner" element={<StudyPlanner />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="resources" element={<Resources />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
