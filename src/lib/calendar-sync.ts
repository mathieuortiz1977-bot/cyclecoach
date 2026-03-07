// Calendar Integration — Generate .ics files for mobile calendar sync

export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export function generateICS(events: CalendarEvent[]): string {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CycleCoach//CycleCoach Training Plan//EN",
    "CALSCALE:GREGORIAN",
  ];

  const footer = ["END:VCALENDAR"];

  const eventStrings = events.map(event => {
    const start = formatDate(event.startDate);
    const end = formatDate(event.endDate);
    const uid = `${start}-${Math.random().toString(36).substr(2, 9)}@cyclecoach.app`;
    
    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.description)}`,
      ...(event.location ? [`LOCATION:${escapeICS(event.location)}`] : []),
      "STATUS:CONFIRMED",
      "TRANSP:OPAQUE",
      "END:VEVENT"
    ];
  }).flat();

  return [...header, ...eventStrings, ...footer].join('\r\n');
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (match) => {
    switch (match) {
      case '\\': return '\\\\';
      case ';': return '\\;';
      case ',': return '\\,';
      case '\n': return '\\n';
      default: return match;
    }
  });
}

export function downloadCalendar(events: CalendarEvent[], filename = 'cyclecoach-training.ics') {
  const icsContent = generateICS(events);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

export function generateTrainingEvents(
  plan: any, 
  startDate: Date, 
  trainingDays: string[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  let currentDate = new Date(startDate);

  plan.blocks.forEach((block: any, blockIdx: number) => {
    block.weeks.forEach((week: any, weekIdx: number) => {
      week.sessions.forEach((session: any) => {
        if (!trainingDays.includes(session.dayOfWeek)) return;
        
        // Find the date for this session
        const targetDay = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].indexOf(session.dayOfWeek);
        const currentDay = currentDate.getDay();
        const daysToAdd = (targetDay - currentDay + 7) % 7;
        
        const sessionDate = new Date(currentDate);
        sessionDate.setDate(sessionDate.getDate() + daysToAdd);
        
        const startTime = new Date(sessionDate);
        startTime.setHours(session.sessionType === "INDOOR" ? 6 : 7, 0, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + session.duration);

        events.push({
          title: `🚴 ${session.title}`,
          description: `${session.description}\n\nBlock: ${block.type} | Week: ${week.weekType}\nDuration: ${session.duration} minutes\nType: ${session.sessionType}`,
          startDate: startTime,
          endDate: endTime,
          location: session.sessionType === "INDOOR" ? "Indoor Trainer" : session.route?.name || "Outdoor Route"
        });
      });
      
      currentDate.setDate(currentDate.getDate() + 7);
    });
  });

  return events;
}