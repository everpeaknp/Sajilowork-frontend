/**
 * Services Index
 * 
 * Central export point for all API services
 */

export { authService } from './auth.service';
export { userService } from './user.service';
export { taskService } from './task.service';
export { bookmarkService } from './bookmark.service';
export { serviceService } from './service.service';
export { bidService } from './bid.service';
export { paymentService } from './payment.service';
export { notificationService } from './notification.service';
export { reviewService } from './review.service';
export { chatService } from './chat.service';
export { categoryService } from './category.service';
export { skillService } from './skill.service';
export { searchService } from './search.service';
export { blogService } from './blog.service';
export { faqService } from './faq.service';
export { rulesService } from './rules.service';
export { walletService } from './wallet.service';
export { disputeService } from './dispute.service';
export { uploadService } from './upload.service';
export { cloudinaryService } from './cloudinary.service';
export { mediaUploadService } from './mediaUpload.service';
export { locationService } from './location.service';
export { employerService } from './employer.service';
export { freelancerService } from './freelancer.service';

// Re-export API client and token manager for direct access
export { apiClient, tokenManager } from '@/lib/api/client';
