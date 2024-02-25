import {createRouteHandler} from '@nixysoftware/auth-adapter-prisma-providers';

import {getBaseAuthOptions} from '~/server/auth';
import {prisma} from '~/server/prisma';

const handler = createRouteHandler(prisma, getBaseAuthOptions());

export {handler as GET, handler as POST};
