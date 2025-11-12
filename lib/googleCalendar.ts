import { google } from 'googleapis';
import { Job } from './types';

export interface CalendarConfig {
  serviceAccountEmail: string;
  privateKey: string;
  calendarId: string; // The calendar to create events in
  timezone?: string;
}

export interface CalendarEvent {
  id?: string;
  summary: string; // Event title
  description?: string;
  location?: string;
  start: {
    dateTime: string; // ISO 8601 format
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

export interface AvailabilityCheck {
  start: string;
  end: string;
  isAvailable: boolean;
  conflictingEvents?: string[];
}

export class GoogleCalendarService {
  private calendar: any;
  private calendarId: string;
  private timezone: string;

  constructor(config: CalendarConfig) {
    // Robust private key handling - supports all formats
    let privateKey = config.privateKey;

    // Remove surrounding quotes if present
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }

    // Replace escaped newlines with actual newlines
    // Handle both \\n (double escaped) and \n (single escaped)
    privateKey = privateKey.replace(/\\\\n/g, '\n').replace(/\\n/g, '\n');

    // Ensure it starts and ends correctly
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format: missing BEGIN marker');
    }

    const auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
    this.calendarId = config.calendarId;
    this.timezone = config.timezone || 'America/Los_Angeles';
  }

  // Create calendar event
  async createEvent(event: CalendarEvent): Promise<string> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: {
          summary: event.summary,
          description: event.description || '',
          location: event.location || '',
          start: event.start,
          end: event.end,
          attendees: event.attendees || [],
          reminders: event.reminders || {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 60 }, // 1 hour before
            ],
          },
          sendUpdates: 'all', // Send email invites to attendees
        },
      });

      return response.data.id || '';
    } catch (error) {
      console.error('Calendar event creation error:', error);
      throw new Error(`Failed to create calendar event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check availability for a time slot
  async checkAvailability(start: string, end: string): Promise<AvailabilityCheck> {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: start,
          timeMax: end,
          timeZone: this.timezone,
          items: [{ id: this.calendarId }],
        },
      });

      const busy = response.data.calendars?.[this.calendarId]?.busy || [];
      const isAvailable = busy.length === 0;

      return {
        start,
        end,
        isAvailable,
        conflictingEvents: isAvailable ? undefined : busy.map((b: any) => `${b.start} - ${b.end}`),
      };
    } catch (error) {
      console.error('Availability check error:', error);
      throw new Error(`Failed to check availability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update existing event
  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    try {
      await this.calendar.events.patch({
        calendarId: this.calendarId,
        eventId,
        requestBody: updates,
        sendUpdates: 'all',
      });
    } catch (error) {
      console.error('Calendar event update error:', error);
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
        sendUpdates: 'all',
      });
    } catch (error) {
      console.error('Calendar event deletion error:', error);
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get events in date range
  async getEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (response.data.items || []).map((item: any) => ({
        id: item.id,
        summary: item.summary,
        description: item.description,
        location: item.location,
        start: item.start,
        end: item.end,
        attendees: item.attendees,
      }));
    } catch (error) {
      console.error('Calendar events fetch error:', error);
      throw new Error(`Failed to fetch events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Convert Job to Calendar Event
  jobToCalendarEvent(
    job: Job,
    scheduledDate: Date,
    durationHours: number = 4
  ): CalendarEvent {
    const startDateTime = scheduledDate.toISOString();
    const endDateTime = new Date(scheduledDate.getTime() + durationHours * 60 * 60 * 1000).toISOString();

    return {
      summary: job.title,
      description: `Customer: ${job.customerName}\nEmail: ${job.customerEmail}\nPhone: ${job.customerPhone || 'N/A'}\n\nNotes: ${job.notes || 'No additional notes'}`,
      location: job.siteAddress || '',
      start: {
        dateTime: startDateTime,
        timeZone: this.timezone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: this.timezone,
      },
      // Removed attendees - service account cannot send invites without Domain-Wide Delegation
      // Customer info included in description instead
    };
  }

  // Find next available slot (simple algorithm)
  async findNextAvailableSlot(
    preferredDate: Date,
    durationHours: number = 4,
    businessHoursStart: number = 8, // 8 AM
    businessHoursEnd: number = 17 // 5 PM
  ): Promise<Date | null> {
    const maxDaysToCheck = 14;

    for (let dayOffset = 0; dayOffset < maxDaysToCheck; dayOffset++) {
      const checkDate = new Date(preferredDate);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      // Skip weekends
      if (checkDate.getDay() === 0 || checkDate.getDay() === 6) continue;

      // Check each hour slot during business hours
      for (let hour = businessHoursStart; hour <= businessHoursEnd - durationHours; hour++) {
        const slotStart = new Date(checkDate);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setHours(slotStart.getHours() + durationHours);

        const availability = await this.checkAvailability(
          slotStart.toISOString(),
          slotEnd.toISOString()
        );

        if (availability.isAvailable) {
          return slotStart;
        }
      }
    }

    return null; // No available slots found
  }

  // Batch create events (with rate limiting)
  async batchCreateEvents(events: CalendarEvent[]): Promise<string[]> {
    const eventIds: string[] = [];
    const delay = 200; // 200ms between requests to respect rate limits

    for (const event of events) {
      try {
        const id = await this.createEvent(event);
        eventIds.push(id);
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        console.error('Batch event creation error:', error);
        eventIds.push(''); // Push empty string for failed creation
      }
    }

    return eventIds;
  }
}

// Singleton instance creator
export function createGoogleCalendarService(
  serviceAccountEmail?: string,
  privateKey?: string,
  calendarId?: string,
  timezone?: string
): GoogleCalendarService | null {
  const email = serviceAccountEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = privateKey || process.env.GOOGLE_PRIVATE_KEY;
  const calendar = calendarId || process.env.GOOGLE_CALENDAR_ID;

  if (!email || !key || !calendar) {
    console.warn('Google Calendar not configured. Missing service account, private key, or calendar ID.');
    return null;
  }

  return new GoogleCalendarService({
    serviceAccountEmail: email,
    privateKey: key,
    calendarId: calendar,
    timezone: timezone || process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Los_Angeles',
  });
}
