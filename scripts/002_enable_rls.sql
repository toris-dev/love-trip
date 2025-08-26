-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plan_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plan_routes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Places policies (public read, authenticated users can contribute)
CREATE POLICY "Anyone can view places" ON public.places
  FOR SELECT TO authenticated, anon;

CREATE POLICY "Authenticated users can insert places" ON public.places
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update places" ON public.places
  FOR UPDATE TO authenticated USING (true);

-- Travel plans policies
CREATE POLICY "Users can view their own travel plans" ON public.travel_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own travel plans" ON public.travel_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel plans" ON public.travel_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel plans" ON public.travel_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Travel plan places policies
CREATE POLICY "Users can view their travel plan places" ON public.travel_plan_places
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their travel plan places" ON public.travel_plan_places
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their travel plan places" ON public.travel_plan_places
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their travel plan places" ON public.travel_plan_places
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

-- Budget items policies
CREATE POLICY "Users can view their budget items" ON public.budget_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their budget items" ON public.budget_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their budget items" ON public.budget_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their budget items" ON public.budget_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

-- Travel plan routes policies
CREATE POLICY "Users can view their travel plan routes" ON public.travel_plan_routes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their travel plan routes" ON public.travel_plan_routes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their travel plan routes" ON public.travel_plan_routes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their travel plan routes" ON public.travel_plan_routes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.travel_plans 
      WHERE id = travel_plan_id AND user_id = auth.uid()
    )
  );
