type BlogPostBodyProps = {
  html: string;
};

export default function BlogPostBody({ html }: BlogPostBodyProps) {
  if (!html?.trim()) {
    return (
      <p className="text-[#384179] font-medium">This article has no body content yet.</p>
    );
  }

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
