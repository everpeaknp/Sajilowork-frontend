export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  link_url: string;
  published_at: string;
  is_featured: boolean;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  updated_at: string;
}
