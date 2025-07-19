import { getGoogleAccessToken } from '../google/auth';

const SHEET_ID = '1ihOfKXacyKDmarkq1yrwSpodRvfncS-xpXSVJP5Zrnw';
const SHEET_RANGE = 'Sheet1!A2';

export async function appendValue({
	signature,
	role,
	reimbursement,
	email,
	phone,
	groupchat,
	dietaryRequirements,
	foodAdventurousness,
	coffee,
}: {
	signature: string;
	role: string;
	reimbursement: boolean;
	email: string;
	phone: string;
	groupchat: boolean;
	dietaryRequirements?: string;
	foodAdventurousness: number;
	coffee?: string;
}) {
	const accessToken = await getGoogleAccessToken();

	// const fieldOrder = [
	//  'Date Submitted',
	// 	'Video Release Signature',
	//   'Role',
	// 	'Booking Reimbursement Confirmed',
	// 	'Email',
	// 	'Phone',
	//   'Groupchat Approval',
	// 	'Dietary requirements',
	// 	'Food Adventurousness',
	// 	'Coffee Order',
	// ];

	const entry = [
		new Date().toLocaleString(),
		signature,
		role,
		reimbursement,
		email,
		phone,
		groupchat,
		dietaryRequirements,
		foodAdventurousness,
		coffee,
	];

	const res = await fetch(
		`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({
				values: [entry],
			}),
		},
	);

	if (!res.ok) {
		return {
			error: {
				status: res.status,
				statusText: res.statusText,
			},
		};
	}

	return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
}
