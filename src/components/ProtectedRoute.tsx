import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

type GuardStep = 'booking' | 'confirmation';

interface ProtectedRouteProps {
  children: ReactNode;
  require: GuardStep;
}

export default function ProtectedRoute({ children, require }: ProtectedRouteProps) {
  const { state } = useBooking();
  const location = useLocation();

  if (require === 'booking' && !state.selectedService) {
    return <Navigate to="/prestations" replace />;
  }

  if (require === 'confirmation') {
    // Accepter si booking solo (context) OU groupe/multi (location.state)
    const hasGroupData = Boolean((location.state as any)?.multiBookings);
    const hasSoloData  = Boolean(state.selectedService && state.date && state.time);
    if (!hasGroupData && !hasSoloData) {
      return <Navigate to="/prestations" replace />;
    }
  }

  return <>{children}</>;
}
