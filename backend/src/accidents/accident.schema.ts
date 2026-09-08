import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  AccidentSource,
  AccidentStatus,
  AccidentType,
  Sex,
} from '@sost/shared';

export type AccidentDocument = HydratedDocument<Accident>;

@Schema({ timestamps: true, collection: 'accidents' })
export class Accident {
  @Prop({ type: Number })
  reportNumber?: number;

  @Prop({ type: String, trim: true })
  company?: string;

  @Prop({ type: String, trim: true, index: true, sparse: true, unique: true })
  catNumber?: string;

  @Prop({ type: String, trim: true })
  victimName?: string;

  @Prop({ type: String, enum: Sex })
  sex?: Sex;

  @Prop({ type: String, trim: true, index: true })
  role?: string;

  @Prop({ type: String, trim: true })
  accidentMonth?: string;

  @Prop({ type: String, trim: true, index: true })
  sector?: string;

  @Prop({ type: String, trim: true })
  employeeAllocation?: string;

  @Prop({ type: Date, index: true })
  accidentDate?: Date;

  @Prop({ type: Number, index: true })
  emissionYear?: number;

  @Prop({ type: Date })
  emissionDate?: Date;

  @Prop({ type: String, trim: true })
  accidentTime?: string;

  @Prop({ type: String, trim: true })
  bodyPart?: string;

  @Prop({ type: String, trim: true })
  causingAgent?: string;

  @Prop({ type: String, enum: AccidentType, index: true })
  accidentType?: AccidentType;

  @Prop({ type: String, trim: true, index: true })
  cid?: string;

  @Prop({ type: Number })
  daysOff?: number;

  @Prop({ type: String, trim: true })
  destinationSector?: string;

  @Prop({ type: String, trim: true })
  subject?: string;

  @Prop({ type: String, trim: true })
  seiReference?: string;

  @Prop({ type: Date })
  responseDeadline?: Date;

  @Prop({ type: String, trim: true })
  remainingDeadline?: string;

  @Prop({ type: String, enum: AccidentStatus, default: AccidentStatus.Unknown })
  status?: AccidentStatus;

  @Prop({ type: String, trim: true })
  notes?: string;

  @Prop({
    type: String,
    enum: AccidentSource,
    default: AccidentSource.Manual,
  })
  source!: AccidentSource;
}

export const AccidentSchema = SchemaFactory.createForClass(Accident);
