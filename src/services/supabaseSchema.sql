
-- Supabase Schema for Vitality OS Discover Feed & Gamification

-- 1. Update Profiles Table for Gamification (Streaks & Titles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streak_days int DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date date;

-- 2. Discover Articles Table (The Global Feed)
CREATE TABLE IF NOT EXISTS public.discover_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content_snippet TEXT NOT NULL,
    category TEXT NOT NULL,
    source_illusion TEXT,
    reading_time_mins INT DEFAULT 3,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Discover Comments Table (Threaded Replies)
CREATE TABLE IF NOT EXISTS public.discover_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES public.discover_articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.discover_comments(id) ON DELETE CASCADE, -- For nested threading
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Discover Votes Table (Prevent double-voting on articles or comments)
CREATE TABLE IF NOT EXISTS public.discover_votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES public.discover_articles(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.discover_comments(id) ON DELETE CASCADE,
    vote_type INT NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Ensure a user can only vote once per article or comment
    CONSTRAINT unique_user_article_vote UNIQUE (user_id, article_id),
    CONSTRAINT unique_user_comment_vote UNIQUE (user_id, comment_id),
    -- Ensure a vote belongs to EITHER an article OR a comment, not both
    CONSTRAINT check_vote_target CHECK (
        (article_id IS NOT NULL AND comment_id IS NULL) OR 
        (article_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Policies (RLS)
ALTER TABLE public.discover_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discover_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discover_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can read articles and comments
CREATE POLICY "Enable read access for all users" ON public.discover_articles FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.discover_comments FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.discover_votes FOR SELECT USING (true);

-- Authenticated users can create comments and votes
CREATE POLICY "Enable insert for authenticated users" ON public.discover_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users" ON public.discover_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Edge Functions (Service Role) can insert articles
CREATE POLICY "Enable insert for service role" ON public.discover_articles FOR INSERT TO service_role WITH CHECK (true);
