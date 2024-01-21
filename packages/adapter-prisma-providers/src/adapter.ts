import {type Prisma, PrismaClient} from '@prisma/client';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import type {Adapter, AdapterAccount, AdapterSession, AdapterUser, VerificationToken} from 'next-auth/adapters';

export interface AdapterPrismaOptions<
    UserInclude extends Prisma.UserInclude & {entity: {include: {emailAddresses: true}}} = {
        entity: {include: {emailAddresses: true}};
    }
> {
    includes?: {
        user: UserInclude;
    };
    transformers?: {
        user: (user: Prisma.UserGetPayload<{include: UserInclude}>) => Pick<AdapterUser, 'name' | 'image'>;

        create: (adapterUser: Omit<AdapterUser, 'id'>) => Promise<Prisma.EntityCreateWithoutUserInput>;
        update: (
            adapterUser: Partial<AdapterUser> & Pick<AdapterUser, 'id'>,
            user: Prisma.UserGetPayload<{include: UserInclude}>
        ) => Promise<Prisma.EntityUpdateWithoutUserInput>;
    };
}

export const createAdapterPrisma = (prisma: PrismaClient, options: AdapterPrismaOptions = {}): Adapter => {
    type UserInclude = typeof options extends AdapterPrismaOptions<infer UserInclude> ? UserInclude : never;
    type UserWithEntity = Prisma.UserGetPayload<{include: UserInclude}>;

    // TODO: prevent linking if another user already has the email address
    // TODO: figure out if adapter user's ID is from the provider ID or DB ID

    const userInclude: UserInclude = options.includes?.user ?? {
        entity: {
            include: {
                emailAddresses: true
            }
        }
    };

    const userTransformer =
        options.transformers?.user ??
        (async (user) => ({
            name: user.entity.name,
            image: user.entity.profileImageUrl
        }));

    const createTransformer =
        options.transformers?.create ??
        (async ({name, image}) => ({
            name: name ?? '',
            profileImageUrl: image
        }));

    const updateTransformer =
        options.transformers?.update ??
        (async ({image}, user) => ({
            profileImageUrl: user.entity.profileImageUrl ? undefined : image
        }));

    const toAdapterUser = (user: UserWithEntity): AdapterUser => {
        const emailAddress = user.entity.emailAddresses.find((emailAddress) => emailAddress.isPrimary);
        if (!emailAddress) {
            throw new Error('User has no primary email address.');
        }

        return {
            id: user.id,
            email: emailAddress.email,
            emailVerified: emailAddress.verifiedAt,
            ...userTransformer(user)
        };
    };

    const toNullableAdapterUser = (user: UserWithEntity | null | undefined): AdapterUser | null => {
        if (!user) {
            return null;
        }
        return toAdapterUser(user);
    };

    const toAdapterSession = (session: Prisma.SessionGetPayload<{}>): AdapterSession => ({
        expires: session.expiresAt,
        sessionToken: session.token,
        userId: session.userId
    });

    const includeProvider = {
        provider: true
    } satisfies Prisma.OAuthClientConnectionInclude;

    type OAuthClientConnectionWithProvider = Prisma.OAuthClientConnectionGetPayload<{
        include: typeof includeProvider;
    }>;

    const toAdapterAccount = (connection: OAuthClientConnectionWithProvider): AdapterAccount => ({
        type: 'oauth',
        provider: connection.providerId,
        providerAccountId: connection.identifier,
        userId: connection.userId,
        refresh_token: connection.refreshToken ?? undefined,
        access_token: connection.accessToken ?? undefined,
        expires_at: connection.expiresAt ?? undefined,
        token_type: connection.tokenType ?? undefined,
        scope: connection.scope ?? undefined,
        id_token: connection.idToken ?? undefined,
        session_state: connection.sessionState ?? undefined
    });

    const toAdapterVerificationToken = (authToken: Prisma.AuthTokenGetPayload<{}>): VerificationToken => ({
        identifier: authToken.email,
        token: authToken.token,
        expires: authToken.expiresAt
    });

    return {
        // Based on the default Prisma adapter (https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/src/index.ts)

        async createUser(adapterUser) {
            console.log('create', adapterUser);
            const {email, emailVerified} = adapterUser;

            return toAdapterUser(
                await prisma.user.create({
                    data: {
                        entity: {
                            create: {
                                emailAddresses: {
                                    create: {
                                        email: email,
                                        isPrimary: true,
                                        isVerified: !!emailVerified,
                                        verifiedAt: emailVerified
                                    }
                                },

                                ...(await createTransformer(adapterUser))
                            }
                        }
                    },
                    include: userInclude
                })
            );
        },
        async getUser(id) {
            return toNullableAdapterUser(
                await prisma.user.findUnique({
                    where: {
                        id
                    },
                    include: userInclude
                })
            );
        },
        async getUserByEmail(email) {
            const users = await prisma.user.findMany({
                where: {
                    entity: {
                        emailAddresses: {
                            some: {
                                email: {
                                    equals: email
                                }
                            }
                        }
                    }
                },
                include: userInclude
            });

            if (users.length > 1) {
                throw new Error('Multiple users have the same email address.');
            }

            return toNullableAdapterUser(users.at(0));
        },
        async getUserByAccount({provider, providerAccountId}) {
            const connection = await prisma.oAuthClientConnection.findUnique({
                where: {
                    providerId_identifier: {
                        providerId: provider,
                        identifier: providerAccountId
                    }
                },
                select: {
                    user: {
                        include: userInclude
                    }
                }
            });
            return toNullableAdapterUser(connection?.user);
        },
        async updateUser(adapterUser) {
            console.log('update', adapterUser);
            const {id, email, emailVerified} = adapterUser;

            const user = await prisma.user.findFirstOrThrow({
                where: {
                    id
                },
                include: userInclude
            });
            return toAdapterUser(
                await prisma.user.update({
                    where: {
                        id
                    },
                    data: {
                        entity: {
                            update: {
                                emailAddresses: email
                                    ? {
                                          upsert: {
                                              where: {
                                                  email
                                              },
                                              create: {
                                                  email,
                                                  isVerified: !!emailVerified,
                                                  verifiedAt: emailVerified
                                              },
                                              update: {
                                                  isVerified: !!emailVerified,
                                                  verifiedAt: emailVerified
                                              }
                                          }
                                      }
                                    : undefined,

                                ...(await updateTransformer(adapterUser, user))
                            }
                        }
                    },
                    include: userInclude
                })
            );
        },
        async deleteUser(id) {
            return toAdapterUser(
                await prisma.user.delete({
                    where: {
                        id
                    },
                    include: userInclude
                })
            );
        },
        async linkAccount(data) {
            return toAdapterAccount(
                await prisma.oAuthClientConnection.create({
                    data: {
                        identifier: data.providerAccountId,
                        refreshToken: data.refresh_token,
                        accessToken: data.access_token,
                        expiresAt: data.expires_at,
                        tokenType: data.token_type,
                        scope: data.scope,
                        idToken: data.id_token,
                        sessionState: data.session_state,

                        provider: {
                            connect: {
                                id: data.provider
                            }
                        },
                        user: {
                            connect: {
                                id: data.userId
                            }
                        }
                    },
                    include: includeProvider
                })
            );
        },
        async unlinkAccount({provider, providerAccountId}) {
            return toAdapterAccount(
                await prisma.oAuthClientConnection.delete({
                    where: {
                        providerId_identifier: {
                            providerId: provider,
                            identifier: providerAccountId
                        }
                    },
                    include: includeProvider
                })
            );
        },
        async getSessionAndUser(token) {
            const sessionAndUser = await prisma.session.findUnique({
                where: {
                    token
                },
                include: {
                    user: {
                        include: userInclude
                    }
                }
            });
            if (!sessionAndUser) {
                return null;
            }
            const {user, ...session} = sessionAndUser;
            return {
                session: toAdapterSession(session),
                user: toAdapterUser(user)
            };
        },
        async createSession({sessionToken: token, expires: expiresAt, ...data}) {
            return toAdapterSession(
                await prisma.session.create({
                    data: {
                        token,
                        expiresAt,
                        ...data
                    }
                })
            );
        },
        async updateSession({sessionToken: token, expires: expiresAt, ...data}) {
            return toAdapterSession(
                await prisma.session.update({
                    where: {
                        token
                    },
                    data: {
                        token,
                        expiresAt,
                        ...data
                    }
                })
            );
        },
        async deleteSession(token) {
            return toAdapterSession(
                await prisma.session.delete({
                    where: {
                        token
                    }
                })
            );
        },
        async createVerificationToken({identifier, token, expires}) {
            return toAdapterVerificationToken(
                await prisma.authToken.create({
                    data: {
                        email: identifier,
                        token,
                        expiresAt: expires
                    }
                })
            );
        },
        async useVerificationToken({identifier, token}) {
            try {
                return toAdapterVerificationToken(
                    await prisma.authToken.delete({
                        where: {
                            email_token: {
                                email: identifier,
                                token
                            }
                        }
                    })
                );
            } catch (err) {
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if (err && err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
                    return null;
                }
                throw err;
            }
        }
    } satisfies Adapter;
};
