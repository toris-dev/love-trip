-- 기념일 알림 테이블 (푸시 알림 연동)
CREATE TABLE IF NOT EXISTS public.anniversary_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  event_date date NOT NULL,
  remind_days_before integer NOT NULL DEFAULT 0,
  last_notified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_anniversary_reminders_user_id ON public.anniversary_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_anniversary_reminders_event_date ON public.anniversary_reminders(event_date);

ALTER TABLE public.anniversary_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own anniversary reminders"
  ON public.anniversary_reminders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.anniversary_reminders IS '기념일 알림 (푸시 알림 발송용)';
