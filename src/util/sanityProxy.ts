import { SANITY_SECRET_TOKEN } from "astro:env/server";
import { createClient } from "@sanity/client";

type OriginalSanityClient = ReturnType<typeof createClient>;
type ProxiedSanityClient = typeof Proxy<OriginalSanityClient>;

const client = createClient({
	projectId: "vnkupgyb",
	dataset: "develop",
	apiVersion: "2024-08-10",
	token: SANITY_SECRET_TOKEN,
	perspective: "published",
	useCdn: true,
});

export const sanityClient = new Proxy(client, {
	get(target, propName, receiver) {
		console.debug(
			`Sanity Proxy: Attempting to use property: ${String(propName)}`,
		);

		const value: any = target[propName as keyof typeof target];

		if (value instanceof Function) {
			return function (this: ProxiedSanityClient, ...args: any) {
				return value.apply(this === receiver ? target : this, args);
			};
		}

		return value;
	},
});
