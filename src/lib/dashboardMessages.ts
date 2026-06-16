export type DashboardMessagesView = 'employer' | 'tasker';

export function dashboardMessagesViewForRole(
  role: 'customer' | 'tasker',
): DashboardMessagesView {
  return role === 'tasker' ? 'tasker' : 'employer';
}

export function emptyMessagesMessage(view: DashboardMessagesView): string {
  if (view === 'employer') {
    return 'No messages yet. Conversations start after offers are accepted or someone contacts you.';
  }
  return 'No messages yet. Contact a seller from a service page or message from a task, job, or project.';
}

export function otherParticipantRoleLabel(view: DashboardMessagesView): string {
  return view === 'employer' ? 'Freelancer' : 'Employer';
}
