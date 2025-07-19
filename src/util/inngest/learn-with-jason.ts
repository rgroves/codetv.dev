import { inngest } from './client';
import {
  CalendarEvent,
	FreeBusy,
	getCalendarEvents,
	getHostFreeBusy,
} from '../google/calendar';
import { getGoogleAccessToken } from '../google/auth';
import {
	add,
	eachDayOfInterval,
	isSameDay,
	isThursday,
	nextThursday,
} from 'date-fns';
import { z } from 'astro/zod';

export const handleLWJIntake = inngest.createFunction(
	{ id: 'test/google.calendar.list' },
	{ event: 'test/google.calendar.list' },
	async function ({ step }) {
		const token = await step.run('google/auth.token.get', async () => {
			return await getGoogleAccessToken();
		});

		const events = await step.run('google/calendar.events.list', async () => {
			return await getCalendarEvents({ token });
		});

		// LWJ is always on Thursdays, so we can ignore events not on Thursdays.
		// TODO
		const datesWithoutShows = await step.run(
			'google/events.filter',
			async () => {
				const today = new Date();
        const parsedEvents = z.array(CalendarEvent).parse(events);

				const bookedShows = parsedEvents.filter((event) => {
					return isThursday(event.start.dateTime);
				});

				// Get a list of every date that falls on a Thursday for the next 60 days.
				const possibleShowDates = eachDayOfInterval(
					{
						start: nextThursday(today),
						end: add(today, { days: 60 }),
					},
					{
						step: 7,
					},
				);

				// Figure out which dates don’t already have shows booked on them.
				return possibleShowDates.filter((showDate) => {
					return bookedShows.every((bookedShow) => {
						return !isSameDay(showDate, bookedShow.start.dateTime);
					});
				});
			},
		);

		const freeBusy = await step.run(
			'google/calendar.free-busy.get',
			async () => {
        const dates = z.array(z.coerce.date()).parse(datesWithoutShows);

				return getHostFreeBusy({ token, dates });
			},
		);

		// Filter using the free/busy data to get a list of actually bookable dates.
		const bookableShowDates = await step.run(
			'lwj/bookable-dates.get',
			async () => {
				return freeBusy
					.map((freeBusyRaw) => FreeBusy.parse(freeBusyRaw))
					.filter((fb) => {
						const calendars = Object.values(fb.calendars);
						return !calendars.some((cal) => cal.busy.length > 0);
					})
					.map((free) => free.timeMin);
			},
		);

		// TODO create a calendar event for the following people:
		// submitter (guest), Jason, captioner (WCC), operations (Aodhan)
    // https://developers.google.com/workspace/calendar/api/v3/reference/events/insert

		// TODO add Notion entry (⚠️ do we need this if we have the Sanity draft?)
		// TODO generate social images for the episode
		// TODO send notification to Discord
		// TODO wait for the title/description to be written
		// TODO create an event in the Discord after ^^ is complete
		// TODO create a draft event in Sanity (release?)
	},
);
