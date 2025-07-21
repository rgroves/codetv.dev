import { INNGEST_EVENT_KEY } from 'astro:env/server';
import { EventSchemas, Inngest } from 'inngest';
import { schema as clerkSchema } from '../integrations/clerk/index.ts';
import { schema as cloudinarySchema } from '../integrations/cloudinary/index.ts';
import { schema as discordSchema } from '../integrations/discord/index.ts';
import { schema as googleSchema } from '../integrations/google/index.ts';
import { schema as sanitySchema } from '../integrations/sanity/index.ts';
import { schema as stripeSchema } from '../integrations/stripe/index.ts';
import { schema as websiteSchema } from '../integrations/website/index.ts';

// TODO pin Zod to 3 or figure out other workaround for
// https://github.com/inngest/inngest-js/issues/1014
export const schemas = new EventSchemas()
	.fromZod(clerkSchema)
	.fromZod(cloudinarySchema)
	.fromZod(discordSchema)
	.fromZod(googleSchema)
	.fromZod(sanitySchema)
	.fromZod(stripeSchema)
	.fromZod(websiteSchema);

// TODO figure out why the Inngest signing key isn't showing up here
export const inngest = new Inngest({
	id: 'codetv',
	schemas,
	eventKey: INNGEST_EVENT_KEY,
});
