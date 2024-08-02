import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import type { User } from '../schemas/user.schema';

/**
 * @param data: the user's data
 * @param ctx: the context
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
