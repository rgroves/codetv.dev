import { inngest } from './client';
import { clerk } from '../clerk';
import {
	botRequestHeaders,
	DISCORD_CHANNEL_ID,
	getRoleId,
	removeRole,
	roles,
	updateRole,
	type SubscriptionLevel,
} from '../discord';
import { NonRetriableError } from 'inngest';
import { DISCORD_BOT_TOKEN } from 'astro:env/server';

export const discordUpdateUserRole = inngest.createFunction(
	{ id: 'discord/update-user-role' },
	[{ event: 'clerk/user.created' }, { event: 'clerk/user.updated' }],
	async function ({ event, step }) {
		const userId = event.data.id;

		const user = await step.run('clerk/user.get', async () => {
			return clerk.users.getUser(userId).catch((err) => {
				throw new NonRetriableError(err);
			});
		});

		const roleId = await step.run('discord/user.role.get-id', async () => {
			let level = (user.publicMetadata.stripe?.level ??
				'Free Tier Supporter') as SubscriptionLevel;

			return getRoleId(level);
		});

		const memberId = await step.run(
			'clerk/user.external-account.get-id',
			async () => {
				const discord = user.externalAccounts.find(
					(acct) => acct.provider === 'oauth_discord',
				);

				if (!discord) {
					throw new NonRetriableError('no Discord account', discord);
				}

				return discord.externalId;
			},
		);

		await step.run('discord/roles.debug', async () => {
			return {
        bt: DISCORD_BOT_TOKEN,
        memberId,
				roleId,
				silver: roles.SILVER_TIER_ROLE_ID,
				gold: roles.GOLD_TIER_ROLE_ID,
				platinum: roles.PLATINUM_TIER_ROLE_ID,
			};
		});

		// update the user's role on Discord
		const addRole = await step.run('discord/user.roles.add', async () => {
			return updateRole({ memberId, roleId });
		});

		// remove other roles on Discord
		const removeSilverRole = await step.run(
			'discord/user.roles.maybe-remove-silver',
			async () => {
				if (roleId !== roles.SILVER_TIER_ROLE_ID) {
					return removeRole({
						memberId,
						roleId: roles.SILVER_TIER_ROLE_ID,
					});
				}

				return Promise.resolve(new Response('no action'));
			},
		);

		const removeGoldRole = await step.run(
			'discord/user.roles.maybe-remove-gold',
			async () => {
				if (roleId !== roles.GOLD_TIER_ROLE_ID) {
					return removeRole({
						memberId,
						roleId: roles.GOLD_TIER_ROLE_ID,
					});
				}

				return Promise.resolve(new Response('no action'));
			},
		);

		const removePlatinumRole = await step.run(
			'discord/user.roles.maybe-remove-platinum',
			async () => {
				if (roleId !== roles.PLATINUM_TIER_ROLE_ID) {
					return removeRole({
						memberId,
						roleId: roles.PLATINUM_TIER_ROLE_ID,
					});
				}

				return Promise.resolve(new Response('no action'));
			},
		);

		// await Promise.all([
		// 	addRole,
		// 	removeSilverRole,
		// 	removeGoldRole,
		// 	removePlatinumRole,
		// ]);

		// send a message to the updates feed channel
		await step.fetch(
			`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`,
			{
				method: 'POST',
				headers: botRequestHeaders,
				body: JSON.stringify({
					content: `granted <@${memberId}> the <@&${roleId}> role`,
				}),
			},
		);
	},
);
