export interface UploadAttachment {
  name: string;
  url: string;
}

export type FormUploadsPayload = {
  galleryFiles: File[];
  attachmentFiles: File[];
  keptGalleryUrls: string[];
  keptAttachments: UploadAttachment[];
};

export interface Service {
  id: string;
  title: string;
  bullets: string[];
  category: string;
  typeCost: string;
  costVal: number;
  status: 'Active' | 'Pending' | 'Ongoing' | 'Completed' | 'Canceled';
  image: string;
  gallery?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logoColor: string;
  logoInitial: string;
  applications: string;
  createdDate: string;
  expiredDate: string;
  status: 'Active' | 'Pending' | 'Draft' | 'Closed' | 'Expired';
}

export interface Project {
  id: string;
  title: string;
  location: string;
  postedTime: string;
  receivedCount: number;
  category: string;
  typeCost: string;
  costVal: number;
  status: 'Active' | 'Pending' | 'Ongoing' | 'Completed' | 'Canceled';
  attachments?: UploadAttachment[];
}
