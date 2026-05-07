-- =============================================
-- LBNK48 Sisaster Sites - Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- POINT CATEGORIES TABLE
-- =============================================
CREATE TABLE public.point_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_th TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#pink',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.point_categories (name, name_th, icon, color) VALUES
  ('donation', 'โดเนท', '💝', '#ec4899'),
  ('activity', 'เล่นกิจกรรม', '🎮', '#8b5cf6'),
  ('event', 'เข้าร่วม Event', '🎪', '#f59e0b'),
  ('social', 'โซเชียลมีเดีย', '📱', '#06b6d4'),
  ('purchase', 'ซื้อสินค้า', '🛍️', '#10b981'),
  ('bonus', 'โบนัสพิเศษ', '⭐', '#f97316');

-- =============================================
-- POINT TRANSACTIONS TABLE
-- =============================================
CREATE TABLE public.point_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.point_categories(id),
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  description_th TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.point_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can insert transactions" ON public.point_transactions
  FOR INSERT WITH CHECK (true);

-- =============================================
-- MEMBERS TABLE (LBNK48 Members)
-- =============================================
CREATE TABLE public.members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  nickname_th TEXT,
  generation INTEGER NOT NULL,
  team TEXT,
  birthday DATE,
  birthplace TEXT,
  height_cm INTEGER,
  bio TEXT,
  bio_th TEXT,
  image_url TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  join_date DATE,
  graduate_date DATE,
  instagram TEXT,
  twitter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members are viewable by everyone" ON public.members
  FOR SELECT USING (true);

-- Insert LBNK48 Members (Generation 1 - Sisaster Team)
INSERT INTO public.members (name, nickname, nickname_th, generation, team, birthday, birthplace, height_cm, bio_th, color, is_active, join_date) VALUES
  ('Napassorn Sutthiporn', 'Faii', 'ฝาย', 1, 'Sisaster', '2003-05-15', 'กรุงเทพฯ', 162, 'ฝายเป็น Center หลักของ LBNK48 รุ่น 1 มีพลังงานสูงและรักการเต้น', '#FF69B4', true, '2022-01-01'),
  ('Pimchanok Rattanasak', 'Mook', 'หมูก', 1, 'Sisaster', '2003-08-22', 'เชียงใหม่', 158, 'หมูกเป็น Main Vocal ของทีม มีเสียงร้องที่ทรงพลัง', '#FF1493', true, '2022-01-01'),
  ('Apinya Wongthong', 'Ning', 'หนิง', 1, 'Sisaster', '2002-11-05', 'ขอนแก่น', 165, 'หนิงรักการแต่งตัวและแฟชั่น เป็น Visual หลักของกลุ่ม', '#DB7093', true, '2022-01-01'),
  ('Siriporn Kaewmanee', 'Palm', 'ปาล์ม', 1, 'Sisaster', '2004-02-14', 'นครราชสีมา', 160, 'ปาล์มเป็น Main Dancer มีความสามารถด้านการเต้นเป็นพิเศษ', '#C71585', true, '2022-01-01'),
  ('Chanathip Phongpan', 'Mint', 'มิ้นต์', 1, 'Sisaster', '2003-07-30', 'สมุทรปราการ', 163, 'มิ้นต์รักดนตรีและเล่นกีตาร์ได้เป็นอย่างดี', '#FF6EB4', true, '2022-01-01'),
  ('Rattikan Sombun', 'Beam', 'บีม', 1, 'Sisaster', '2002-12-25', 'ภูเก็ต', 167, 'บีมเป็นคนสดใสร่าเริง เป็น MC ของทีม', '#FF00FF', true, '2022-01-01'),
  ('Nanthicha Thongpan', 'Nook', 'นุ๊ก', 1, 'Sisaster', '2004-04-10', 'กรุงเทพฯ', 156, 'นุ๊กเป็นน้องเล็กของทีม มีความน่ารักและขี้อ้อน', '#FF69B4', true, '2022-01-01'),
  ('Supaporn Jaidee', 'Pam', 'แพม', 1, 'Sisaster', '2003-09-18', 'อุดรธานี', 161, 'แพมรักการอ่านหนังสือและเป็น Mood Maker ของกลุ่ม', '#FF1493', true, '2022-01-01');

-- =============================================
-- TIMELINE / HISTORY TABLE
-- =============================================
CREATE TABLE public.timeline_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  title_th TEXT NOT NULL,
  description TEXT,
  description_th TEXT,
  event_date DATE NOT NULL,
  event_type TEXT DEFAULT 'milestone',
  image_url TEXT,
  is_major BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timeline events are viewable by everyone" ON public.timeline_events
  FOR SELECT USING (true);

INSERT INTO public.timeline_events (title, title_th, description_th, event_date, event_type, is_major) VALUES
  ('LBNK48 Established', 'ก่อตั้ง LBNK48', 'LBNK48 ก่อตั้งขึ้นอย่างเป็นทางการ ภายใต้สังกัด BNK48 Family', '2022-01-01', 'milestone', true),
  ('Generation 1 Audition', 'ออดิชั่นรุ่น 1', 'เปิดออดิชั่นสมาชิกรุ่นที่ 1 ได้รับความสนใจจากผู้สมัครกว่า 500 คน', '2022-02-15', 'audition', true),
  ('Sisaster Team Formation', 'ก่อตั้งทีม Sisaster', 'ประกาศสมาชิก 8 คนแรก ก่อตั้ง Sisaster Team อย่างเป็นทางการ', '2022-03-01', 'team', true),
  ('First Single Release', 'ปล่อยซิงเกิลแรก', 'ปล่อยซิงเกิลแรก "Love Trip" ได้รับการตอบรับอย่างดีจากแฟนๆ', '2022-06-15', 'music', true),
  ('First Concert', 'คอนเสิร์ตครั้งแรก', 'จัด Mini Concert ครั้งแรก มีแฟนๆ เข้าร่วมกว่า 1,000 คน', '2022-09-20', 'concert', true),
  ('Handshake Event #1', 'จับมือ Event ครั้งที่ 1', 'จัด Handshake Event ครั้งแรก ณ ศูนย์การค้าสยามพารากอน', '2022-10-08', 'event', false),
  ('2nd Anniversary', 'ครบรอบ 2 ปี', 'เฉลิมฉลองครบรอบ 2 ปีของ LBNK48 พร้อมประกาศแผนงานในอนาคต', '2024-01-01', 'anniversary', true),
  ('New Single "Sisaster Love"', 'ซิงเกิลใหม่ Sisaster Love', 'ปล่อยซิงเกิล "Sisaster Love" ซึ่งแต่งโดยสมาชิกเอง', '2024-03-14', 'music', true);

-- =============================================
-- FUNCTION: Auto-update total_points
-- =============================================
CREATE OR REPLACE FUNCTION update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET total_points = (
    SELECT COALESCE(SUM(points), 0)
    FROM public.point_transactions
    WHERE user_id = NEW.user_id
  ),
  updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_point_transaction_insert
  AFTER INSERT ON public.point_transactions
  FOR EACH ROW EXECUTE FUNCTION update_user_total_points();

-- =============================================
-- FUNCTION: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
