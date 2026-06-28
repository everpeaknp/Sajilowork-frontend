type BlogPostBodyProps = {
  html: string;
};

export default function BlogPostBody({ html }: BlogPostBodyProps) {
  if (!html?.trim()) {
    return (
      <p className="font-body text-base font-medium text-muted-foreground">
        This article has no body content yet.
      </p>
    );
  }

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
