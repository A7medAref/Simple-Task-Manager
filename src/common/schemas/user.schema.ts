import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { Document } from 'mongoose';
import { v4 } from 'uuid';

export type UserDocument = User & Document;

@Schema({ _id: false, versionKey: false })
export class User {
  @Prop({ default: v4 })
  id: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, select: false })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
