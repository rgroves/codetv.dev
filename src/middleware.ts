import { defineMiddleware } from "astro:middleware";
import {
  clerkMiddleware,
  createRouteMatcher,
  type User,
} from "@clerk/astro/server";

const isProtectedPage = createRouteMatcher([
  /^(?!.*\/(?:sign-up|sign-in)\/?$)\/dashboard.*$/,
]);

// export const onRequest = clerkMiddleware((auth, context, next) => {
// 	if (isProtectedPage(context.request) && !auth().userId) {
// 		return auth().redirectToSignIn();
// 	}

// 	return next();
// });

// 👇 this was a rabbit hole that I fell down, need to figure out a good way to auto-gen mock data
class TestUser {
  private _raw: User["_raw"];
  raw: User["raw"];
  fullName: User["fullName"];
  firstName: User["firstName"];
  imageUrl: User["imageUrl"];
  lastName: User["lastName"];
  id: User["id"];
  emailAddresses: User["emailAddresses"];
  phoneNumbers: User["phoneNumbers"];
  createdAt: User["createdAt"];
  updatedAt: User["updatedAt"];
  primaryEmailAddressId: User["primaryEmailAddressId"];
  primaryPhoneNumberId: User["primaryPhoneNumberId"];
  unsafeMetadata: User["unsafeMetadata"];
  passwordEnabled: User["passwordEnabled"];
  totpEnabled: User["totpEnabled"];
  backupCodeEnabled: User["backupCodeEnabled"];
  primaryWeb3WalletId: User["primaryWeb3WalletId"];
  twoFactorEnabled: User["twoFactorEnabled"];
  banned: User["banned"];
  locked: User["locked"];
  hasImage: User["hasImage"];
  lastSignInAt: User["lastSignInAt"];
  externalId: User["externalId"];
  username: User["username"];
  publicMetadata: User["publicMetadata"];
  privateMetadata: User["privateMetadata"];
  web3Wallets: User["web3Wallets"];
  externalAccounts: User["externalAccounts"];
  samlAccounts: User["samlAccounts"];
  lastActiveAt: User["lastActiveAt"];
  createOrganizationEnabled: User["createOrganizationEnabled"];
  createOrganizationsLimit: User["createOrganizationsLimit"];
  deleteSelfEnabled: User["deleteSelfEnabled"];
  legalAcceptedAt: User["legalAcceptedAt"];
  primaryEmailAddress: User["primaryEmailAddress"];
  primaryPhoneNumber: User["primaryPhoneNumber"];
  primaryWeb3Wallet: User["primaryWeb3Wallet"];

  constructor(raw: User["raw"], data?: any) {
    this._raw = raw;
    this.raw = raw;
    this.fullName = data?.fullName;
    this.firstName = data?.firstName;
    this.imageUrl = data?.imageUrl;
    this.lastName = data?.lastName;
    this.id = data?.id;
    this.emailAddresses = data?.emailAddresses || [];
    this.phoneNumbers = data?.phoneNumbers || [];
    this.createdAt = data?.createdAt || new Date().getTime();
    this.updatedAt = data?.updatedAt || new Date().getTime();
    this.primaryEmailAddressId = data?.primaryEmailAddressId || null;
    this.primaryPhoneNumberId = data?.primaryPhoneNumberId || null;
    this.unsafeMetadata = data?.unsafeMetadata || {};
    this.passwordEnabled = data?.passwordEnabled || false;
    this.totpEnabled = data?.totpEnabled || false;
    this.backupCodeEnabled = data?.backupCodeEnabled || false;
    this.primaryWeb3WalletId = data?.primaryWeb3WalletId || null;
    this.twoFactorEnabled = data?.twoFactorEnabled || false;
    this.banned = data?.banned || false;
    this.locked = data?.locked || false;
    this.hasImage = data?.hasImage || false;
    this.lastSignInAt = data?.lastSignInAt || new Date().getTime();
    this.externalId = data?.externalId || null;
    this.username = data?.username || null;
    this.publicMetadata = data?.publicMetadata || {};
    this.privateMetadata = data?.privateMetadata || {};
    this.web3Wallets = data?.web3Wallets || [];
    this.externalAccounts = data?.externalAccounts || [];
    this.samlAccounts = data?.samlAccounts || [];
    this.lastActiveAt = data?.lastActiveAt || new Date().getTime();
    this.createOrganizationEnabled = data?.createOrganizationEnabled || false;
    this.createOrganizationsLimit = data?.createOrganizationsLimit || 0;
    this.deleteSelfEnabled = data?.deleteSelfEnabled || false;
    this.legalAcceptedAt = data?.legalAcceptedAt || new Date().getTime();
    this.primaryEmailAddress = data?.primaryEmailAddress;
    this.primaryPhoneNumber = data?.primaryPhoneNumber;
    this.primaryWeb3Wallet = data?.primaryWeb3Wallet || null;
  }
}

export const onRequest = defineMiddleware((context, next) => {
  context.locals.currentUser = async () => {
    const testData = {
      fullName: "Robert Groves",
      firstName: "Robert",
      imageUrl:
        "//img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJzZEt6Q01PU2dzMDlhQnFUVGpvcUJKelM5ViJ9",
      lastName: "Groves",
      id: "user_12345",
      emailAddresses: [],
      phoneNumbers: [],
      createdAt: new Date("2023-01-01T00:00:00Z").getTime(),
      updatedAt: new Date("2023-01-01T00:00:00Z").getTime(),
      primaryEmailAddressId: "email_12345",
      primaryPhoneNumberId: "phone_12345",
      unsafeMetadata: {},
      passwordEnabled: true,
      totpEnabled: false,
      backupCodeEnabled: false,
      primaryWeb3WalletId: null,
      twoFactorEnabled: false,
      banned: false,
      locked: false,
      hasImage: true,
      lastSignInAt: new Date("2023-01-01T00:00:00Z").getTime(),
      externalId: null,
      username: "robertgroves",
      publicMetadata: {},
      privateMetadata: {},
      web3Wallets: [],
      externalAccounts: [],
      samlAccounts: [],
      lastActiveAt: new Date("2023-01-01T00:00:00Z").getTime(),
      createOrganizationEnabled: false,
      createOrganizationsLimit: 0,
      deleteSelfEnabled: false,
      legalAcceptedAt: new Date("2023-01-01T00:00:00Z").getTime(),
      primaryEmailAddress: {
        id: "email_12345",
        emailAddress: "test@example.com",
        verification: null,
        linkedTo: [],
      },
      primaryPhoneNumber: {
        id: "phone_12345",
        phoneNumber: "+1234567890",
        verification: null,
        linkedTo: [],
        reservedForSecondFactor: false,
        defaultSecondFactor: false,
      },
      primaryWeb3Wallet: null,
      raw: null,
    };
    const testUser = new TestUser(
      JSON.parse(JSON.stringify(testData)),
      testData
    );
    const user = testUser as unknown as User;

    return Promise.resolve(user);
  };

  return next();
});
