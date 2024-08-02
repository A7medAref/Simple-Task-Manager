import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, ProjectionElementType } from 'mongoose';
import { Model } from 'mongoose';

import type { UserDocument } from '../common/schemas/user.schema';
import { User } from '../common/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUser(
    filter: FilterQuery<UserDocument>,
    select: { [P in keyof UserDocument]?: ProjectionElementType } = {},
  ): Promise<User> {
    const user = await this.userModel
      .findOne(filter, { ...select, _id: false })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async isUserExist(filter: FilterQuery<UserDocument>): Promise<boolean> {
    const result = await this.userModel.exists(filter);

    return result !== null;
  }

  async createUser(user: Partial<UserDocument>): Promise<string> {
    try {
      const [newUser] = await this.userModel.insertMany([user]);

      return newUser.id;
    } catch (error) {
      if (error.code === 11_000) {
        throw new BadRequestException('Username already exists');
      }

      throw error;
    }
  }
}
