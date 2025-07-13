import { inngest } from './client';
import { clerk } from '../clerk';
import {
	getMember,
	getRoleId,
	removeRole,
	roles,
	sendDiscordMessage,
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

		const discordMember = await step.run('discord/user.get', async () => {
			return getMember(memberId);
		});

		// update the user's role on Discord
		const addRole = step.run('discord/user.roles.add', async () => {
			if (discordMember.roles.includes(roleId)) {
				return {
					message: `${discordMember.user.username} already has role ${roleId}`,
				};
			}

			return updateRole({ memberId, roleId });
		});

		// remove other roles on Discord
		const removeSilverRole = step.run(
			'discord/user.roles.maybe-remove-silver',
			async () => {
				if (
					discordMember.roles.includes(roles.SILVER_TIER_ROLE_ID) &&
					roleId !== roles.SILVER_TIER_ROLE_ID
				) {
					return removeRole({
						memberId,
						roleId: roles.SILVER_TIER_ROLE_ID,
					});
				}

				return {
					message: 'silver role removal: no action',
				};
			},
		);

		const removeGoldRole = step.run(
			'discord/user.roles.maybe-remove-gold',
			async () => {
				if (
					discordMember.roles.includes(roles.GOLD_TIER_ROLE_ID) &&
					roleId !== roles.GOLD_TIER_ROLE_ID
				) {
					return removeRole({
						memberId,
						roleId: roles.GOLD_TIER_ROLE_ID,
					});
				}

				return {
					message: 'gold role removal: no action',
				};
			},
		);

		const removePlatinumRole = step.run(
			'discord/user.roles.maybe-remove-platinum',
			async () => {
				if (
					discordMember.roles.includes(roles.PLATINUM_TIER_ROLE_ID) &&
					roleId !== roles.PLATINUM_TIER_ROLE_ID
				) {
					return removeRole({
						memberId,
						roleId: roles.PLATINUM_TIER_ROLE_ID,
					});
				}

				return {
					message: 'platinum role removal: no action',
				};
			},
		);

		await Promise.all([
			addRole,
			removeSilverRole,
			removeGoldRole,
			removePlatinumRole,
		]);

		// send a message to the updates feed channel
		await step.run('discord/message.send', async () => {
			return sendDiscordMessage({
				content: `granted <@${memberId}> the <@&${roleId}> role`,
			});
		});
	},
);
