export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface ChatPreview {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  time: string;
  unread: boolean;
}
