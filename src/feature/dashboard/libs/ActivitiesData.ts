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
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.charAt(0))}&background=000000&color=ffffff`
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

  // Handle deal-related activities
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
          description: `${user} created a new deal named "${dealName}" worth ${currency} ${amount.toLocaleString()}`
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
          specificChanges.push(`moved stage from ${prevDealData.stage} to ${updateDealData.stage} `);
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
        // Filter out system fields that shouldn't be shown in descriptions
        const userVisibleFields = changedFields.filter((field: string) =>
          !['updatedAt', 'createdAt', 'id', 'updatedBy', 'createdBy'].includes(field)
        );

        return {
          action: `updated deal "${updateDealName}"`,
          description: userVisibleFields.length > 0
            ? `${user} updated ${userVisibleFields.join(', ')}.`
            : `${user} made changes to deal "${updateDealName}".`
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

  // Handle todo-related activities
  if (entityType?.toLowerCase() === 'todo' || entityType?.toLowerCase() === 'todos') {
    switch (action) {
      case 'Create':
        const todoData = activity.newValues;
        const todoTitle = todoData?.taskName || 'Untitled Todo';
        return {
          action: `created task "${todoTitle}"`,
          description: `${user} created a new task "${todoTitle}".`
        };

      case 'Update':
        const todoChangedFields = activity.changedFields || [];
        const todoUpdateData = activity.newValues;
        const prevTodoData = activity.previousValues;
        const todoUpdateTitle = todoUpdateData?.taskName || 'Untitled Task';


        if (todoChangedFields.length === 0) {
          return {
            action: `updated task "${todoUpdateTitle}"`,
            description: `${user} made changes to task "${todoUpdateTitle}".`
          };
        }

        // Check for specific field updates using changedFields (what actually changed)
        const hasStatusUpdate = todoChangedFields.includes('status') || todoChangedFields.includes('isCompleted');
        const hasTitleUpdate = todoChangedFields.includes('title') || todoChangedFields.includes('taskName');
        const hasDescriptionUpdate = todoChangedFields.includes('description') || todoChangedFields.includes('notes');
        const hasPriorityUpdate = todoChangedFields.includes('priority');
        const hasDueDateUpdate = todoChangedFields.includes('dueDate') || todoChangedFields.includes('deadline');

        let specificChanges = [];

        if (hasStatusUpdate && todoUpdateData?.status !== prevTodoData?.status) {
          const newStatus = todoUpdateData?.status ;
          const oldStatus = prevTodoData?.status ;
          specificChanges.push(`changed status from ${oldStatus} to ${newStatus}`);
        }

        if (hasTitleUpdate && todoUpdateData?.taskName !== prevTodoData?.taskName) {
          specificChanges.push(`renamed Task`);
        }

        if (hasDescriptionUpdate && todoUpdateData?.description !== prevTodoData?.description) {
          specificChanges.push(`updated description`);
        }

        if (hasPriorityUpdate && todoUpdateData?.priority !== prevTodoData?.priority) {
          specificChanges.push(`changed priority to ${todoUpdateData?.priority}`);
        }

        if (hasDueDateUpdate && todoUpdateData?.dueDate !== prevTodoData?.dueDate) {
          specificChanges.push(`updated due date`);
        }

        if (specificChanges.length > 0) {
          return {
            action: `updated task "${todoUpdateTitle}"`,
            description: `${user} ${specificChanges.join(', ')}.`
          };
        }

        // Fallback to generic field list if no specific changes detected
        // Filter out system fields that shouldn't be shown in descriptions
        const userVisibleFields = todoChangedFields.filter((field: string) =>
          !['updatedAt', 'createdAt', 'id', 'updatedBy', 'createdBy'].includes(field)
        );

        return {
          action: `updated task "${todoUpdateTitle}"`,
          description: userVisibleFields.length > 0
            ? `${user} updated ${userVisibleFields.join(', ')}.`
            : `${user} made changes to task "${todoUpdateTitle}".`
        };

      case 'Delete':
        const deleteTodoData = activity.newValues || activity.previousValues;
        const deleteTodoTitle = deleteTodoData?.taskName || 'Untitled Todo';

        return {
          action: `deleted task "${deleteTodoTitle}"`,
            description: `${user} deleted the task "${deleteTodoTitle}".`
        };

      default:
        return {
          action: `${action.toLowerCase()} task`,
          description: `${user} performed ${action} on a task.`
        };
    }
  }

  // Handle meeting-related activities
  if (entityType?.toLowerCase() === 'meeting' || entityType?.toLowerCase() === 'meetings') {
    switch (action) {
      case 'Create':
        const meetingData = activity.newValues;
        const meetingTitle = meetingData?.title || 'Untitled Meeting';
        return {
          action: `scheduled meeting "${meetingTitle}"`,
          description: `${user} scheduled a new meeting "${meetingTitle}".`
        };

      case 'Update':
        const meetingChangedFields = activity.changedFields || [];
        const meetingUpdateData = activity.newValues;
        const prevMeetingData = activity.previousValues;
        const meetingUpdateTitle = meetingUpdateData?.title || 'Untitled Meeting';


        if (meetingChangedFields.length === 0) {
          return {
            action: `updated meeting "${meetingUpdateTitle}"`,
            description: `${user} made changes to meeting "${meetingUpdateTitle}".`
          };
        }

        // Check for specific field updates using changedFields (what actually changed)
        const hasTitleUpdate = meetingChangedFields.includes('title') || meetingChangedFields.includes('name');
        const hasDescriptionUpdate = meetingChangedFields.includes('description') || meetingChangedFields.includes('notes');
        const hasDateUpdate = meetingChangedFields.includes('date') || meetingChangedFields.includes('scheduledDate') || meetingChangedFields.includes('startDate');
        const hasTimeUpdate = meetingChangedFields.includes('time') || meetingChangedFields.includes('startTime') || meetingChangedFields.includes('endTime');
        const hasDurationUpdate = meetingChangedFields.includes('duration');
        const hasLocationUpdate = meetingChangedFields.includes('location') || meetingChangedFields.includes('venue');
        const hasAttendeeUpdate = meetingChangedFields.includes('attendees') || meetingChangedFields.includes('participants');

        let specificChanges = [];

        if (hasTitleUpdate && meetingUpdateData?.title !== prevMeetingData?.title) {
          specificChanges.push(`renamed meeting`);
        }

        if (hasDescriptionUpdate && meetingUpdateData?.description !== prevMeetingData?.description) {
          specificChanges.push(`updated description`);
        }

        if (hasDateUpdate && meetingUpdateData?.date !== prevMeetingData?.date) {
          specificChanges.push(`changed date`);
        }

        if (hasTimeUpdate && meetingUpdateData?.time !== prevMeetingData?.time) {
          specificChanges.push(`updated time`);
        }

        if (hasDurationUpdate && meetingUpdateData?.duration !== prevMeetingData?.duration) {
          specificChanges.push(`changed duration`);
        }

        if (hasLocationUpdate && meetingUpdateData?.location !== prevMeetingData?.location) {
          specificChanges.push(`updated location`);
        }

        if (hasAttendeeUpdate && JSON.stringify(meetingUpdateData?.attendees) !== JSON.stringify(prevMeetingData?.attendees)) {
          specificChanges.push(`updated attendees`);
        }

        if (specificChanges.length > 0) {
          return {
            action: `updated meeting "${meetingUpdateTitle}"`,
            description: `${user} ${specificChanges.join(', ')}.`
          };
        }

        // Fallback to generic field list if no specific changes detected
        // Filter out system fields that shouldn't be shown in descriptions
        const userVisibleFields = meetingChangedFields.filter((field: string) =>
          !['updatedAt', 'createdAt', 'id', 'updatedBy', 'createdBy'].includes(field)
        );

        return {
          action: `updated meeting "${meetingUpdateTitle}"`,
          description: userVisibleFields.length > 0
            ? `${user} updated ${userVisibleFields.join(', ')}.`
            : `${user} made changes to meeting "${meetingUpdateTitle}".`
        };

      case 'Delete':
        const deleteMeetingData = activity.newValues || activity.previousValues;
        const deleteMeetingTitle = deleteMeetingData?.title || 'Untitled Meeting';

        return {
          action: `cancelled meeting "${deleteMeetingTitle}"`,
          description: `${user} cancelled the meeting "${deleteMeetingTitle}".`
        };

      default:
        return {
          action: `${action.toLowerCase()} meeting`,
          description: `${user} performed ${action} on a meeting.`
        };
    }
  }

  // Handle prospect-related activities
  if (entityType?.toLowerCase() === 'prospect' || entityType?.toLowerCase() === 'prospects') {
    switch (action) {
      case 'Create':
        const prospectData = activity.newValues;
        const prospectName = prospectData?.fullName || prospectData?.name || 'Unnamed Prospect';
        return {
          action: `added prospect "${prospectName}"`,
          description: `${user} added a new prospect "${prospectName}" to the system.`
        };

      case 'Update':
        const prospectChangedFields = activity.changedFields || [];
        const prospectUpdateData = activity.newValues;
        const prevProspectData = activity.previousValues;
        const prospectUpdateName = prospectUpdateData?.fullName || prospectUpdateData?.name || 'Unnamed Prospect';


        if (prospectChangedFields.length === 0) {
          return {
            action: `updated prospect "${prospectUpdateName}"`,
            description: `${user} made changes to prospect "${prospectUpdateName}".`
          };
        }

        // Check for specific field updates using changedFields (what actually changed)
        const hasNameUpdate = prospectChangedFields.includes('name') || prospectChangedFields.includes('fullName');
        const hasEmailUpdate = prospectChangedFields.includes('email');
        const hasPhoneUpdate = prospectChangedFields.includes('phone') || prospectChangedFields.includes('phoneNumber');
        const hasCompanyUpdate = prospectChangedFields.includes('company') || prospectChangedFields.includes('companyName');
        const hasPositionUpdate = prospectChangedFields.includes('position') || prospectChangedFields.includes('jobTitle');
        const hasStatusUpdate = prospectChangedFields.includes('status') || prospectChangedFields.includes('leadStatus');
        const hasNotesUpdate = prospectChangedFields.includes('notes') || prospectChangedFields.includes('description');
        const hasTagsUpdate = prospectChangedFields.includes('tags');

        let specificChanges = [];

        if (hasNameUpdate && prospectUpdateData?.fullName !== prevProspectData?.fullName) {
          specificChanges.push(`updated name`);
        }

        if (hasEmailUpdate && prospectUpdateData?.email !== prevProspectData?.email) {
          specificChanges.push(`changed email`);
        }

        if (hasPhoneUpdate && prospectUpdateData?.phone !== prevProspectData?.phone) {
          specificChanges.push(`updated phone`);
        }

        if (hasCompanyUpdate && prospectUpdateData?.company !== prevProspectData?.company) {
          specificChanges.push(`changed company`);
        }

        if (hasPositionUpdate && prospectUpdateData?.position !== prevProspectData?.position) {
          specificChanges.push(`updated position`);
        }

        if (hasStatusUpdate && prospectUpdateData?.status !== prevProspectData?.status) {
          specificChanges.push(`changed status to ${prospectUpdateData?.status}`);
        }

        if (hasNotesUpdate && prospectUpdateData?.notes !== prevProspectData?.notes) {
          specificChanges.push(`updated notes`);
        }

        if (hasTagsUpdate && JSON.stringify(prospectUpdateData?.tags) !== JSON.stringify(prevProspectData?.tags)) {
          specificChanges.push(`updated tags`);
        }

        if (specificChanges.length > 0) {
          return {
            action: `updated prospect "${prospectUpdateName}"`,
            description: `${user} ${specificChanges.join(', ')}.`
          };
        }

        // Fallback to generic field list if no specific changes detected
        // Filter out system fields that shouldn't be shown in descriptions
        const userVisibleFields = prospectChangedFields.filter((field: string) =>
          !['updatedAt', 'createdAt', 'id', 'updatedBy', 'createdBy'].includes(field)
        );

        return {
          action: `updated prospect "${prospectUpdateName}"`,
          description: userVisibleFields.length > 0
            ? `${user} updated ${userVisibleFields.join(', ')}.`
            : `${user} made changes to prospect "${prospectUpdateName}".`
        };

      case 'Delete':
        const deleteProspectData = activity.newValues || activity.previousValues;
        const deleteProspectName = deleteProspectData?.fullName || deleteProspectData?.name || 'Unnamed Prospect';

        return {
          action: `removed prospect "${deleteProspectName}"`,
          description: `${user} removed the prospect "${deleteProspectName}" from the system.`
        };

      default:
        return {
          action: `${action.toLowerCase()} prospect`,
          description: `${user} performed ${action} on a prospect.`
        };
    }
  }

  // Handle contact/customer-related activities
  if (entityType?.toLowerCase() === 'contact' || entityType?.toLowerCase() === 'contacts' ||
      entityType?.toLowerCase() === 'customer' || entityType?.toLowerCase() === 'customers') {
    switch (action) {
      case 'Create':
        const contactData = activity.newValues;
        const contactName = contactData?.fullName || contactData?.name || 'Unnamed Contact';
        return {
          action: `added contact "${contactName}"`,
          description: `${user} added a new contact "${contactName}" with full profile details.`
        };

      case 'Update':
        const contactChangedFields = activity.changedFields || [];
        const contactUpdateData = activity.newValues;
        const prevContactData = activity.previousValues;
        const contactUpdateName = contactUpdateData?.fullName || contactUpdateData?.name || 'Unnamed Contact';


        if (contactChangedFields.length === 0) {
          return {
            action: `updated contact "${contactUpdateName}"`,
            description: `${user} made changes to contact "${contactUpdateName}".`
          };
        }

        // Check for specific field updates using changedFields (what actually changed)
        const hasNameUpdate = contactChangedFields.includes('name') || contactChangedFields.includes('fullName');
        const hasEmailUpdate = contactChangedFields.includes('email');
        const hasPhoneUpdate = contactChangedFields.includes('phone') || contactChangedFields.includes('phoneNumber');
        const hasCompanyUpdate = contactChangedFields.includes('company') || contactChangedFields.includes('companyName');
        const hasPositionUpdate = contactChangedFields.includes('position') || contactChangedFields.includes('jobTitle');
        const hasDepartmentUpdate = contactChangedFields.includes('department');
        const hasNotesUpdate = contactChangedFields.includes('notes') || contactChangedFields.includes('description');
        const hasTagsUpdate = contactChangedFields.includes('tags');

        let specificChanges = [];

        if (hasNameUpdate && contactUpdateData?.fullName !== prevContactData?.fullName) {
          specificChanges.push(`updated name`);
        }

        if (hasEmailUpdate && contactUpdateData?.email !== prevContactData?.email) {
          specificChanges.push(`changed email`);
        }

        if (hasPhoneUpdate && contactUpdateData?.phone !== prevContactData?.phone) {
          specificChanges.push(`updated phone`);
        }

        if (hasCompanyUpdate && contactUpdateData?.company !== prevContactData?.company) {
          specificChanges.push(`changed company`);
        }

        if (hasPositionUpdate && contactUpdateData?.position !== prevContactData?.position) {
          specificChanges.push(`updated position`);
        }

        if (hasDepartmentUpdate && contactUpdateData?.department !== prevContactData?.department) {
          specificChanges.push(`changed department`);
        }

        if (hasNotesUpdate && contactUpdateData?.notes !== prevContactData?.notes) {
          specificChanges.push(`updated notes`);
        }

        if (hasTagsUpdate && JSON.stringify(contactUpdateData?.tags) !== JSON.stringify(prevContactData?.tags)) {
          specificChanges.push(`updated tags`);
        }

        if (specificChanges.length > 0) {
          return {
            action: `updated contact "${contactUpdateName}"`,
            description: `${user} ${specificChanges.join(', ')}.`
          };
        }

        // Fallback to generic field list if no specific changes detected
        // Filter out system fields that shouldn't be shown in descriptions
        const userVisibleFields = contactChangedFields.filter((field: string) =>
          !['updatedAt', 'createdAt', 'id', 'updatedBy', 'createdBy'].includes(field)
        );

        return {
          action: `updated contact "${contactUpdateName}"`,
          description: userVisibleFields.length > 0
            ? `${user} updated ${userVisibleFields.join(', ')}.`
            : `${user} made changes to contact "${contactUpdateName}".`
        };

      case 'Delete':
        const deleteContactData = activity.newValues || activity.previousValues;
        const deleteContactName = deleteContactData?.fullName || deleteContactData?.name || 'Unnamed Contact';

        return {
          action: `removed contact "${deleteContactName}"`,
          description: `${user} removed the contact "${deleteContactName}" from the system.`
        };

      default:
        return {
          action: `${action.toLowerCase()} contact`,
          description: `${user} performed ${action} on a contact.`
        };
    }
  }

  // Handle company-related activities
  if (entityType?.toLowerCase() === 'company' || entityType?.toLowerCase() === 'companies') {
    switch (action) {
      case 'Create':
        const companyData = activity.newValues;
        const companyName = companyData?.fullName || companyData?.name || 'Unnamed Company';
        return {
          action: `added company "${companyName}"`,
          description: `${user} added a new company "${companyName}" with industry and contact information.`
        };

      case 'Update':
        const companyChangedFields = activity.changedFields || [];
        const companyUpdateData = activity.newValues;
        const prevCompanyData = activity.previousValues;
        const companyUpdateName = companyUpdateData?.fullName || companyUpdateData?.name || 'Unnamed Company';


        if (companyChangedFields.length === 0) {
          return {
            action: `updated company "${companyUpdateName}"`,
            description: `${user} made changes to company "${companyUpdateName}".`
          };
        }

        // Check for specific field updates using changedFields (what actually changed)
        const hasNameUpdate = companyChangedFields.includes('name') || companyChangedFields.includes('fullName');
        const hasIndustryUpdate = companyChangedFields.includes('industry');
        const hasWebsiteUpdate = companyChangedFields.includes('website');
        const hasEmailUpdate = companyChangedFields.includes('email');
        const hasPhoneUpdate = companyChangedFields.includes('phone') || companyChangedFields.includes('phoneNumber');
        const hasAddressUpdate = companyChangedFields.includes('address');
        const hasStatusUpdate = companyChangedFields.includes('status');
        const hasNotesUpdate = companyChangedFields.includes('notes') || companyChangedFields.includes('description');
        const hasTagsUpdate = companyChangedFields.includes('tags');

        let specificChanges = [];

        if (hasNameUpdate && companyUpdateData?.fullName !== prevCompanyData?.fullName) {
          specificChanges.push(`updated name`);
        }

        if (hasIndustryUpdate && companyUpdateData?.industry !== prevCompanyData?.industry) {
          specificChanges.push(`changed industry`);
        }

        if (hasWebsiteUpdate && companyUpdateData?.website !== prevCompanyData?.website) {
          specificChanges.push(`updated website`);
        }

        if (hasEmailUpdate && companyUpdateData?.email !== prevCompanyData?.email) {
          specificChanges.push(`changed email`);
        }

        if (hasPhoneUpdate && companyUpdateData?.phone !== prevCompanyData?.phone) {
          specificChanges.push(`updated phone`);
        }

        if (hasAddressUpdate && companyUpdateData?.address !== prevCompanyData?.address) {
          specificChanges.push(`updated address`);
        }

        if (hasStatusUpdate && companyUpdateData?.status !== prevCompanyData?.status) {
          specificChanges.push(`changed status to ${companyUpdateData?.status}`);
        }

        if (hasNotesUpdate && companyUpdateData?.notes !== prevCompanyData?.notes) {
          specificChanges.push(`updated notes`);
        }

        if (hasTagsUpdate && JSON.stringify(companyUpdateData?.tags) !== JSON.stringify(prevCompanyData?.tags)) {
          specificChanges.push(`updated tags`);
        }

        if (specificChanges.length > 0) {
          return {
            action: `updated company "${companyUpdateName}"`,
            description: `${user} ${specificChanges.join(', ')}.`
          };
        }

        // Fallback to generic field list if no specific changes detected
        // Filter out system fields that shouldn't be shown in descriptions
        const userVisibleFields = companyChangedFields.filter((field: string) =>
          !['updatedAt', 'createdAt', 'id', 'updatedBy', 'createdBy'].includes(field)
        );

        return {
          action: `updated company "${companyUpdateName}"`,
          description: userVisibleFields.length > 0
            ? `${user} updated ${userVisibleFields.join(', ')}.`
            : `${user} made changes to company "${companyUpdateName}".`
        };

      case 'Delete':
        const deleteCompanyData = activity.newValues || activity.previousValues;
        const deleteCompanyName = deleteCompanyData?.fullName || deleteCompanyData?.name || 'Unnamed Company';

        return {
          action: `removed company "${deleteCompanyName}"`,
          description: `${user} removed the company "${deleteCompanyName}" from the system.`
        };

      default:
        return {
          action: `${action.toLowerCase()} company`,
          description: `${user} performed ${action} on a company.`
        };
    }
  }

  return {
    action: action.toLowerCase(),
    description: `${user} performed ${action} on ${entityType}.`
  };
}