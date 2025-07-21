import { serve } from 'inngest/astro';
import { inngest } from '../../inngest/client.ts';
import { functions } from '../../inngest/index.ts';

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions,
});
