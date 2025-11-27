#!/usr/bin/env python3
"""
시·군·구 단위로 가까운 거리의 데이트 코스를 생성하는 스크립트
DB 레벨에서 실행하여 프론트엔드에서 사용할 수 있도록 함
"""

import os
import sys
from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import math

# Supabase 클라이언트 생성
supabase_url = os.getenv("SUPABASE_URL", "https://dyomownljgsbwaxnljau.supabase.co")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # 서비스 롤 키 필요

if not supabase_key:
    print("ERROR: SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)


def calculate_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine 공식을 사용한 거리 계산 (km)"""
    R = 6371.0  # 지구 반지름 (km)
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def extract_sigungu_name(address: Optional[str]) -> Optional[str]:
    """주소에서 시·군·구 이름 추출"""
    if not address:
        return None
    
    if "구" in address:
        import re
        match = re.search(r"([가-힣]+구)", address)
        if match:
            return match.group(1)
    elif "시" in address and "특별시" not in address:
        import re
        match = re.search(r"([가-힣]+시)", address)
        if match:
            return match.group(1)
    elif "군" in address:
        import re
        match = re.search(r"([가-힣]+군)", address)
        if match:
            return match.group(1)
    
    return None


def get_region_name(area_code: int) -> str:
    """지역 코드로 지역명 반환"""
    region_map = {
        1: "서울", 2: "인천", 3: "대전", 4: "대구", 5: "광주",
        6: "부산", 7: "울산", 8: "세종",
        31: "경기", 32: "강원", 33: "충북", 34: "충남",
        35: "경북", 36: "경남", 37: "전북", 38: "전남", 39: "제주"
    }
    return region_map.get(area_code, "기타")


def generate_date_courses(
    max_distance_km: float = 3.0,
    min_places_per_course: int = 3,
    max_places_per_course: int = 4
) -> int:
    """시·군·구 단위로 데이트 코스 생성"""
    
    # 기존 코스 삭제
    print("기존 데이트 코스 삭제 중...")
    supabase.table("date_course_places").delete().neq("id", "").execute()
    supabase.table("date_courses").delete().neq("id", "").execute()
    
    # 시·군·구별로 그룹화
    print("시·군·구별 장소 조회 중...")
    places_response = supabase.table("places").select(
        "id, name, lat, lng, type, rating, image_url, address, area_code, sigungu_code"
    ).in_("type", ["CAFE", "FOOD", "VIEW"]).not_.is_("lat", "null").not_.is_("lng", "null").not_.is_("area_code", "null").not_.is_("sigungu_code", "null").execute()
    
    places = places_response.data
    
    # 시·군·구별로 그룹화
    sigungu_groups: Dict[tuple, List[Dict]] = {}
    for place in places:
        key = (place["area_code"], place["sigungu_code"])
        if key not in sigungu_groups:
            sigungu_groups[key] = []
        sigungu_groups[key].append(place)
    
    print(f"총 {len(sigungu_groups)}개 시·군·구 발견")
    
    course_count = 0
    used_place_ids = set()
    
    # 각 시·군·구별로 처리
    for (area_code, sigungu_code), sigungu_places in sigungu_groups.items():
        if len(sigungu_places) < min_places_per_course:
            continue
        
        # 평점 순으로 정렬
        sigungu_places.sort(key=lambda x: x.get("rating", 0) or 0, reverse=True)
        
        # 시·군·구 이름 추출
        sigungu_name = None
        for place in sigungu_places:
            sigungu_name = extract_sigungu_name(place.get("address"))
            if sigungu_name:
                break
        
        region_name = get_region_name(area_code)
        
        # 각 장소를 시작점으로 사용하여 코스 생성
        for start_place in sigungu_places[:20]:  # 상위 20개만 사용
            if start_place["id"] in used_place_ids:
                continue
            
            # 새 코스 시작
            selected_places = [start_place]
            total_distance = 0.0
            max_course_distance = 0.0
            current_place = start_place
            
            # 최대 장소 수까지 가까운 장소 찾기
            while len(selected_places) < max_places_per_course:
                nearest_place = None
                nearest_distance = float("inf")
                
                # 가장 가까운 다음 장소 찾기
                for next_place in sigungu_places:
                    if (next_place["id"] in [p["id"] for p in selected_places] or
                        next_place["id"] in used_place_ids):
                        continue
                    
                    distance = calculate_distance_km(
                        current_place["lat"], current_place["lng"],
                        next_place["lat"], next_place["lng"]
                    )
                    
                    if distance <= max_distance_km and distance < nearest_distance:
                        nearest_distance = distance
                        nearest_place = next_place
                
                if nearest_place:
                    selected_places.append(nearest_place)
                    total_distance += nearest_distance
                    max_course_distance = max(max_course_distance, nearest_distance)
                    current_place = nearest_place
                else:
                    break
            
            # 최소 장소 수를 만족하면 코스 저장
            if len(selected_places) >= min_places_per_course:
                # 코스 생성
                course_title = f"{sigungu_name or region_name} 데이트 코스"
                course_data = {
                    "title": course_title,
                    "region": region_name,
                    "sigungu_name": sigungu_name,
                    "area_code": area_code,
                    "sigungu_code": sigungu_code,
                    "course_type": "date",
                    "description": f"{sigungu_name or region_name}의 카페, 맛집, 전망대를 포함한 당일 데이트 코스입니다.",
                    "image_url": start_place.get("image_url"),
                    "place_count": len(selected_places),
                    "duration": "당일 코스",
                    "total_distance_km": round(total_distance, 2),
                    "max_distance_km": round(max_course_distance, 2)
                }
                
                course_response = supabase.table("date_courses").insert(course_data).execute()
                course_id = course_response.data[0]["id"]
                
                # 코스 장소 추가
                for order_idx, place in enumerate(selected_places):
                    prev_distance = 0.0
                    if order_idx > 0:
                        prev_distance = calculate_distance_km(
                            selected_places[order_idx - 1]["lat"],
                            selected_places[order_idx - 1]["lng"],
                            place["lat"],
                            place["lng"]
                        )
                    
                    visit_duration = 60 if place["type"] == "CAFE" else (90 if place["type"] == "FOOD" else 45)
                    
                    supabase.table("date_course_places").insert({
                        "date_course_id": course_id,
                        "place_id": place["id"],
                        "order_index": order_idx,
                        "distance_from_previous_km": round(prev_distance, 2),
                        "visit_duration_minutes": visit_duration
                    }).execute()
                    
                    used_place_ids.add(place["id"])
                
                course_count += 1
                if course_count % 10 == 0:
                    print(f"생성된 코스 수: {course_count}")
    
    return course_count


if __name__ == "__main__":
    print("데이트 코스 생성 시작...")
    count = generate_date_courses(max_distance_km=3.0, min_places_per_course=3, max_places_per_course=4)
    print(f"총 {count}개의 데이트 코스가 생성되었습니다.")

