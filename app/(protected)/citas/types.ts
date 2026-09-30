export type AppointmentView = {
  id: string;
  title: string;
  notes: string | null;
  scheduledAt: string; // instante ISO
  dateLabel: string; // "martes, 6 de octubre" (con año si no es el año en curso)
  timeLabel: string; // "10:30 a.m."
};

export type AppointmentValues = {
  title: string;
  date: string;
  time: string;
  notes: string | null;
};
