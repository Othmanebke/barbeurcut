import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

type GuardStep = 'booking' | 'confirmation';

interface ProtectedRouteProps {
  children: ReactNode;
  require: GuardStep;
}

export default function ProtectedRoute({ children, require }: ProtectedRouteProps) {
  const { state } = useBooking();

  if (require === 'booking' && !state.selectedService) {
    return <Navigate to="/prestations" replace />;
  }

  if (require === 'confirmation' && (!state.selectedService || !state.date || !state.time)) {
    return <Navigate to="/prestations" replace />;
  }

  return <>{children}</>;
}
