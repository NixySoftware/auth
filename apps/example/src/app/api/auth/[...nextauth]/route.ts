import {getBaseAuthOptions, getGlobalAdapterProviders} from '@nixyorg/auth-adapter-prisma-providers';
import NextAuth from 'next-auth';
import type {NextRequest} from 'next/server';
import {prisma} from '~/server/prisma';

// TODO: move as much as possible to the library

const handler = async (request: NextRequest, context: {params: {nextauth: string[]}}) => {
    const base = getBaseAuthOptions();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return NextAuth(request, context, {
        ...base,
        providers: [...base.providers, ...(await getGlobalAdapterProviders(prisma))]
    });
};

export {handler as GET, handler as POST};
