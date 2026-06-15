export type DashboardMessagesView = 'employer' | 'tasker';

export function dashboardMessagesViewForRole(
  role: 'customer' | 'tasker',
): DashboardMessagesView {
  return role === 'tasker' ? 'tasker' : 'employer';
}

export function messagesPageSubtitle(view: DashboardMessagesView): string {
  if (view === 'employer') {
    return 'Messages from freelancers and taskers on your listings.';
  }
  return 'Messages with employers about tasks, jobs, and projects you applied to.';
}

export function emptyMessagesMessage(view: DashboardMessagesView): string {
  if (view === 'employer') {
    return 'No messages from freelancers yet. Conversations start after you accept an offer or proposal.';
  }
  return 'No messages yet. Message an employer from a task, job, or project you applied to.';
}

export function otherParticipantRoleLabel(view: DashboardMessagesView): string {
  return view === 'employer' ? 'Freelancer' : 'Employer';
}
