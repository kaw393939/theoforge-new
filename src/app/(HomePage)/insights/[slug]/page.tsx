import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostData, getAllPostSlugs, getPostsByTag } from '@/lib/posts';
import { PostData } from '@/types/post';
import MarkdownRenderer from '@/components/Common/MarkdownRenderer';
import Image from 'next/image';
// import PodcastMetadata from '@/components/Blog/PodcastMetadata'; // Commented out - Needs relocation/recreation
// import SocialShare from '@/components/Blog/SocialShare';       // Commented out - Needs relocation/recreation
import PageContainer from '@/components/Layout/PageContainer';
import { createMetadataGenerator } from '@/lib/metadataUtils';

// Inline SVG Icons
const ArrowBackSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const HeadphonesSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Use our enhanced metadata generator with dynamic slug parameter
export async function generateMetadata({ params }: { params: { slug: string } }) {
  // Create and use the metadata generator with the blog content type and the current slug
  const metadataGenerator = createMetadataGenerator('blog', params.slug);
  return metadataGenerator();
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPostData(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const getRelatedPosts = async (currentPost: PostData): Promise<PostData[]> => {
    if (!currentPost.tags || currentPost.tags.length === 0) return [];

    const relatedPosts: PostData[] = [];
    const processedSlugs = new Set<string>();
    processedSlugs.add(currentPost.slug);

    for (const tag of currentPost.tags) {
      const postsWithTag = await getPostsByTag(tag);

      for (const related of postsWithTag) {
        if (!processedSlugs.has(related.slug)) {
          relatedPosts.push(related);
          processedSlugs.add(related.slug);

          if (relatedPosts.length >= 3) break;
        }
      }

      if (relatedPosts.length >= 3) break;
    }

    return relatedPosts;
  };

  const relatedPosts = await getRelatedPosts(post);

  const wordCount = post.content.split(/\s+/).length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <PageContainer maxWidth="max-w-screen-lg" className="py-12 md:py-16 bg-white dark:bg-gray-900">
      <div>
        <div className="mb-6">
          <Link
            href="/insights"
            className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowBackSvg />
            Back to All Articles
          </Link>
        </div>

        <article className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-12 shadow-sm">
          {post.image && (
            <div 
              className="relative w-full bg-gray-100 dark:bg-gray-700 overflow-hidden" 
              style={{ height: '31rem', position: 'relative' }}
            >
              <Image src={post.image} alt={post.title} fill priority style={{ objectFit: 'cover', objectPosition: 'center top' }} sizes="(max-width: 960px) 100vw, 960px" />
              {post.isPodcast && (
                <div className="absolute top-4 right-4 z-10 bg-black/70 text-white rounded-full px-3 py-1 flex items-center">
                  <HeadphonesSvg />
                  <span className="text-xs font-medium">
                    Podcast Episode {post.podcastEpisodeNumber}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="p-4 sm:p-8 md:p-10">
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mr-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/insights?tag=${encodeURIComponent(tag)}`}
                        className="inline-block px-2.5 py-0.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center whitespace-nowrap">
                  {formattedDate} • {post.isPodcast ? post.podcastDuration : `${readingTimeMinutes} min read`}
                </span>
              </div>

              <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 text-gray-900 dark:text-gray-100">
                {post.title}
              </h1>

              <div className="flex justify-between items-center flex-wrap gap-4">
                {post.author && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {post.author}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        TheoForge
                      </p>
                    </div>
                  </div>
                )}
                {/* <SocialShare title={post.title} url={`https://theoforge.com/insights/${post.slug}`} description={post.excerpt} hashtags={post.tags} /> */}
              </div>
            </div>

            {post.isPodcast && (
              <div className="bg-muted p-4 rounded border border-border my-6">Podcast Metadata Placeholder (Component commented out)</div>
            )}

            <hr className="my-8 border-gray-200 dark:border-gray-700" />

            <div className="prose prose-lg dark:prose-invert">
              <MarkdownRenderer content={post.content} />
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between flex-wrap gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Related Topics
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {post.tags?.map((tag) => (
                    <Link
                      key={tag}
                      href={`/insights?tag=${encodeURIComponent(tag)}`}
                      className="inline-block px-2.5 py-0.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Share This Article
                </h4>
                {/* <SocialShare title={post.title} url={`https://theoforge.com/insights/${post.slug}`} description={post.excerpt} hashtags={post.tags} /> */}
              </div>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/insights/${relatedPost.slug}`} passHref legacyBehavior>
                  <a className="block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-decoration-none h-full transition shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500">
                    {relatedPost.image && (
                      <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700">
                        <Image src={relatedPost.image} alt={relatedPost.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {new Date(relatedPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <h4 className="text-base font-medium mb-1 leading-snug text-gray-900 dark:text-gray-100">
                        {relatedPost.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
