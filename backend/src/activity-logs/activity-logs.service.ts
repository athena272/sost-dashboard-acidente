import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import { ActivityAction } from '@sost/shared';
import { ActivityLog, ActivityLogDocument } from './activity-log.schema';

export type RecordActivityInput = {
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  actorUserId: string;
  actorUsername: string;
  details?: Record<string, unknown>;
};

export type QueryActivityLogsInput = {
  page?: number;
  limit?: number;
  q?: string;
  action?: ActivityAction;
  actorUserId?: string;
  createdFrom?: string;
  createdTo?: string;
  sortDir?: 'asc' | 'desc';
};

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLogDocument>,
  ) {}

  async record(input: RecordActivityInput) {
    try {
      await this.activityLogModel.create({
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        actorUserId: input.actorUserId,
        actorUsername: input.actorUsername,
        details: input.details ?? {},
      });
    } catch (error) {
      this.logger.warn(
        `Failed to record activity ${input.action}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async findAll(query: QueryActivityLogsInput) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: FilterQuery<ActivityLogDocument> = {};

    if (query.action) filter.action = query.action;
    if (query.actorUserId) filter.actorUserId = query.actorUserId;
    if (query.q?.trim()) {
      const regex = new RegExp(query.q.trim(), 'i');
      filter.$or = [
        { actorUsername: regex },
        { entityType: regex },
        { entityId: regex },
        { action: regex },
      ];
    }
    if (query.createdFrom || query.createdTo) {
      filter.createdAt = {};
      if (query.createdFrom) {
        filter.createdAt.$gte = new Date(`${query.createdFrom}T00:00:00.000Z`);
      }
      if (query.createdTo) {
        filter.createdAt.$lte = new Date(`${query.createdTo}T23:59:59.999Z`);
      }
    }

    const sortDir: SortOrder = query.sortDir === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.activityLogModel
        .find(filter)
        .sort({ createdAt: sortDir })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.activityLogModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
