-- Insert sample places
INSERT INTO public.places (id, name, description, lat, lng, type, rating, price_level, image_url, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', '남산타워', '서울의 랜드마크, 로맨틱한 야경 명소', 37.5512, 126.9882, 'VIEW', 4.5, 2, '/seoul-tower-romantic-night-view.png', '서울특별시 용산구 남산공원길 105'),
('550e8400-e29b-41d4-a716-446655440002', '홍대 카페거리', '트렌디한 카페들이 모인 데이트 코스', 37.5563, 126.9236, 'CAFE', 4.3, 1, '/hongdae-cafe-street-couples.png', '서울특별시 마포구 홍익로'),
('550e8400-e29b-41d4-a716-446655440003', '한강공원', '피크닉과 산책을 즐길 수 있는 힐링 공간', 37.5326, 126.9619, 'VIEW', 4.4, 0, '/han-river-park-picnic-couples.png', '서울특별시 영등포구 여의도동'),
('550e8400-e29b-41d4-a716-446655440004', '경복궁', '조선왕조의 역사가 살아있는 궁궐', 37.5796, 126.9770, 'MUSEUM', 4.6, 1, '/placeholder.svg?height=200&width=300', '서울특별시 종로구 사직로 161'),
('550e8400-e29b-41d4-a716-446655440005', '명동성당', '고딕양식의 아름다운 성당', 37.5633, 126.9870, 'VIEW', 4.2, 0, '/placeholder.svg?height=200&width=300', '서울특별시 중구 명동길 74'),
('550e8400-e29b-41d4-a716-446655440006', '이태원 맛집거리', '세계 각국의 음식을 맛볼 수 있는 거리', 37.5349, 126.9947, 'FOOD', 4.1, 2, '/placeholder.svg?height=200&width=300', '서울특별시 용산구 이태원로'),
('550e8400-e29b-41d4-a716-446655440007', '북촌한옥마을', '전통 한옥이 보존된 아름다운 마을', 37.5814, 126.9849, 'VIEW', 4.3, 0, '/placeholder.svg?height=200&width=300', '서울특별시 종로구 계동길'),
('550e8400-e29b-41d4-a716-446655440008', '동대문 디자인 플라자', '현대적인 건축미가 돋보이는 복합문화공간', 37.5665, 127.0092, 'MUSEUM', 4.0, 1, '/placeholder.svg?height=200&width=300', '서울특별시 중구 을지로 281'),
('550e8400-e29b-41d4-a716-446655440009', '가로수길', '트렌디한 쇼핑과 카페가 있는 거리', 37.5208, 127.0230, 'CAFE', 4.2, 2, '/placeholder.svg?height=200&width=300', '서울특별시 강남구 신사동'),
('550e8400-e29b-41d4-a716-446655440010', '반포 한강공원', '무지개분수와 야경이 아름다운 공원', 37.5133, 126.9965, 'VIEW', 4.5, 0, '/placeholder.svg?height=200&width=300', '서울특별시 서초구 반포동');

-- Note: Sample travel plans and budget items will be created when users sign up and use the app
-- This ensures proper user_id association and RLS compliance
