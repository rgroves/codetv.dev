import { liteClient } from 'algoliasearch/lite';
import {
	PUBLIC_ALGOLIA_APP_ID,
	PUBLIC_ALGOLIA_API_KEY,
} from 'astro:env/client';

export const searchClient = liteClient(
	PUBLIC_ALGOLIA_APP_ID,
	PUBLIC_ALGOLIA_API_KEY,
);
