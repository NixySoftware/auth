import type {PrismaClient} from '@prisma/client';
import NextAuth, {type AuthOptions} from 'next-auth';
import type {NextRequest} from 'next/server';

import {getGlobalAdapterProviders} from './provider';

export const createRouteHandler =
    (prisma: PrismaClient, baseOptions: AuthOptions) =>
    async (request: NextRequest, context: {params: {nextauth: string[]}}) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return NextAuth(request, context, {
            ...baseOptions,
            providers: [...baseOptions.providers, ...(await getGlobalAdapterProviders(prisma))]
        });
    };
