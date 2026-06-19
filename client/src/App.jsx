import { Routes, Route, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PenLine,
  Images,
  Mail,
  Calendar,
  TrendingUp,
  User,
  Settings,
  Camera,
} from 'lucide-react';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Sidebar from './components/layout/Sidebar';

import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Entries from './pages/Entries';
import WriteEntry from './pages/WriteEntry';
import EntryDetail from './pages/EntryDetail';
import Timeline from './pages/Timeline';
import Gallery from './pages/Gallery';
import FutureLetters from './pages/FutureLetters';
import FutureLetterDetail from './pages/FutureLetterDetail';
import MonthlyReflection from './pages/MonthlyReflection';
import MonthlyReport from './pages/MonthlyReport';
import YearlyReview from './pages/YearlyReview';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';

function Shell({ children }) {
  return (
    <div className="app-shell min-h-screen pl-64">
      <Sidebar />
      {children}
    </div>
  );
}

const pages = [
  {
    path: '/dashboard',
    title: 'Dear Diary',
    subtitle: 'Welcome back, here is your reflection summary.',
    icon: LayoutDashboard,
    element: <Dashboard />,
  },
  {
    path: '/entries',
    title: "My Entries",
    subtitle: "Look back on the days you've kept",
    icon: BookOpen,
    element: <Entries />,
  },
  {
    path: '/write',
    title: "Today's Entry",
    subtitle: 'Capture this moment before it fades',
    icon: PenLine,
    element: <WriteEntry />,
  },
  {
    path: '/timeline',
    title: 'Memories Timeline',
    subtitle: 'A scrapbook of moments, pasted in order',
    icon: Images,
    element: <Timeline />,
  },
  {
    path: '/gallery',
    title: 'Photo Gallery',
    subtitle: 'Every picture tells a piece of your story',
    icon: Camera,
    element: <Gallery />,
  },
  {
    path: '/letters',
    title: 'Future Letters',
    subtitle: 'Seal a message for the days ahead',
    icon: Mail,
    element: <FutureLetters />,
  },
  {
    path: '/reflection',
    title: 'Monthly Reflection',
    subtitle: 'Take a moment before the page turns',
    icon: Calendar,
    element: <MonthlyReflection />,
  },
  {
    path: '/reflection/report',
    title: 'Monthly Report',
    subtitle: 'Your month, distilled into one beautiful page',
    icon: Calendar,
    element: <MonthlyReport />,
  },
  {
    path: '/yearly',
    title: 'Yearly Review',
    subtitle: 'A look back at the year you lived and wrote',
    icon: TrendingUp,
    element: <YearlyReview />,
  },
  {
    path: '/profile',
    title: 'Profile & Personalization',
    subtitle: 'Make your diary feel like yours',
    icon: User,
    element: <Profile />,
  },
  {
    path: '/settings',
    title: 'Settings',
    subtitle: 'Manage your account and journal',
    icon: Settings,
    element: <SettingsPage />,
  },
];

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Entry Detail */}
      <Route
        path="/entries/:id"
        element={
          <ProtectedRoute>
            <Shell>
              <main className="min-h-screen px-8 py-8">
                <EntryDetail />
              </main>
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* Future Letter Detail */}
      <Route
        path="/letters/:id"
        element={
          <ProtectedRoute>
            <Shell>
              <main className="min-h-screen px-8 py-8">
                <FutureLetterDetail />
              </main>
            </Shell>
          </ProtectedRoute>
        }
      />

      {/* Main Pages */}
      {pages.map(({ path, title, subtitle, icon, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <AppLayout
                title={title}
                subtitle={subtitle}
                icon={icon}
              />
            </ProtectedRoute>
          }
        >
          <Route index element={element} />
        </Route>
      ))}

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/write" replace />} />
      <Route path="*" element={<Navigate to="/write" replace />} />
    </Routes>
  );
}