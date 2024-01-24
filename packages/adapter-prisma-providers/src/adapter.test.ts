import {omit} from 'lodash';
import {DateTime} from 'luxon';
import {AdapterUser} from 'next-auth/adapters';
import {PrismockClient} from 'prismock';
import {v4 as uuidv4} from 'uuid';
import {describe, expect, test} from 'vitest';

import {mockModel} from './__tests__/util';
import {createAdapter} from './adapter';

const now = DateTime.now().toJSDate();

const entityId = uuidv4();
const user = mockModel({
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

const adapterUser: AdapterUser = {
    id: user.id,
    name: 'Clara Oswald',
    email: 'clara.oswald@example.com',
    emailVerified: now,
    image: 'https://example.com/images/clara-oswald.png'
};

describe('createAdapterPrisma', () => {});

describe('AdapterPrisma', () => {
    // TODO: try prisma-mock
    const prisma = new PrismockClient();
    const adapter = createAdapter(prisma);

    describe('createUser', () => {
        test('should resolve the created adapter user', async () => {
            await adapter.createUser(omit(adapterUser, 'id')).then((result) => {
                console.log('PANNEKOEK', result);
            });

            expect(adapter.createUser(omit(adapterUser, 'id'))).resolves.toEqual({
                ...adapterUser,
                // TODO: this would return an ID in a real world scenario
                id: undefined
            });
        });
    });

    // describe('getUser', () => {
    //     test('should resolve null if the user does not exist', () => {
    //         expect(adapter.getUser(uuidv4())).resolves.toBeNull();
    //     });

    //     test('should resolve the adapter user if the user exists', () => {
    //         expect(adapter.getUser(user.id)).resolves.toEqual(adapterUser);
    //     });
    // });
});
