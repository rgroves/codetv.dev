import { join } from 'node:path';
import { GOOGLE_API_SERVICE_ACCOUNT } from 'astro:env/server';
import { decrypt } from '@tka85/dotenvenc';
import jwt from 'jsonwebtoken';

const env = await decrypt({
	passwd: process.env.DOTENVENC_PASS,
	encryptedFile: join(process.cwd(), '.env.enc'),
});

export async function getGoogleAccessToken() {
	const iat = Math.floor(Date.now() / 1000);
	const exp = iat + 3600;

	const jwtToken = jwt.sign(
		{
			iss: GOOGLE_API_SERVICE_ACCOUNT,
			scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar',
			aud: 'https://accounts.google.com/o/oauth2/token',
			exp,
			iat,
		},
		env.GOOGLE_API_PRIVATE_KEY,
		{ algorithm: 'RS256' },
	);

	const { access_token } = await fetch(
		'https://accounts.google.com/o/oauth2/token',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
				assertion: jwtToken,
			}),
		},
	).then((response) => response.json());

	return access_token;
}