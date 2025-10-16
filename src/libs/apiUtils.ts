import { ActivityAction } from '@prisma/client';
import { logActivity } from './activityLogger';

export async function withActivityLogging<T>(
  operation: () => Promise<T>,
  options: {
    entityType: string;
    entityId: string;
    action: ActivityAction;
    userId: string;
    getCurrentData?: (result: any) => Promise<any>;
    getPreviousData?: () => Promise<any>;
    metadata?: Record<string, any>;
  }
): Promise<T> {
  const {
    entityType,
    entityId,
    action,
    userId,
    getCurrentData,
    getPreviousData,
    metadata,
  } = options;

  let previousData: any = null;
  let result: any;

  try {
    console.log('getPreviousData');
    // Get data before the operation if needed
    if (getPreviousData) {
      previousData = await getPreviousData();
    }

    // Execute the main operation
    result = await operation();
    console.log({result});

    // Get data after the operation if needed
    let currentData = null;
    if (getCurrentData) {
      currentData = await getCurrentData(result);
    }
    console.log({currentData});

    // Log the activity
    await logActivity({
      entityType,
      entityId: entityId || result?.id,
      action,
      performedById: userId,
      previousValues: previousData,
      newValues: currentData,
      changedFields: previousData && currentData 
        ? Object.keys(previousData).filter(
            key => JSON.stringify(previousData[key]) !== JSON.stringify(currentData?.[key])
          )
        : [],
      metadata,
    });

    return result;
  } catch (error) {
    // Log error activity
    await logActivity({
      entityType,
      entityId,
      action: ActivityAction.Update, // Default to UPDATE for errors
      performedById: userId,
      previousValues: previousData,
      newValues: null,
      changedFields: [],
      metadata: {
        ...metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    throw error; // Re-throw the error after logging
  }
}
