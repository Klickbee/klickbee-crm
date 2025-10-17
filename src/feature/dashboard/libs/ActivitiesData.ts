import type { Activity } from "../types/Types"

export const fetchRecentActivities = async (): Promise<Activity[]> => {
  try {
    const response = await fetch('/api/admin/activity?limit=10');
    if (!response.ok) {
      throw new Error('Failed to fetch activities');
    }
    const data = await response.json();

    // Debug logging to see what entity types are being received
    if (data.data && Array.isArray(data.data)) {
      const entityTypes = [...new Set(data.data.map((activity: any) => activity.entityType))];
      console.log('Activity entity types received:', entityTypes);
    }

    return mapActivitiesToInterface(data.data);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

// Map API response to Activity interface
const mapActivitiesToInterface = (activities: any[]): Activity[] => {
  return activities
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by newest first
    .slice(0, 10) // Ensure only 10 activities
    .map((activity, index) => {
      const user = activity.performedBy?.name || activity.performedBy?.email || 'Unknown User';
      const initials = getInitials(user);
      const time = formatTime(activity.createdAt);

      const { action, description } = generateActivityDescription(activity);

      return {
        id: activity.id,
        user,
        initials,
        action,
        description,
        time,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user)}&background=random&size=32` // Placeholder avatar
      };
    });
}

// Generate initials from name
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Format time relative to now
const formatTime = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);

  // Handle invalid dates
  if (isNaN(created.getTime())) {
    console.warn('Invalid date format:', createdAt);
    return 'Unknown time';
  }

  const diffInMs = Math.abs(now.getTime() - created.getTime());
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return created.toLocaleDateString();
}

// Generate activity description based on API data
const generateActivityDescription = (activity: any): { action: string, description: string } => {
  const { action, entityType, metadata } = activity;
  const user = activity.performedBy?.name || activity.performedBy?.email || 'User';

  // Handle only deal-related activities
  if (entityType?.toLowerCase() === 'deal' || entityType?.toLowerCase() === 'deals') {
    switch (action) {
      case 'Create':
        const dealData = activity.newValues;
        const dealName = dealData?.dealName || 'Unnamed Deal';
        const amount = dealData?.amount || 0;
        const currency = dealData?.currency || 'USD';
        const stage = dealData?.stage || 'Unknown';

        return {
          action: `created deal "${dealName}"`,
          description: `${user} created a new deal "${dealName}" worth ${currency} ${amount.toLocaleString()} in ${stage} stage.`
        };

      case 'Update':
        const changedFields = activity.changedFields || [];
        const updatedFields = metadata?.updatedFields || [];
        const updateDealData = activity.newValues;
        const prevDealData = activity.previousValues;
        const updateDealName = updateDealData?.dealName || 'Unnamed Deal';

        if (changedFields.length === 0) {
          return {
            action: `updated deal "${updateDealName}"`,
            description: `${user} made changes to deal "${updateDealName}".`
          };
        }

        // Check for specific field updates using changedFields (what actually changed)
        const hasStageUpdate = changedFields.includes('stage');
        const hasAmountUpdate = changedFields.includes('amount');
        const hasDealNameUpdate = changedFields.includes('dealName');
        const hasCurrencyUpdate = changedFields.includes('currency');

        let specificChanges = [];

        if (hasStageUpdate && updateDealData?.stage && prevDealData?.stage) {
          specificChanges.push(`moved from ${prevDealData.stage} to ${updateDealData.stage} stage`);
        }

        if (hasAmountUpdate && updateDealData?.amount !== prevDealData?.amount) {
          const updateCurrency = updateDealData?.currency || 'USD';
          specificChanges.push(`changed amount to ${updateCurrency} ${updateDealData.amount?.toLocaleString()}`);
        }

        if (hasCurrencyUpdate && updateDealData?.currency !== prevDealData?.currency) {
          specificChanges.push(`changed currency to ${updateDealData.currency}`);
        }

        if (hasDealNameUpdate && updateDealData?.dealName !== prevDealData?.dealName) {
          specificChanges.push(`renamed deal`);
        }

        if (specificChanges.length > 0) {
          return {
            action: `updated deal "${updateDealName}"`,
            description: `${user} ${specificChanges.join(', ')}.`
          };
        }

        // Fallback to generic field list if no specific changes detected
        return {
          action: `updated deal "${updateDealName}"`,
          description: `${user} updated ${changedFields.join(', ')}.`
        };

      case 'Delete':
        const deleteDealData = activity.newValues || activity.previousValues;
        const deleteDealName = deleteDealData?.dealName || 'Unnamed Deal';

        return {
          action: `deleted deal "${deleteDealName}"`,
          description: `${user} deleted the deal "${deleteDealName}".`
        };

      default:
        return {
          action: `${action.toLowerCase()} deal "${deleteDealName}"`,
          description: `${user} performed ${action} on deal "${deleteDealName}".`
        };
    }
  }

  // Generic fallback for non-deal activities
  return {
    action: action.toLowerCase(),
    description: `${user} performed ${action} on ${entityType}.`
  };
}