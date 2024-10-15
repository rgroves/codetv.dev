import { Inngest, EventSchemas, NonRetriableError } from 'inngest';
import {
	createPerson,
	getPersonByClerkId,
	updatePersonFromClerk,
	updatePersonSubscription,
} from './sanity';
import { cloudinary } from './cloudinary';
import { stripe } from './stripe';
import { clerk } from './clerk';
import type Stripe from 'stripe';
import type { InvocationResult } from 'inngest/types';
import { sendDiscordMessage } from './discord';

type ClerkWebhookUser = {
	data: {
		id: string;
		username: string;
		first_name: string;
		last_name: string;
		profile_image_url: string;
	};
};

type Events = {
	'clerk/user.updated': ClerkWebhookUser;
	'clerk/user.created': ClerkWebhookUser;
	'internal/stripe.subscription.retrieve': {
		data: {
			subscriptionId: string;
		};
	};
	'internal/stripe.product.retrieve': {
		data: {
			productId: string;
		};
	};
	'internal/clerk.user.update-subscription': {
		data: {
			clerkUserId: string;
			stripeCustomerId: string;
			subscriptionStatus: string;
			productName: string;
		};
	};
	'internal/sanity.person.update-subscription': {
		data: {
			sanityUserId: string;
			stripeCustomerId: string;
			subscriptionStatus: string;
			productName: string;
		};
	};
	'stripe/checkout.session.completed': {
		data: {
			object: {
				customer: string;
				metadata: {
					userId: string;
				};
				subscription: string;
			};
		};
	};
	'stripe/customer.subscription.updated': {
		data: {
			object: {
				id: string;
			};
		};
	};
	'stripe/customer.subscription.deleted': {
		data: {
			object: {
				id: string;
			};
		};
	};
};

export const schemas = new EventSchemas().fromRecord<Events>();

export const inngest = new Inngest({ id: 'learnwithjason', schemas });

export const handleClerkUserCreatedOrUpdatedWebhook = inngest.createFunction(
	{ id: 'clerk/user-created-or-updated' },
	[{ event: 'clerk/user.created' }, { event: 'clerk/user.updated' }],
	async ({ event, step }) => {
		const user_id = event.data.id;
		const username = event.data.username;
		const firstName = event.data.first_name;
		const lastName = event.data.last_name;
		const name = firstName + ' ' + lastName;

		const checkUser = step.run('check-for-existing-user', async () => {
			// use Clerk ID to look for an existing user in Sanity
			return getPersonByClerkId({ user_id });
		});

		const uploadPhoto = step.run(
			'cloudinary/update-user-profile-photo',
			async () => {
				return cloudinary.uploader.upload(event.data.profile_image_url, {
					public_id: username + '-' + event.ts,
					folder: 'lwj/people',
					overwrite: false,
				});
			},
		);

		const [user, photo] = await Promise.all([checkUser, uploadPhoto]);

		if (!user) {
			await step.run('sanity/create-new-user', async () => {
				return createPerson(name, user_id, username, photo);
			});
		} else {
			await step.run('sanity/update-existing-user', async () => {
				return updatePersonFromClerk(user._id, {
					name,
					username,
					photo,
				});
			});
		}

		// TODO update Clerk user with Sanity external ID
	},
);

// TODO handle Stripe webhook
// export const handleStripeSubscriptionChangeWebhook = inngest.createFunction(
// 	{ id: 'stripe/subscription-changed' },
// 	[{ event: 'stripe/checkout.session.completed'},{ event: 'stripe/customer.subscription.updated'},{ event: 'stripe/customer.subscription.deleted'}],
// 	async ({ event, step }) => {
// 		/**
// 		 * TODO Inngest doesn't support webhook signature validation yet
// 		 * @see https://www.inngest.com/docs/platform/webhooks#advanced-configuration
// 		 */
// 		// const { type, data } = await step.run('validate-stripe-webhook-signature', async () => {
// 		// 	return validateWebhookSignature(event)
// 		// });
// 	},
// )

const retrieveStripeSubscription = inngest.createFunction(
	{ id: 'stripe/subscription.retrieve' },
	{ event: 'internal/stripe.subscription.retrieve' },
	async function ({ event, step }): Promise<Stripe.Subscription> {
		return step.run('stripe/retrieve-subscription', async () => {
			return stripe.subscriptions.retrieve(event.data.subscriptionId);
		});
	},
);

const retrieveStripeProduct = inngest.createFunction(
	{ id: 'stripe/product.retrieve' },
	{ event: 'internal/stripe.product.retrieve' },
	async function ({ event, step }): Promise<Stripe.Product> {
		return step.run('stripe/retrieve-product', async () => {
			if (!event.data.productId) {
				throw new NonRetriableError('No product ID found');
			}

			return stripe.products.retrieve(event.data.productId);
		});
	},
);

const updateClerkUserSubscription = inngest.createFunction(
	{ id: 'clerk/user.subscription.update' },
	{ event: 'internal/clerk.user.update-subscription' },
	async ({ event, step }) => {
		return step.run('clerk/update-subscription-details', async () => {
			return clerk.users.updateUserMetadata(event.data.clerkUserId, {
				publicMetadata: {
					stripe: {
						customer: event.data.stripeCustomerId,
						status: event.data.subscriptionStatus,
						level: event.data.productName,
					},
				},
			});
		});
	},
);

const updateSanityPersonSubscription = inngest.createFunction(
	{ id: 'sanity/person.subscription.update' },
	{ event: 'internal/sanity.person.update-subscription' },
	async ({ event, step }) => {
		return step.run('sanity/update-subscription-details', async () => {
			console.log(event.data);
			return updatePersonSubscription(event.data.sanityUserId, {
				customer: event.data.stripeCustomerId,
				status: event.data.subscriptionStatus,
				level: event.data.productName,
				date: new Date(),
			});
		});
	},
);

export const handleStripeSubscriptionCompletedWebhook = inngest.createFunction(
	{ id: 'stripe/subscription-changed' },
	{ event: 'stripe/checkout.session.completed' },
	async ({ event, step }) => {
		const data = event.data;
		const userId = data.object.metadata?.userId as string;

		const subscription = await step.invoke('stripe/retrieve-subscription', {
			function: retrieveStripeSubscription,
			data: {
				subscriptionId: data.object.subscription,
			},
		});

		const getStripeProduct = step.invoke('stripe/retrieve-product', {
			function: retrieveStripeProduct,
			data: {
				productId: subscription.items.data.at(0)?.plan?.product as string,
			},
		});

		const getSanityUser = step.run(
			'sanity/check-for-existing-user',
			async () => {
				return getPersonByClerkId({ user_id: userId });
			},
		);

		const updateStripeMetadata = step.run(
			'stripe/update-metadata',
			async () => {
				return stripe.customers.update(subscription.customer as string, {
					metadata: {
						userId: userId,
					},
				});
			},
		);

		const [product, user] = await Promise.all([
			getStripeProduct,
			getSanityUser,
			updateStripeMetadata,
		]);

		if (!user) {
			throw new NonRetriableError('no user found');
		}

		const updateClerkUser = step.invoke('clerk-update-user-subscription', {
			function: updateClerkUserSubscription,
			data: {
				clerkUserId: userId,
				stripeCustomerId: subscription.customer as string,
				subscriptionStatus: subscription.status,
				productName: product.name,
			},
		});

		const updateSanityUser = step.invoke('sanity-update-person-subscription', {
			function: updateSanityPersonSubscription,
			data: {
				sanityUserId: user._id,
				stripeCustomerId: subscription.customer as string,
				subscriptionStatus: subscription.status,
				productName: product.name,
			},
		});

		const sendMessage = step.run('discord-send-message', async () => {
			const n = user.name;
			const p = product.name;
			const s = subscription.status;
			const msg = `New supporter! ${n} joined as a ${p} (${s})`;

			return sendDiscordMessage({
				content: msg,
			});
		});

		await Promise.all([updateClerkUser, updateSanityUser, sendMessage]);
	},
);

export const handleStripeSubscriptionUpdatedWebhook = inngest.createFunction(
	{ id: 'stripe/subscription-updated' },
	[
		{ event: 'stripe/customer.subscription.updated' },
		{ event: 'stripe/customer.subscription.deleted' },
	],
	async ({ event, step }) => {
		const data = event.data;

		const subscription = await step.invoke('stripe/retrieve-subscription', {
			function: retrieveStripeSubscription,
			data: {
				subscriptionId: data.object.id,
			},
		});

		const retrieveCustomer = step.run('stripe/retrieve-customer', async () => {
			return stripe.customers.retrieve(subscription.customer as string);
		}) as InvocationResult<Stripe.Customer>;

		const retrieveProduct = step.invoke('stripe/retrieve-product', {
			function: retrieveStripeProduct,
			data: {
				productId: subscription.items.data.at(0)?.plan?.product as string,
			},
		});

		const [customer, product] = await Promise.all([
			retrieveCustomer,
			retrieveProduct,
		]);

		if (!customer) {
			throw new NonRetriableError('No customer found');
		}

		const getSanityUser = step.run(
			'sanity/check-for-existing-user',
			async () => {
				return getPersonByClerkId({ user_id: customer.metadata.userId });
			},
		);

		const updateClerkUser = step.invoke('clerk-update-user-subscription', {
			function: updateClerkUserSubscription,
			data: {
				clerkUserId: customer.metadata.userId,
				stripeCustomerId: subscription.customer as string,
				subscriptionStatus: subscription.status,
				productName: product.name,
			},
		});

		const [user] = await Promise.all([getSanityUser, updateClerkUser]);

		if (!user) {
			throw new NonRetriableError('unable to find user');
		}

		const updateSanityPerson = step.invoke(
			'sanity-update-person-subscription',
			{
				function: updateSanityPersonSubscription,
				data: {
					sanityUserId: user._id,
					stripeCustomerId: subscription.customer as string,
					subscriptionStatus: subscription.status,
					productName: product.name,
				},
			},
		);

		const sendMessage = step.run('discord-send-message', async () => {
			const n = user.name;
			const p = product.name;
			const s = subscription.status;
			const msg = `${n} updated their subscription to ${p} (${s})`;

			return sendDiscordMessage({
				content: msg,
			});
		});

		await Promise.all([updateSanityPerson, sendMessage]);
	},
);

export const functions = [
	handleClerkUserCreatedOrUpdatedWebhook,
	handleStripeSubscriptionCompletedWebhook,
	handleStripeSubscriptionUpdatedWebhook,
	retrieveStripeSubscription,
	retrieveStripeProduct,
	updateClerkUserSubscription,
	updateSanityPersonSubscription,
];
