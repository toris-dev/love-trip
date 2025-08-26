-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create places table
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CAFE', 'FOOD', 'VIEW', 'MUSEUM', 'ETC')),
  rating DECIMAL(2, 1) DEFAULT 0,
  price_level INTEGER DEFAULT 0 CHECK (price_level >= 0 AND price_level <= 4),
  image_url TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel plans table
CREATE TABLE IF NOT EXISTS public.travel_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration TEXT NOT NULL,
  total_budget INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel plan places (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.travel_plan_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  order_in_day INTEGER NOT NULL DEFAULT 1,
  visit_duration INTEGER, -- in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(travel_plan_id, place_id)
);

-- Create budget items table
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('교통비', '숙박비', '식비', '액티비티', '쇼핑', '기타')),
  name TEXT NOT NULL,
  planned_amount INTEGER NOT NULL DEFAULT 0,
  actual_amount INTEGER DEFAULT 0,
  date DATE,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create travel plan routes (for path visualization)
CREATE TABLE IF NOT EXISTS public.travel_plan_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_plan_id UUID NOT NULL REFERENCES public.travel_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL DEFAULT 1,
  route_points JSONB NOT NULL, -- Array of {lat, lng} points
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
