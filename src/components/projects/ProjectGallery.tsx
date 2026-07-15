'use client';

import ServiceGallery from '@/components/services/ServiceGallery';
import {
  getProjectDocumentAttachments,
  getProjectGalleryImages,
  type Project,
} from './projectListData';

interface ProjectGalleryProps {
  project: Project;
}

export default function ProjectGallery({ project }: ProjectGalleryProps) {
  const images = getProjectGalleryImages(project);

  if (images.length === 0) {
    return null;
  }

  const hasDocuments = getProjectDocumentAttachments(project).length > 0;

  return (
    <div
      className={
        hasDocuments
          ? 'mt-8'
          : 'mt-12 border-t border-neutral-200 pt-10 dark:border-neutral-800'
      }
      id="project-gallery"
    >
      <ServiceGallery images={images} altPrefix={project.title} />
    </div>
  );
}
