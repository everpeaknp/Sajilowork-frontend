import DOMPurify from 'isomorphic-dompurify';

type BlogPostBodyProps = {
  html: string;
};

export default function BlogPostBody({ html }: BlogPostBodyProps) {
  if (!html?.trim()) {
    return (
      <p className="font-body text-base font-medium text-muted-foreground dark:text-neutral-400">
        This article has no body content yet.
      </p>
    );
  }

  const safeHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
