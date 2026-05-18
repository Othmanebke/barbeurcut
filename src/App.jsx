import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import CustomCursor from './components/CustomCursor';
import SplashLoader from './components/SplashLoader';
import { BookingProvider } from './context/BookingContext';

/* Garantit que l'animation du splash (~2.4s) a le temps de se terminer */
const MIN_SPLASH = 2600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lazyMin = (fn) => lazy(() => Promise.all([fn(), sleep(MIN_SPLASH)]).then(([mod]) => mod));

const Home           = lazyMin(() => import('./pages/Home'));
const Concept        = lazyMin(() => import('./pages/Concept'));
const Services       = lazyMin(() => import('./pages/Services'));
const Booking        = lazyMin(() => import('./pages/Booking'));
const Confirmation   = lazyMin(() => import('./pages/Confirmation'));
const NotFound       = lazyMin(() => import('./pages/NotFound'));
const Admin          = lazyMin(() => import('./pages/Admin'));
const ProtectedRoute = lazyMin(() => import('./components/ProtectedRoute'));

export default function App() {
  return (
    <BrowserRouter>
      <BookingProvider>
        <CustomCursor />
        <Suspense fallback={<SplashLoader />}>
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
