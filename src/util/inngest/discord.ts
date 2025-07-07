import { inngest } from './client';
import { clerk } from '../clerk';
import {
	botRequestHeaders,
	DISCORD_CHANNEL_ID,
	DISCORD_SERVER_ID,
	getRoleId,
	removeRole,
	roles,
	updateRole,
	type SubscriptionLevel,
} from '../discord';
import { NonRetriableError } from 'inngest';

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

		// update the user's role on Discord
		const addRole = updateRole({ memberId, roleId });

		await step.run('discord/roles.debug', async () => {
			return {
				roleId,
				silver: roles.SILVER_TIER_ROLE_ID,
				gold: roles.GOLD_TIER_ROLE_ID,
				platinum: roles.PLATINUM_TIER_ROLE_ID,
			};
		});

		// remove other roles on Discord
		let removeSilverRole = Promise.resolve(new Response('no action'));
		let removeGoldRole = Promise.resolve(new Response('no action'));
		let removePlatinumRole = Promise.resolve(new Response('no action'));

		if (roleId !== roles.SILVER_TIER_ROLE_ID) {
			removeSilverRole = removeRole({ memberId, roleId: roles.SILVER_TIER_ROLE_ID});
		}

		if (roleId !== roles.GOLD_TIER_ROLE_ID) {
			removeGoldRole = removeRole({ memberId, roleId: roles.GOLD_TIER_ROLE_ID});
		}

		if (roleId !== roles.PLATINUM_TIER_ROLE_ID) {
			removePlatinumRole = removeRole({ memberId, roleId: roles.PLATINUM_TIER_ROLE_ID});
		}

		await Promise.all([
			addRole,
			removeSilverRole,
			removeGoldRole,
			removePlatinumRole,
		]);

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
