#!/usr/bin/env python3
"""
데이트 코스 생성 스크립트
Supabase DB의 places 데이터를 기반으로 거리 계산을 통해 데이트 코스를 생성합니다.
"""

import os
import math
import random
from supabase import create_client, Client
from typing import List, Dict, Any

# 환경 변수에서 설정 가져오기
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "https://dyomownljgsbwaxnljau.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY:
    print("오류: SUPABASE_SERVICE_ROLE_KEY 환경 변수가 필요합니다.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 지역 코드 매핑
AREA_CODE_MAP = {
    1: "서울", 2: "인천", 3: "대전", 4: "대구", 5: "광주",
    6: "부산", 7: "울산", 8: "세종", 31: "경기", 32: "강원",
    33: "충북", 34: "충남", 35: "경북", 36: "경남",
    37: "전북", 38: "전남", 39: "제주"
}

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """두 지점 간의 거리를 계산 (Haversine 공식) - km 단위"""
    R = 6371  # 지구 반경 (km)
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
        math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def filter_date_places(places: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """데이트 코스에 적합한 장소 필터링"""
    filtered = []
    for place in places:
        course_type = place.get("course_type", [])
        place_type = place.get("type", "")
        rating = float(place.get("rating", 0) or 0)
        
        # course_type에 'date'가 포함되어 있거나
        # CAFE, FOOD 타입이거나
        # MUSEUM 타입이면서 평점이 4.0 이상인 경우
        if (
            (course_type and "date" in course_type) or
            place_type == "CAFE" or
            place_type == "FOOD" or
            (place_type == "MUSEUM" and rating >= 4.0)
        ):
            filtered.append(place)
    return filtered

def create_optimal_route(places: List[Dict[str, Any]], max_distance: float = 5.0) -> List[Dict[str, Any]]:
    """거리 기반으로 최적의 코스 경로 생성 (Nearest Neighbor 알고리즘)"""
    if not places:
        return []
    
    route = []
    visited = set()
    
    # 시작점 선택 (평점 높은 순)
    current_place = max(places, key=lambda p: float(p.get("rating", 0) or 0))
    route.append(current_place)
    visited.add(current_place["id"])
    
    # 최대 10개까지 추가
    while len(route) < min(10, len(places)):
        nearest_place = None
        nearest_distance = float("inf")
        
        for place in places:
            if place["id"] in visited:
                continue
            
            distance = calculate_distance(
                float(current_place["lat"]),
                float(current_place["lng"]),
                float(place["lat"]),
                float(place["lng"])
            )
            
            if distance < nearest_distance and distance <= max_distance:
                nearest_distance = distance
                nearest_place = place
        
        if not nearest_place:
            break
        
        route.append(nearest_place)
        visited.add(nearest_place["id"])
        current_place = nearest_place
    
    return route

def generate_date_courses():
    """지역별 데이트 코스 생성"""
    print("데이트 코스 생성 시작...")
    
    # 모든 places 조회
    response = supabase.table("places").select(
        "id, name, lat, lng, type, rating, price_level, address, "
        "area_code, sigungu_code, course_type, image_url"
    ).not_.is_("lat", "null").not_.is_("lng", "null").order("area_code").order("sigungu_code").order("rating", desc=True).limit(10000).execute()
    
    if not response.data:
        print("오류: Places 데이터를 조회할 수 없습니다.")
        return
    
    places = response.data
    print(f"총 {len(places)}개의 장소를 조회했습니다.")
    
    # 데이트 코스에 적합한 장소 필터링
    date_places = filter_date_places(places)
    print(f"데이트 코스에 적합한 장소: {len(date_places)}개")
    
    # 지역별로 그룹화
    places_by_region: Dict[str, List[Dict[str, Any]]] = {}
    for place in date_places:
        area_code = place.get("area_code")
        if not area_code:
            continue
        region = AREA_CODE_MAP.get(area_code, "기타")
        if region not in places_by_region:
            places_by_region[region] = []
        places_by_region[region].append(place)
    
    print(f"\n지역별 장소 수:")
    for region, region_places in places_by_region.items():
        print(f"  {region}: {len(region_places)}개")
    
    # 지역별로 코스 생성
    courses_created = 0
    
    for region, region_places in places_by_region.items():
        if len(region_places) < 3:
            print(f"\n{region}: 장소가 너무 적어 코스를 생성하지 않습니다. ({len(region_places)}개)")
            continue
        
        # 시군구별로 세분화
        places_by_sigungu: Dict[int, List[Dict[str, Any]]] = {}
        for place in region_places:
            sigungu = place.get("sigungu_code") or 0
            if sigungu not in places_by_sigungu:
                places_by_sigungu[sigungu] = []
            places_by_sigungu[sigungu].append(place)
        
        course_count = 0
        for sigungu, sigungu_places in places_by_sigungu.items():
            if len(sigungu_places) < 3:
                continue
            
            # 거리 기반으로 최적 경로 생성
            route = create_optimal_route(sigungu_places, max_distance=5.0)
            
            if len(route) >= 3:
                course_count += 1
                course_title = f"{region} 데이트 코스 {course_count}"
                
                try:
                    # 코스 생성
                    course_data = {
                        "title": course_title,
                        "region": region,
                        "course_type": "date",
                        "description": f"{region}의 다양한 데이트 장소를 포함한 코스입니다. 카페, 맛집, 문화시설 등이 포함되어 있습니다.",
                        "image_url": route[0].get("image_url"),
                        "place_count": len(route),
                        "area_code": region_places[0].get("area_code"),
                        "sigungu_code": sigungu
                    }
                    
                    course_result = supabase.table("courses").insert(course_data).execute()
                    course_id = course_result.data[0]["id"]
                    
                    # 코스에 장소 연결
                    course_places_data = [
                        {
                            "course_id": course_id,
                            "place_id": place["id"],
                            "order_index": idx
                        }
                        for idx, place in enumerate(route)
                    ]
                    
                    supabase.table("course_places").insert(course_places_data).execute()
                    
                    print(f"✓ {course_title} 생성 완료 ({len(route)}개 장소)")
                    courses_created += 1
                except Exception as e:
                    print(f"✗ {course_title} 생성 실패: {e}")
        
        if course_count == 0:
            print(f"\n{region}: 코스를 생성할 수 있는 충분한 장소가 없습니다.")
    
    print(f"\n총 {courses_created}개의 데이트 코스를 생성했습니다.")
    print("데이트 코스 생성 완료!")

if __name__ == "__main__":
    generate_date_courses()

