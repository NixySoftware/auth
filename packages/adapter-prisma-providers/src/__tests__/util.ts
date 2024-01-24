import {DateTime} from 'luxon';
import {v4 as uuidv4} from 'uuid';

interface BaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export const mockModel = <T extends Record<string, unknown>>(data: T): BaseModel & T => {
    const now = DateTime.now().toJSDate();

    return {
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
        ...data
    };
};
