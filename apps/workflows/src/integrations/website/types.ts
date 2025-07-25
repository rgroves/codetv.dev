import z from 'zod';

export const WebDevChallengeFormSubmit = z.object({
	id: z.string(),
	username: z.string(),
	bio: z.string().optional(),
	email: z.string(),
	phone: z.string(),
	groupchat: z.boolean(),
	dietaryRequirements: z.string().optional(),
	foodAdventurousness: z.number(),
	coffee: z.string().optional(),
	signature: z.string(),
	role: z.union([z.literal('developer'), z.literal('advisor')]),
	reimbursement: z.boolean(),
	links: z.array(z.object({ label: z.string(), url: z.string() })),
});

export const schema = {
	'codetv/user.profile.update': {
		data: z.object({
			id: z.string(),
			username: z.string(),
			bio: z.string(),
			links: z.array(z.object({ label: z.string(), url: z.string() })),
		}),
	},
	'codetv/forms.wdc.submit': {
		data: WebDevChallengeFormSubmit,
	},
	'codetv/forms.lwj.book': {},
};
