-- =====================================================
-- SEO & CONTENT TABLES
-- =====================================================

-- BLOG POSTS: Dynamic and Programmatic content
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT,
  author TEXT DEFAULT 'LinkedAI Team',
  image_url TEXT,
  
  -- SEO Metadata
  seo_title TEXT,
  seo_description TEXT,
  keyword TEXT, -- Target SEO keyword
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_programmatic BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRENDING KEYWORDS: Queue for programmatic content generation
CREATE TABLE IF NOT EXISTS public.trending_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'LinkedIn',
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'ignored')),
  relevance_score FLOAT DEFAULT 1.0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_keywords ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage trending keywords" ON public.trending_keywords
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trending_keywords_updated_at BEFORE UPDATE ON public.trending_keywords FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_trending_keywords_status ON public.trending_keywords(status);
