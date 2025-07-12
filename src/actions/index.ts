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
	},
	forms: {
		wdc: defineAction({
			accept: 'form',
			handler: async (formData) => {
				const linkLabels = formData.getAll('link_label[]');
				const linkUrls = formData.getAll('link_url[]');
				const links = linkUrls
					.map((url, i) => {
						if (!url) {
							return false;
						}

						return {
							label: linkLabels.at(i) ?? '',
							url,
						};
					})
					.filter((val) => val !== false);

				const rawInput = {
					signature: formData.get('signature'),
					role: formData.get('role'),
					reimbursement: formData.get('reimbursement'),
					email: formData.get('email'),
					phone: formData.get('phone'),
					groupchat: formData.get('groupchat'),
					bio: formData.get('bio') ?? '',
					links,
					dietaryRequirements: formData.get('dietaryRequirements') ?? '',
					foodAdventurousness: formData.get('foodAdventurousness'),
					coffee: formData.get('coffee') ?? '',
					id: formData.get('id'),
					username: formData.get('username'),
				};

				const InputSchema = z.object({
					signature: z.string(),
					role: z.union([z.literal('developer'), z.literal('advisor')]),
					reimbursement: z.coerce.boolean(),
					email: z.string(),
					phone: z.string(),
					groupchat: z.coerce.boolean(),
					bio: z.string().optional(),
					links: z.array(
						z.object({
							label: z.string(),
							url: z.string(),
						}),
					),
					dietaryRequirements: z.string().optional(),
					foodAdventurousness: z.coerce.number(),
					coffee: z.string().optional(),
					id: z.string(),
					username: z.string(),
				});

				const data = InputSchema.parse(rawInput);

				try {
					const result = await inngest.send({
						name: 'codetv/forms.wdc.submit',
						data,
					});

					return result;
				} catch (err) {
					console.log({ err });
					return {
						error: err,
					};
				}
			},
		}),
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
