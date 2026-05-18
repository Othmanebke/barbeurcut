import { createContext, ReactNode, useContext, useState } from 'react';
import type { ServiceItem } from '../data/services';
import { z } from 'zod';
import { createBooking } from '../api/booking';

export const bookingSchema = z.object({
  name:  z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  phone: z.string().regex(/^0[67]\d{8}$/, {
    message: 'Téléphone invalide — doit commencer par 06 ou 07',
  }),
});

export type ClientInfo = z.infer<typeof bookingSchema>;

export interface BookingState {
  selectedService: ServiceItem | null;
  location: string;
  date: string;
  time: string;
  clientInfo: ClientInfo;
  confirmationNumber: string;
}

export interface BookingContextValue {
  state: BookingState;
  isLoading: boolean;
  selectService: (service: ServiceItem) => void;
  selectLocation: (location: string) => void;
  selectDate: (date: string) => void;
  selectTime: (time: string) => void;
  setClientInfo: (info: ClientInfo) => void;
  submitBooking: () => Promise<string>;
  resetBooking: () => void;
}

const defaultState: BookingState = {
  selectedService: null,
  location: 'Wonder Cut',
  date: '',
  time: '',
  clientInfo: { name: '', phone: '' },
  confirmationNumber: '',
};

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState]     = useState<BookingState>(defaultState);
  const [isLoading, setLoading] = useState(false);

  const selectService  = (s: ServiceItem)  => setState(p => ({ ...p, selectedService: s }));
  const selectLocation = (loc: string)     => setState(p => ({ ...p, location: loc }));
  const selectDate     = (d: string)       => setState(p => ({ ...p, date: d }));
  const selectTime     = (t: string)       => setState(p => ({ ...p, time: t }));
  const setClientInfo  = (info: ClientInfo) => setState(p => ({ ...p, clientInfo: { ...p.clientInfo, ...info } }));

  const submitBooking = async (): Promise<string> => {
    /* Validation Zod */
    bookingSchema.parse(state.clientInfo);
    if (!state.selectedService || !state.date || !state.time) {
      throw new Error('Le tunnel de réservation est incomplet.');
    }

    setLoading(true);
    try {
      const confirmationNumber = await createBooking({
        service:     state.selectedService,
        date:        state.date,
        time:        state.time,
        clientName:  state.clientInfo.name,
        clientPhone: state.clientInfo.phone,
      });

      setState(p => ({ ...p, confirmationNumber }));
      return confirmationNumber;
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => setState(defaultState);

  return (
    <BookingContext.Provider value={{
      state, isLoading,
      selectService, selectLocation, selectDate, selectTime,
      setClientInfo, submitBooking, resetBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}
