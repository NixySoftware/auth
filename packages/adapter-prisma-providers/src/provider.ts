import {
    type OAuthClientProvider,
    type OAuthClientProviderCheckType,
    OAuthClientProviderType,
    type Prisma,
    PrismaClient
} from '@prisma/client';
import type {Provider} from 'next-auth/providers/index';

import {PROVIDER_CONFIG_BY_TYPE} from './provider-types.js';

export const toProvider = (provider: OAuthClientProvider): Provider => {
    const isCustom = provider.type === OAuthClientProviderType.OIDC || provider.type === OAuthClientProviderType.OAUTH;

    return isCustom
        ? {
              type: 'oauth',

              id: provider.id,
              name: provider.name,
              clientId: provider.clientId ?? undefined,
              clientSecret: provider.clientSecret ?? undefined,

              wellKnown: provider.wellKnown ?? undefined,
              issuer: provider.issuer ?? undefined,
              authorization: (provider.authorization as string | Prisma.JsonObject | null) ?? undefined,
              token: (provider.token as string | Prisma.JsonObject | null) ?? undefined,
              userinfo: (provider.userinfo as string | Prisma.JsonObject | null) ?? undefined,
              checks: provider.checks?.toLowerCase() as Lowercase<OAuthClientProviderCheckType> | undefined,

              profile(profile) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                  return profile;
              }
          }
        : {
              ...PROVIDER_CONFIG_BY_TYPE[provider.type as Exclude<OAuthClientProviderType, 'OIDC' | 'OAUTH'>]({
                  clientId: provider.clientId as string,
                  clientSecret: provider.clientSecret as string,
                  authorization: (provider.authorization as string | Prisma.JsonObject | null) ?? undefined,
                  token: (provider.token as string | Prisma.JsonObject | null) ?? undefined,
                  userinfo: (provider.userinfo as string | Prisma.JsonObject | null) ?? undefined
              }),

              id: provider.id,
              name: provider.name
          };
};

export const getGlobalAdapterProviders = async (prisma: PrismaClient) => {
    const providers = await prisma.oAuthClientProvider.findMany({
        where: {
            isGlobal: true
        }
    });

    return providers.map(toProvider);
};

export const getGlobalOAuthClientProviders = async (prisma: PrismaClient): Promise<OAuthClientProvider[]> => {
    return await prisma.oAuthClientProvider.findMany({
        where: {
            isGlobal: true
        }
    });
};
