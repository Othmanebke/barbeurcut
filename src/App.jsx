import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import CustomCursor from './components/CustomCursor';
import { BookingProvider } from './context/BookingContext';

const Home         = lazy(() => import('./pages/Home'));
const Concept      = lazy(() => import('./pages/Concept'));
const Services     = lazy(() => import('./pages/Services'));
const Booking      = lazy(() => import('./pages/Booking'));
const Confirmation = lazy(() => import('./pages/Confirmation'));
const NotFound     = lazy(() => import('./pages/NotFound'));
const Admin        = lazy(() => import('./pages/Admin'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <svg className="w-8 h-8 text-brand animate-spin" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <line x1="20" y1="4" x2="8.5" y2="15.5" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" />
        <line x1="8.5" y1="8.5" x2="12" y2="12" />
      </svg>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <CustomCursor />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Site public ── */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="concept"     element={<Concept />} />
              <Route path="prestations" element={<Services />} />
              <Route path="reservation" element={
                <ProtectedRoute require="booking"><Booking /></ProtectedRoute>
              } />
              <Route path="confirmation" element={
                <ProtectedRoute require="confirmation"><Confirmation /></ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ── Dashboard barbier (hors Layout — pas de navbar/footer) ── */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </BookingProvider>
    </BrowserRouter>
  );
}
