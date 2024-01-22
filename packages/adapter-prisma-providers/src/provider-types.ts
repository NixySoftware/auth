import {OAuthClientProviderType} from '@prisma/client';
import School42 from 'next-auth/providers/42-school';
import Apple from 'next-auth/providers/apple';
import Atlassian from 'next-auth/providers/atlassian';
import Auth0 from 'next-auth/providers/auth0';
import Authentik from 'next-auth/providers/authentik';
import AzureAd from 'next-auth/providers/azure-ad';
import AzureAdB2c from 'next-auth/providers/azure-ad-b2c';
import Battlenet from 'next-auth/providers/battlenet';
import Box from 'next-auth/providers/box';
import BoxyhqSaml from 'next-auth/providers/boxyhq-saml';
import Bungie from 'next-auth/providers/bungie';
import Cognito from 'next-auth/providers/cognito';
import Coinbase from 'next-auth/providers/coinbase';
import Discord from 'next-auth/providers/discord';
import Dropbox from 'next-auth/providers/dropbox';
import DuendeIdentityServer6 from 'next-auth/providers/duende-identity-server6';
import Eveonline from 'next-auth/providers/eveonline';
import Facebook from 'next-auth/providers/facebook';
import Faceit from 'next-auth/providers/faceit';
import Foursquare from 'next-auth/providers/foursquare';
import Freshbooks from 'next-auth/providers/freshbooks';
import Fusionauth from 'next-auth/providers/fusionauth';
import Github from 'next-auth/providers/github';
import Gitlab from 'next-auth/providers/gitlab';
import Google from 'next-auth/providers/google';
import Hubspot from 'next-auth/providers/hubspot';
import IdentityServer4 from 'next-auth/providers/identity-server4';
import type {OAuthConfig, OAuthUserConfig} from 'next-auth/providers/index';
import Instagram from 'next-auth/providers/instagram';
import Kakao from 'next-auth/providers/kakao';
import Keycloak from 'next-auth/providers/keycloak';
import Line from 'next-auth/providers/line';
import Linkedin from 'next-auth/providers/linkedin';
import Mailchimp from 'next-auth/providers/mailchimp';
import Mailru from 'next-auth/providers/mailru';
import Medium from 'next-auth/providers/medium';
import Naver from 'next-auth/providers/naver';
import Netlify from 'next-auth/providers/netlify';
import Okta from 'next-auth/providers/okta';
import Onelogin from 'next-auth/providers/onelogin';
import Osso from 'next-auth/providers/osso';
import Osu from 'next-auth/providers/osu';
import Passage from 'next-auth/providers/passage';
import Patreon from 'next-auth/providers/patreon';
import Pinterest from 'next-auth/providers/pinterest';
import Pipedrive from 'next-auth/providers/pipedrive';
import Reddit from 'next-auth/providers/reddit';
import Salesforce from 'next-auth/providers/salesforce';
import Slack from 'next-auth/providers/slack';
import Spotify from 'next-auth/providers/spotify';
import Strava from 'next-auth/providers/strava';
import Todoist from 'next-auth/providers/todoist';
import Trakt from 'next-auth/providers/trakt';
import Twitch from 'next-auth/providers/twitch';
import Twitter from 'next-auth/providers/twitter';
import UnitedEffects from 'next-auth/providers/united-effects';
import Vk from 'next-auth/providers/vk';
import Wikimedia from 'next-auth/providers/wikimedia';
import Wordpress from 'next-auth/providers/wordpress';
import Workos from 'next-auth/providers/workos';
import Yandex from 'next-auth/providers/yandex';
import Zitadel from 'next-auth/providers/zitadel';
import Zoho from 'next-auth/providers/zoho';
import Zoom from 'next-auth/providers/zoom';

type OAuthInit =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: OAuthUserConfig<unknown>) => OAuthConfig<any>;

export const PROVIDER_CONFIG_BY_TYPE: Record<Exclude<OAuthClientProviderType, 'OIDC' | 'OAUTH'>, OAuthInit> = {
    [OAuthClientProviderType.SCHOOL_42]: School42,
    [OAuthClientProviderType.APPLE]: Apple,
    [OAuthClientProviderType.ATLASSIAN]: Atlassian,
    [OAuthClientProviderType.AUTH0]: Auth0,
    [OAuthClientProviderType.AUTHENTIK]: Authentik,
    [OAuthClientProviderType.AZURE_AD]: AzureAd,
    [OAuthClientProviderType.AZURE_AD_B2C]: AzureAdB2c,
    [OAuthClientProviderType.BATTLENET]: Battlenet as OAuthInit,
    [OAuthClientProviderType.BOX]: Box,
    [OAuthClientProviderType.BOXYHQ_SAML]: BoxyhqSaml,
    [OAuthClientProviderType.BUNGIE]: Bungie,
    [OAuthClientProviderType.COGNITO]: Cognito,
    [OAuthClientProviderType.COINBASE]: Coinbase,
    [OAuthClientProviderType.DISCORD]: Discord,
    [OAuthClientProviderType.DROPBOX]: Dropbox,
    [OAuthClientProviderType.DUENDE_IDENTITY_SERVER6]: DuendeIdentityServer6,
    [OAuthClientProviderType.EVEONLINE]: Eveonline,
    [OAuthClientProviderType.FACEBOOK]: Facebook,
    [OAuthClientProviderType.FACEIT]: Faceit,
    [OAuthClientProviderType.FOURSQUARE]: Foursquare,
    [OAuthClientProviderType.FRESHBOOKS]: Freshbooks,
    [OAuthClientProviderType.FUSIONAUTH]: Fusionauth,
    [OAuthClientProviderType.GITHUB]: Github,
    [OAuthClientProviderType.GITLAB]: Gitlab,
    [OAuthClientProviderType.GOOGLE]: Google,
    [OAuthClientProviderType.HUBSPOT]: Hubspot,
    [OAuthClientProviderType.IDENTITY_SERVER4]: IdentityServer4,
    [OAuthClientProviderType.INSTAGRAM]: Instagram,
    [OAuthClientProviderType.KAKAO]: Kakao,
    [OAuthClientProviderType.KEYCLOAK]: Keycloak,
    [OAuthClientProviderType.LINE]: Line,
    [OAuthClientProviderType.LINKEDIN]: Linkedin,
    [OAuthClientProviderType.MAILCHIMP]: Mailchimp,
    [OAuthClientProviderType.MAILRU]: Mailru,
    [OAuthClientProviderType.MEDIUM]: Medium,
    [OAuthClientProviderType.NAVER]: Naver,
    [OAuthClientProviderType.NETLIFY]: Netlify,
    [OAuthClientProviderType.OKTA]: Okta,
    [OAuthClientProviderType.ONELOGIN]: Onelogin,
    [OAuthClientProviderType.OSSO]: Osso,
    [OAuthClientProviderType.OSU]: Osu,
    [OAuthClientProviderType.PASSAGE]: Passage,
    [OAuthClientProviderType.PATREON]: Patreon,
    [OAuthClientProviderType.PINTEREST]: Pinterest,
    [OAuthClientProviderType.PIPEDRIVE]: Pipedrive,
    [OAuthClientProviderType.REDDIT]: Reddit,
    [OAuthClientProviderType.SALESFORCE]: Salesforce,
    [OAuthClientProviderType.SLACK]: Slack,
    [OAuthClientProviderType.SPOTIFY]: Spotify,
    [OAuthClientProviderType.STRAVA]: Strava,
    [OAuthClientProviderType.TODOIST]: Todoist,
    [OAuthClientProviderType.TRAKT]: Trakt,
    [OAuthClientProviderType.TWITCH]: Twitch,
    [OAuthClientProviderType.TWITTER]: Twitter,
    [OAuthClientProviderType.UNITED_EFFECTS]: UnitedEffects as OAuthInit,
    [OAuthClientProviderType.VK]: Vk,
    [OAuthClientProviderType.WIKIMEDIA]: Wikimedia,
    [OAuthClientProviderType.WORDPRESS]: Wordpress,
    [OAuthClientProviderType.WORKOS]: Workos,
    [OAuthClientProviderType.YANDEX]: Yandex,
    [OAuthClientProviderType.ZITADEL]: Zitadel,
    [OAuthClientProviderType.ZOHO]: Zoho,
    [OAuthClientProviderType.ZOOM]: Zoom
};
