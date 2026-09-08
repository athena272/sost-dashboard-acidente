import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EditorRequestStatus } from '@sost/shared';

export type EditorRequestDocument = HydratedDocument<EditorRequest>;

@Schema({ timestamps: true, collection: 'editor_requests' })
export class EditorRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  username!: string;

  @Prop({
    type: String,
    enum: EditorRequestStatus,
    required: true,
    default: EditorRequestStatus.Pending,
    index: true,
  })
  status!: EditorRequestStatus;

  @Prop({ type: String, trim: true })
  message?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt?: Date;
}

export const EditorRequestSchema = SchemaFactory.createForClass(EditorRequest);
EditorRequestSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: EditorRequestStatus.Pending },
  },
);
