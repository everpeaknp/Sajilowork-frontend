import { DEFAULT_CLOUDINARY_ROOT } from '@/lib/cloudinaryConstants';

export type CloudinaryFolderKey =
  | 'users'
  | 'usersProfiles'
  | 'usersCovers'
  | 'employers'
  | 'tasks'
  | 'services'
  | 'projects'
  | 'jobs'
  | 'uploads'
  | 'chat';

const SUBFOLDERS: Record<CloudinaryFolderKey, string> = {
  users: 'Users',
  usersProfiles: 'Users/Profiles',
  usersCovers: 'Users/Covers',
  employers: 'Employers',
  tasks: 'Tasks',
  services: 'Services',
  projects: 'Projects',
  jobs: 'Jobs',
  uploads: 'Uploads',
  chat: 'Chat',
};

export function joinCloudinaryPath(root: string, ...segments: string[]): string {
  const parts = [
    root.replace(/\/+$/, ''),
    ...segments.map((segment) => segment.replace(/^\/+|\/+$/g, '')),
  ].filter(Boolean);
  return parts.join('/');
}

export async function getCloudinaryRoot(): Promise<string> {
  const { getCloudinaryConfig } = await import('@/services/cloudinary.service');
  const config = await getCloudinaryConfig();
  const root = (config.folder || DEFAULT_CLOUDINARY_ROOT).trim().replace(/\/+$/, '');
  return root || DEFAULT_CLOUDINARY_ROOT;
}

export async function getCloudinaryFolder(
  key: CloudinaryFolderKey,
  ...extra: string[]
): Promise<string> {
  const root = await getCloudinaryRoot();
  return joinCloudinaryPath(root, SUBFOLDERS[key], ...extra);
}
