import { defineAction } from 'astro:actions';
import { z } from 'astro:content';
import { addSubscriber } from '../util/convertkit';
import { inngest } from '../util/inngest/client';

export const server = {
	user: {
		updateProfile: defineAction({
			accept: 'form',
			input: z.object({
				id: z.string(),
				username: z.string(),
				bio: z.string().optional(),
				'link_label[]': z.array(z.string()),
				'link_url[]': z.array(z.string()),
			}),
			handler: async (input) => {
				const { id, username, bio = '' } = input;
				const link_labels = input['link_label[]'];
				const link_urls = input['link_url[]'];
				const links = link_urls
					.map((url, i) => {
						if (!url) {
							return false;
						}

						return {
							label: link_labels.at(i) ?? '',
							url,
						};
					})
					.filter((val) => val !== false);

				try {
					const result = await inngest.send({
						name: 'codetv/user.profile.update',
						data: {
							id: id.toString(),
							username,
							bio,
							links,
						},
					});

					// TODO figure out how to actually wait for the result
					await new Promise((resolve) => setTimeout(() => resolve(true), 3000));

					return result;
				} catch (err) {
					console.log({ err });
				}
			},
		}),
		test: defineAction({
			accept: 'form',
			input: z.object({
				signature: z.string(),
				// role: z.any(),
				// reimbursement: z.any(),
				// email: z.any(),
				// phone: z.any(),
				// groupchat: z.any(),
				// bio: z.any(),
				// 'link_label[]': z.any(),
				// 'link_url[]': z.any(),
				// dietaryRequirements: z.any(),
				// foodAdventurousness: z.any(),
				// coffee: z.any(),
				// id: z.any(),
				// username: z.any(),
			}),
			handler: async (input) => {
				console.log('actions.user.test');
				console.log(input);

				return input;
			}
		}),
		// wdcIntake: defineAction({
		// 	accept: 'form',
		// 	input: z.object({
				// signature: z.string(),
				// role: z.string(),
				// reimbursement: z.coerce.boolean(),
				// email: z.string(),
				// phone: z.string(),
				// groupchat: z.coerce.boolean(),
				// bio: z.string().optional(),
				// 'link_label[]': z.array(z.string()),
				// 'link_url[]': z.array(z.string()),
				// dietaryRequirements: z.string().optional(),
				// foodAdventurousness: z.coerce.number(),
				// coffee: z.string().optional(),
				// id: z.string(),
				// username: z.string(),
		// 	}),
		// 	handler: async (input) => {
		// 		console.log('actions.user.wdcIntake');
		// 		console.log(input);

		// 		try {
		// 			const {
		// 				id,
		// 				// username,
		// 				bio = '',
		// 				// email,
		// 				// phone,
		// 				// groupchat,
		// 				// coffee,
		// 				// role,
		// 				// reimbursement,
		// 				// dietaryRequirements,
		// 				// foodAdventurousness,
		// 				// signature,
		// 			} = input;

		// 			const link_labels = input['link_label[]'];
		// 			const link_urls = input['link_url[]'];
		// 			const links = link_urls
		// 				.map((url, i) => {
		// 					if (!url) {
		// 						return false;
		// 					}

		// 					return {
		// 						label: link_labels.at(i) ?? '',
		// 						url,
		// 					};
		// 				})
		// 				.filter((val) => val !== false);

		// 			const result = await inngest.send({
		// 				name: 'codetv/forms.wdc.submit',
		// 				data: {
		// 					id: id.toString(),
		// 					// username,
		// 					// email,
		// 					bio,
		// 					// phone,
		// 					// groupchat,
		// 					// coffee,
		// 					// role,
		// 					// reimbursement,
		// 					// dietaryRequirements,
		// 					// foodAdventurousness,
		// 					// signature,
		// 					links,
		// 				},
		// 			});

		// 			return result;
		// 		} catch (err) {
		// 			console.log({ err });
		// 			return {
		// 				error: err,
		// 			};
		// 		}
		// 	},
		// }),
	},
	newsletter: {
		subscribe: defineAction({
			accept: 'form',
			input: z.object({
				firstName: z.string(),
				email: z.string().email(),
			}),
			handler: async (input) => {
				const subscriber = await addSubscriber(input.firstName, input.email);

				return subscriber;
			},
		}),
	},
};
