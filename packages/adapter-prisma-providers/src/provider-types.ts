import {OAuthClientProviderType} from '@prisma/client';
import AzureAd from 'next-auth/providers/azure-ad';
import AzureAdB2c from 'next-auth/providers/azure-ad-b2c';
import Facebook from 'next-auth/providers/facebook';
import Google from 'next-auth/providers/google';
import type {OAuthConfig, OAuthUserConfig} from 'next-auth/providers/index';
import Instagram from 'next-auth/providers/instagram';
import Twitch from 'next-auth/providers/twitch';
import Twitter from 'next-auth/providers/twitter';

export const PROVIDER_CONFIG_BY_TYPE: Record<
    Exclude<OAuthClientProviderType, 'OIDC' | 'OAUTH'>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: OAuthUserConfig<any>) => OAuthConfig<unknown>
> = {
    [OAuthClientProviderType.AZURE_AD]: AzureAd,
    [OAuthClientProviderType.AZURE_AD_B2C]: AzureAdB2c,
    [OAuthClientProviderType.FACEBOOK]: Facebook,
    [OAuthClientProviderType.GOOGLE]: Google,
    [OAuthClientProviderType.INSTAGRAM]: Instagram,
    [OAuthClientProviderType.TWITCH]: Twitch,
    [OAuthClientProviderType.TWITTER]: Twitter
};
