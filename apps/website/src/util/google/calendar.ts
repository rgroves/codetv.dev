import { z } from 'astro:schema';
import { add, set } from 'date-fns';

const GOOGLE_CAL_ID =
	'lengstorf.com_9plj1m6u9vtddldoinl0hs2vgk@group.calendar.google.com';
const apiUrl = new URL(
	`https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CAL_ID}/events`,
);

export const CalendarEvent = z.object({
	kind: z.literal('calendar#event'),
	etag: z.string(),
	id: z.string(),
	status: z.string(),
	htmlLink: z.string(),
	created: z.coerce.date(),
	updated: z.coerce.date(),
	summary: z.string(),
	description: z.string(),
	location: z.string(),
	creator: z.object({
		email: z.string(),
		displayName: z.string().optional(),
	}),
	organizer: z.object({
		email: z.string(),
		displayName: z.string().optional(),
		self: z.boolean(),
	}),
	start: z.object({
		dateTime: z.coerce.date(),
		timeZone: z.string(),
	}),
	end: z.object({
		dateTime: z.coerce.date(),
		timeZone: z.string(),
	}),
	recurringEventId: z.string().optional(),
	originalStartTime: z
		.object({
			dateTime: z.coerce.date(),
			timeZone: z.string(),
		})
		.optional(),
	iCalUID: z.string(),
	sequence: z.number(),
	reminders: z.object({
		useDefault: z.boolean(),
	}),
	eventType: z.string(),
});

const EventList = z.object({
	kind: z.literal('calendar#events'),
	etag: z.string(),
	summary: z.string(),
	description: z.string(),
	updated: z.coerce.date(),
	timeZone: z.string(),
	accessRole: z.string(),
	defaultReminders: z.array(z.any()),
	nextPageToken: z.string().optional(),
	items: z.array(CalendarEvent),
});

export const FreeBusy = z.object({
	kind: z.literal('calendar#freeBusy'),
	timeMin: z.coerce.date(),
	timeMax: z.coerce.date(),
	calendars: z.record(
		z.string(),
		z.object({
			busy: z.array(
				z.object({
					start: z.coerce.date(),
					end: z.coerce.date(),
				}),
			),
		}),
	),
});

export async function getCalendarEvents({ token }: { token: string }) {
	const today = new Date();

	// https://developers.google.com/workspace/calendar/api/v3/reference/events/list
	const url = new URL(apiUrl);
	url.searchParams.set('orderBy', 'startTime');
	url.searchParams.set('singleEvents', 'true');
	url.searchParams.set('timeMin', today.toISOString());
	url.searchParams.set('timeMax', add(today, { days: 60 }).toISOString());

	const res = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		return [
			{
				error: {
					status: res.status,
					statusText: res.statusText,
				},
			},
		];
	}

	const data = await res.json();
	const parsed = EventList.parse(data);

	return parsed.items;
}

/**
 * Check Jason’s personal calendar for things like vacations, conflicts, etc.
 * One call per available show date; parallelize for performance.
 *
 * @see https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query
 */
export async function getHostFreeBusy({
	token,
	dates,
}: {
	token: string;
	dates: Date[];
}) {
	return await Promise.all(
		dates.map((date) => {
			return fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					timeMin: set(date, { hours: 9, minutes: 30 }),
					timeMax: set(date, { hours: 11, minutes: 0 }),
					timeZone: 'America/Los_Angeles',
					items: [
						{
							id: 'jason@codetv.dev',
						},
					],
				}),
			}).then((res) => res.json());
		}),
	);
}
