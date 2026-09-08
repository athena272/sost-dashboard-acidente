import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ActivityAction } from '@sost/shared';

export type ActivityLogDocument = HydratedDocument<ActivityLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'activity_logs' })
export class ActivityLog {
  @Prop({ type: String, enum: ActivityAction, required: true, index: true })
  action!: ActivityAction;

  @Prop({ type: String, required: true, index: true })
  entityType!: string;

  @Prop({ type: String })
  entityId?: string;

  @Prop({ type: String, required: true, index: true })
  actorUserId!: string;

  @Prop({ type: String, required: true })
  actorUsername!: string;

  @Prop({ type: Object, default: {} })
  details!: Record<string, unknown>;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
ActivityLogSchema.index({ createdAt: -1 });
