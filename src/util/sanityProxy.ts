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

const isContributorMode = client.config().token === "CONTRIBUTOR_DEV_STUB";
console.debug(`Sanity Proxy: isContributorMode: ${isContributorMode}`);

// Properties that can be accessed on the original client without restrictions.
const allowPassThrough: Set<string | symbol> = new Set(["config"]);

// Overrides for specific clientproperties or methods.
const overridesTable: Record<string | symbol, Function> = {
	fetch: async function (...args: any) {
		console.debug("Sanity Proxy: Fetch called");
		return [];
	},
};

const contributorModeOverrides = {
	get(
		target: OriginalSanityClient,
		propName: string | symbol,
		receiver: any
	) {
		console.debug(
			`Sanity Proxy: Attempting to use property: ${String(propName)}`,
		);

		const value: any = target[propName as keyof typeof target];

		if (propName in overridesTable) {
			if (value instanceof Function) {
				return function (...args: any) {
					return overridesTable[propName](args);
				};
			} else {
				return overridesTable[propName];
			}
		}

		if (allowPassThrough.has(propName)) {
			console.debug(
				`Sanity Proxy: Allowed property "${String(propName)}" to pass through to Sanity client.`,
			);

			if (value instanceof Function) {
				return function (this: ProxiedSanityClient, ...args: any) {
					return value.apply(this === receiver ? target : this, args);
				};
			} else {
				return value;
			}
		}

		console.debug(
			`Sanity Proxy has blocked access to property "${String(propName)}".`,
		);
		console.debug("Did you mean to provide an override?");
		throw new Error(
			"Access to this property is blocked in contributor mode.",
		);
	},
};

const overrides = isContributorMode ? contributorModeOverrides : {};

export const sanityClient = new Proxy<OriginalSanityClient>(client, overrides);
