import {
	handleWebhookUserCreatedOrUpdated,
	userGetExternalAccountId,
	userSubscriptionUpdate,
} from '../integrations/clerk/steps.ts';
import { imageUpload } from '../integrations/cloudinary/steps.ts';
import {
	messageSend,
	discordUpdateUserRole,
} from '../integrations/discord/steps.ts';
import {
	bookableDatesGet,
	calendarEventList,
	eventsGetUnbookedDates,
	hostFreeBusy,
	sheetRowAppend,
	tokenGenerate,
} from '../integrations/google/steps.ts';
import {
	personGetByClerkId,
	personUpdateDetails,
	personUpdateSubscription,
	personUpsert,
} from '../integrations/sanity/steps.ts';
import {
	handleStripeSubscriptionUpdatedWebhook,
	handleWebhookStripeSubscriptionCompleted,
	retrieveStripeProduct,
	retrieveStripeSubscription,
} from '../integrations/stripe/steps.ts';
import {
	handleLWJIntake,
	handleUpdateUserProfile,
	handleWDCIntakeSubmit,
} from '../integrations/website/steps.ts';

export const functions = [
	handleWebhookUserCreatedOrUpdated,
	userGetExternalAccountId,
	userSubscriptionUpdate,
	imageUpload,
	messageSend,
	discordUpdateUserRole,
	bookableDatesGet,
	calendarEventList,
	eventsGetUnbookedDates,
	hostFreeBusy,
	sheetRowAppend,
	tokenGenerate,
	personGetByClerkId,
	personUpdateDetails,
	personUpdateSubscription,
	personUpsert,
	handleStripeSubscriptionUpdatedWebhook,
	handleWebhookStripeSubscriptionCompleted,
	retrieveStripeProduct,
	retrieveStripeSubscription,
	handleLWJIntake,
	handleUpdateUserProfile,
	handleWDCIntakeSubmit,
];
