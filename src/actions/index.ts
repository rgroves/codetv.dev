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
		wdcIntake: defineAction({
			accept: 'form',
			input: z.object({
				id: z.string(),
				username: z.string(),
				bio: z.string(),
				email: z.string().email(),
				phone: z.string(),
				groupchat: z.coerce.boolean(),
				'dietary-requirements': z.string().optional(),
				'food-adventurousness': z.coerce.number().int().min(1).max(5),
				coffee: z.string().optional(),
				'terms-accept': z.string(),
				role: z.enum(['developer', 'advisor']),
				reimbursement: z.coerce.boolean(),
				'link_label[]': z.array(z.string()),
				'link_url[]': z.array(z.string()),
			}),
			handler: async (input) => {
				console.log('actions.user.wdcIntake');
				console.log(input);

				/**
					[
						{ name: 'id', value: '1c607bb5-519b-49b6-9da9-5ddc424aa44c' },
						{ name: 'username', value: 'jlengstorf' }
						{
							name: 'bio',
							value: "Jason makes tv for developers at CodeTV. He believes that a career in tech is more successful, rewarding, and sustainable when it's built on fun, curiosity, and community."
						},
						{ name: 'email', value: 'jason@codetv.dev' },
						{ name: 'phone', value: '971-280-4906' },
						{ name: 'groupchat', value: 'on' },
						{ name: 'dietary-requirements', value: '' },
						{ name: 'food-adventurousness', value: '5' },
						{ name: 'coffee', value: '' },
						{ name: 'terms-accept', value: 'test' },
						{ name: 'role', value: 'developer' },
						{ name: 'reimbursement', value: 'on' },
						{ name: 'link_label[]', value: 'Links' },
						{ name: 'link_url[]', value: 'https://jason.energy/links' },
						{ name: 'link_label[]', value: 'Bluesky' },
						{
							name: 'link_url[]',
							value: 'https://bsky.app/profile/jason.energy'
						},
						{ name: 'link_label[]', value: 'CodeTV' },
						{ name: 'link_url[]', value: 'https://codetv.dev' },
					]
				*/

				try {
					const {
						id,
						username,
						bio,
						email,
						phone,
						groupchat,
						coffee,
						role,
						reimbursement,
					} = input;

					const dietaryRequirements = input['dietary-requirements'];
					const foodAdventurousness = input['food-adventurousness'];
					const terms = input['terms-accept'];
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

					const result = await inngest.send({
						name: 'codetv/forms.wdc.submit',
						data: {
							id: id.toString(),
							username,
							email,
							bio,
							phone,
							groupchat,
							coffee,
							role,
							reimbursement,
							dietaryRequirements,
							foodAdventurousness,
							terms,
							links,
						},
					});

					return result;
				} catch (err) {
					console.log({ err });
					return {
						error: err
					}
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
