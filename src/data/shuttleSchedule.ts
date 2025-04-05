//shuttleSchedule.ts
export const shuttleSchedule = {
  LOY: [
    '09:15', '09:30', '09:45', '10:15', '10:45', '11:00', '11:15',
    '12:00', '12:15', '12:45', '13:00', '13:15', '13:45', '14:15',
    '14:30', '14:45', '15:15', '15:30', '15:45', '16:45', '17:15',
    '17:45', '18:15'
  ],
  SGW: [
    '09:45', '10:00', '10:15', '10:45', '11:15', '11:30', '12:15',
    '12:30', '12:45', '13:15', '13:45', '14:00', '14:15', '14:45',
    '15:00', '15:15', '15:45', '16:00', '16:45', '17:15', '17:45',
    '18:15'
  ]
};

export const shuttleInfo = {
  operatingDays: 'Monday through Friday',
  rideTime: '30 minutes',
  firstDepartureLOY: '09:15',
  firstDepartureSGW: '09:45',
  lastDepartureLOY: '18:15',
  lastDepartureSGW: '18:15',
  requirements: [
    'Concordia ID card required',
    'Buses may depart early if at capacity',
    'Times are approximate and may vary due to traffic/weather'
  ]
}; 