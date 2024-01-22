import {
    type AuthToken,
    OAuthClientProviderCheckType,
    OAuthClientProviderType,
    type Prisma,
    type Session
} from '@prisma/client';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {omit} from 'lodash';
import {DateTime} from 'luxon';
import type {AdapterAccount, AdapterUser, VerificationToken} from 'next-auth/adapters';
import type {OAuthConfig} from 'next-auth/providers/oauth';
import {v4 as uuidv4} from 'uuid';
import {describe, expect, test} from 'vitest';

import {mockModel, prismaMock} from '~/__tests__/mocks/prisma';

import {
    type OAuthClientConnectionWithProvider,
    type UserWithEntity,
    adapter,
    getGlobalAdapterProviders,
    getGlobalOAuthClientProviders,
    toAdapterAccount,
    toAdapterSession,
    toAdapterUser,
    toAdapterVerificationToken,
    toNullableAdapterUser,
    toProvider
} from './adapter';

const now = DateTime.now().toJSDate();

const createProvider = (
    data: Partial<Prisma.OAuthClientProviderGetPayload<undefined>> &
        Pick<Prisma.OAuthClientProviderGetPayload<undefined>, 'name' | 'slug' | 'type' | 'isGlobal'>
): Prisma.OAuthClientProviderGetPayload<undefined> =>
    mockModel({
        wellKnown: null,
        issuer: null,
        authorization: null,
        token: null,
        userinfo: null,
        checks: null,
        clientId: null,
        clientSecret: null,
        style: null,
        ...data
    });

const providerGoogle = createProvider({
    name: 'Google',
    slug: 'google',
    type: OAuthClientProviderType.GOOGLE,
    isGlobal: true
});

const entityId = uuidv4();
const user: UserWithEntity = mockModel({
    entityId,
    entity: mockModel({
        id: entityId,
        name: {
            en: 'Clara Oswald'
        },
        handle: 'clara',
        profileImageUrl: 'https://example.com/images/clara-oswald.png',
        emailAddresses: [
            mockModel({
                email: 'clara.oswald@example.com',
                isPrimary: true,
                isVerified: true,
                verifiedAt: now,
                verificationToken: null,
                entityId
            }),
            mockModel({
                email: 'clara.oswald.backup@example.com',
                isPrimary: false,
                isVerified: false,
                verifiedAt: null,
                verificationToken: 'abcdef',
                entityId
            })
        ]
    })
});

const connection: OAuthClientConnectionWithProvider = mockModel({
    identifier: 'clara.oswald@example.com',
    refreshToken: 'refresh',
    accessToken: 'access',
    expiresAt: now.getTime(),
    tokenType: 'tokenType',
    scope: 'openid',
    idToken: 'idToken',
    sessionState: 'state',
    provider: providerGoogle,
    providerId: providerGoogle.id,
    user: user,
    userId: user.id
});

const adapterUser: AdapterUser = {
    id: user.id,
    name: 'Clara Oswald',
    email: 'clara.oswald@example.com',
    emailVerified: now,
    image: 'https://example.com/images/clara-oswald.png'
};

describe('toAdapterUser', () => {
    test('should return the primary email address', () => {
        expect(toAdapterUser(user)).toHaveProperty('email', 'clara.oswald@example.com');
    });

    test('should throw an error if no primary email address exists', () => {
        expect(() =>
            toAdapterUser({
                ...user,
                entity: {
                    ...user.entity,
                    emailAddresses: user.entity.emailAddresses.slice(1, 1)
                }
            })
        ).toThrowError('User has no primary email address.');
    });

    test('should return an adapter user', () => {
        expect(toAdapterUser(user)).toEqual({
            id: user.id,
            email: 'clara.oswald@example.com',
            emailVerified: now,
            name: 'Clara Oswald',
            image: 'https://example.com/images/clara-oswald.png'
        });
    });
});

describe('toNullableAdapterUser', () => {
    test('should return null if the user is null or undefined', () => {
        expect(toNullableAdapterUser(undefined)).toBeNull();
        expect(toNullableAdapterUser(null)).toBeNull();
    });

    test('should return an adapter user if the user is not null or undefined', () => {
        expect(toNullableAdapterUser(user)).toEqual(toAdapterUser(user));
    });
});

describe('toAdapterSession', () => {
    const session: Session = mockModel({
        token: 'zyx',
        expiresAt: now,
        userId: uuidv4()
    });

    test('should return an adapter session', () => {
        expect(toAdapterSession(session)).toEqual({
            expires: now,
            sessionToken: 'zyx',
            userId: session.userId
        });
    });
});

describe('toAdapterAccount', () => {
    test('should return an adapter account', () => {
        expect(toAdapterAccount(connection)).toEqual({
            type: 'oauth',
            provider: providerGoogle.id,
            providerAccountId: 'clara.oswald@example.com',
            userId: user.id,
            refresh_token: 'refresh',
            access_token: 'access',
            expires_at: now.getTime(),
            token_type: 'tokenType',
            scope: 'openid',
            id_token: 'idToken',
            session_state: 'state'
        });
    });
});

describe('toAdapterVerificationToken', () => {
    const authToken: AuthToken = mockModel({
        email: 'clara.oswald@example.com',
        token: '1234567890',
        expiresAt: now
    });

    test('should return an adapater verification token', () => {
        expect(toAdapterVerificationToken(authToken)).toEqual({
            identifier: 'clara.oswald@example.com',
            token: '1234567890',
            expires: now
        });
    });
});

describe('toProvider', () => {
    test('should return a provider without defaults if type is custom', () => {
        const providerCustom = createProvider({
            name: 'Custom',
            slug: 'custom',
            type: OAuthClientProviderType.OIDC,
            isGlobal: false,
            clientId: '123',
            clientSecret: '456',
            wellKnown: 'https://example.com/.well-known/openid-configuration',
            issuer: 'https://example.com',
            authorization: 'https://example.com/authorize',
            token: 'https://example.com/token',
            userinfo: 'https://example.com/userinfo',
            checks: OAuthClientProviderCheckType.PKCE
        });

        expect(toProvider(providerCustom)).toMatchObject({
            type: 'oauth',
            id: providerCustom.id,
            name: 'Custom',
            clientId: '123',
            clientSecret: '456',
            wellKnown: 'https://example.com/.well-known/openid-configuration',
            issuer: 'https://example.com',
            authorization: 'https://example.com/authorize',
            token: 'https://example.com/token',
            userinfo: 'https://example.com/userinfo',
            checks: 'pkce'
        });

        const profile = {key: 'value'};
        expect((toProvider(providerCustom) as OAuthConfig<unknown>).profile(profile, {})).toEqual(profile);
    });

    test('should return a provider with defaults if type is not custom', () => {
        const providerAzureAd = createProvider({
            name: 'Microsoft',
            slug: 'microsoft',
            type: OAuthClientProviderType.AZURE_AD,
            isGlobal: true,
            clientId: '123',
            clientSecret: '456'
        });

        expect(toProvider(providerAzureAd)).toMatchObject({
            type: 'oauth',
            id: providerAzureAd.id,
            name: 'Microsoft',
            wellKnown: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration?appid=123',
            authorization: {
                params: {
                    scope: 'openid profile email'
                }
            },
            options: {
                clientId: '123',
                clientSecret: '456',
                authorization: undefined,
                token: undefined,
                userinfo: undefined
            }
        });

        expect((toProvider(providerAzureAd) as OAuthConfig<unknown>).profile).toBeTypeOf('function');
    });
});

describe('adapter', () => {
    describe('createUser', () => {
        test('should resolve the created adapter user', () => {
            prismaMock.user.create.mockResolvedValueOnce(user);

            expect(adapter.createUser(omit(adapterUser, 'id'))).resolves.toEqual({
                ...adapterUser,
                id: user.id
            });
        });
    });

    describe('getUser', () => {
        test('should resolve null if the user does not exist', () => {
            prismaMock.user.findUnique.mockResolvedValueOnce(null);

            expect(adapter.getUser(uuidv4())).resolves.toBeNull();
        });

        test('should resolve the adapter user if the user exists', () => {
            prismaMock.user.findUnique.mockResolvedValueOnce(user);

            expect(adapter.getUser(user.id)).resolves.toEqual(toAdapterUser(user));
        });
    });

    describe('getUserByEmail', () => {
        test('should resolve null if no user has the email address', () => {
            prismaMock.user.findMany.mockResolvedValueOnce([]);

            expect(adapter.getUserByEmail('unknown@example.com')).resolves.toBeNull();
        });

        test('should resolve the adapter user if a user has the email address', () => {
            prismaMock.user.findMany.mockResolvedValueOnce([user]);

            expect(adapter.getUserByEmail(user.id)).resolves.toEqual(toAdapterUser(user));
        });

        test('should reject if multiple users have the email address', () => {
            prismaMock.user.findMany.mockResolvedValueOnce([user, user]);

            expect(adapter.getUserByEmail('clara.oswald@exampe.com')).rejects.toThrowError(
                'Multiple users have the same email address.'
            );
        });
    });

    describe('getUserByAccount', () => {
        const account: Pick<AdapterAccount, 'provider' | 'providerAccountId'> = {
            provider: providerGoogle.id,
            providerAccountId: user.id
        };

        test('should resolve null if no account exists', () => {
            prismaMock.oAuthClientConnection.findUnique.mockResolvedValueOnce(null);

            expect(adapter.getUserByAccount(account)).resolves.toBeNull();
        });

        test('should resolve the adapter user if the account exists', () => {
            prismaMock.oAuthClientConnection.findUnique.mockResolvedValueOnce(connection);

            expect(adapter.getUserByAccount(account)).resolves.toEqual(toAdapterUser(user));
        });
    });

    describe('updateUser', () => {
        test('should update the entity name if it is null', async () => {
            prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(user);
            prismaMock.user.update.mockResolvedValueOnce(user);

            await adapter.updateUser(adapterUser);

            expect(prismaMock.user.update.mock.lastCall![0]).toHaveProperty('data.entity.update.name', undefined);

            prismaMock.user.findFirstOrThrow.mockResolvedValueOnce({
                ...user,
                entity: {
                    ...user.entity,
                    name: {
                        en: null
                    }
                }
            } as typeof user);
            prismaMock.user.update.mockResolvedValueOnce(user);

            await adapter.updateUser({
                ...adapterUser,
                name: 'Test'
            });

            expect(prismaMock.user.update.mock.lastCall![0]).toHaveProperty('data.entity.update.name', {
                en: 'Test'
            });
        });

        test('should create or update the email address if it is not null', async () => {
            prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(user);
            prismaMock.user.update.mockResolvedValueOnce(user);

            await adapter.updateUser({
                ...adapterUser,
                email: undefined
            });

            expect(prismaMock.user.update.mock.lastCall![0]).toHaveProperty(
                'data.entity.update.emailAddresses',
                undefined
            );

            prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(user);
            prismaMock.user.update.mockResolvedValueOnce(user);

            await adapter.updateUser({
                ...adapterUser,
                email: 'test@example.com'
            });

            expect(prismaMock.user.update.mock.lastCall![0]).toHaveProperty(
                'data.entity.update.emailAddresses.upsert.where.email',
                'test@example.com'
            );
        });

        test('should resolve the updated adapter user', () => {
            prismaMock.user.findFirstOrThrow.mockResolvedValueOnce(user);
            prismaMock.user.update.mockResolvedValueOnce(user);

            expect(adapter.updateUser(adapterUser)).resolves.toEqual(adapterUser);
        });
    });

    describe('deleteUser', () => {
        test('should resolve the deleted adapter user', () => {
            prismaMock.user.delete.mockResolvedValueOnce(user);

            expect(adapter.deleteUser(adapterUser.id)).resolves.toEqual(adapterUser);
        });
    });

    describe.skip('linkAccount', () => {});

    describe.skip('unlinkAccount', () => {});

    describe.skip('getSessionAndUser', () => {});

    describe.skip('createSession', () => {});

    describe.skip('updateSession', () => {});

    describe.skip('deleteSession', () => {});

    describe('createVerificationToken', () => {
        const verificationToken: VerificationToken = {
            identifier: 'info@example.com',
            token: '1234567890',
            expires: DateTime.now().plus({days: 1}).toJSDate()
        };

        test('should resolve the created verification token', () => {
            prismaMock.authToken.create.mockResolvedValueOnce(
                mockModel({
                    email: verificationToken.identifier,
                    token: verificationToken.token,
                    expiresAt: verificationToken.expires
                })
            );

            expect(adapter.createVerificationToken(verificationToken)).resolves.toEqual(verificationToken);
        });
    });

    describe('useVerificationToken', () => {
        const verificationToken: VerificationToken = {
            identifier: 'info@example.com',
            token: '1234567890',
            expires: DateTime.now().plus({days: 1}).toJSDate()
        };

        test('should resolve with the used verification token', () => {
            prismaMock.authToken.delete.mockResolvedValueOnce(
                mockModel({
                    email: verificationToken.identifier,
                    token: verificationToken.token,
                    expiresAt: verificationToken.expires
                })
            );

            expect(adapter.useVerificationToken(verificationToken)).resolves.toEqual(verificationToken);
        });

        test('should resolve with null if the verification token was already used', () => {
            prismaMock.authToken.delete.mockRejectedValueOnce(
                new PrismaClientKnownRequestError(
                    'An operation failed because it depends on one or more records that were required but not found.',
                    {
                        clientVersion: '',
                        code: 'P2025'
                    }
                )
            );

            expect(adapter.useVerificationToken(verificationToken)).resolves.toBeNull();
        });

        test('should reject for other errors', () => {
            const error = new PrismaClientKnownRequestError('Server has closed the connection.', {
                clientVersion: '',
                code: 'P1017'
            });

            prismaMock.authToken.delete.mockRejectedValueOnce(error);

            expect(adapter.useVerificationToken(verificationToken)).rejects.toBe(error);
        });
    });
});

describe('getGlobalAdapterProviders', () => {
    test('should only resolve global adapter providers', () => {
        prismaMock.oAuthClientProvider.findMany.mockResolvedValueOnce([providerGoogle]);

        expect(getGlobalAdapterProviders()).resolves.toMatchObject([omit(toProvider(providerGoogle), 'profile')]);
    });
});

describe('getGlobalOAuthClientProviders', () => {
    test('should only resolve global providers', () => {
        prismaMock.oAuthClientProvider.findMany.mockResolvedValueOnce([providerGoogle]);

        expect(getGlobalOAuthClientProviders()).resolves.toEqual([providerGoogle]);
    });
});
