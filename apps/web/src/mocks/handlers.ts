import { http, HttpResponse } from "msw"

// Supabase REST API 모킹
// 환경 변수에서 가져오거나 기본값 사용
const SUPABASE_URL =
  typeof window !== "undefined"
    ? (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://dyomownljgsbwaxnljau.supabase.co"
    : process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dyomownljgsbwaxnljau.supabase.co"
const SUPABASE_REST_URL = `${SUPABASE_URL}/rest/v1`

// 지역별 코스 요약 정보 타입
type CourseSummary = {
  id: string
  title: string
  region: string
  course_type: "travel" | "date"
  description: string
  image_url: string
  place_count: number
}

// 데이트 코스 정의 (지역별 코스 요약)
const dateCourseSummaries: CourseSummary[] = [
  {
    id: "date-seoul",
    title: "서울 데이트 코스",
    region: "서울",
    course_type: "date",
    description: "서울의 다양한 데이트 장소를 포함한 코스입니다. 카페, 맛집, 전망대 등이 포함되어 있습니다.",
    image_url: "https://picsum.photos/seed/seoul-date/800/600",
    place_count: 12,
  },
  {
    id: "date-jeonju",
    title: "전주 데이트 코스",
    region: "전주",
    course_type: "date",
    description: "전주 한옥마을과 전통 문화를 즐길 수 있는 데이트 코스입니다.",
    image_url: "https://picsum.photos/seed/jeonju-date/800/600",
    place_count: 3,
  },
]

// 여행 코스 정의 (지역별 코스 요약)
const travelCourseSummaries: CourseSummary[] = [
  {
    id: "travel-jeju",
    title: "제주도 여행 코스",
    region: "제주도",
    course_type: "travel",
    description: "제주도의 대표 관광지를 포함한 여행 코스입니다. 성산일출봉, 한라산 등이 포함되어 있습니다.",
    image_url: "https://picsum.photos/seed/jeju-travel/800/600",
    place_count: 4,
  },
  {
    id: "travel-gangwon",
    title: "강원도 여행 코스",
    region: "강원도",
    course_type: "travel",
    description: "강원도의 자연과 레포츠를 즐길 수 있는 여행 코스입니다.",
    image_url: "https://picsum.photos/seed/gangwon-travel/800/600",
    place_count: 3,
  },
  {
    id: "travel-busan",
    title: "부산 여행 코스",
    region: "부산",
    course_type: "travel",
    description: "부산의 해안과 문화를 즐길 수 있는 여행 코스입니다.",
    image_url: "https://picsum.photos/seed/busan-travel/800/600",
    place_count: 3,
  },
]

// 데이트 코스 정의 (코스 제목과 해당 장소들) - 기존 데이터 유지
const dateCourses = [
  {
    id: "date-course-seongsu",
    title: "성수동 데이트",
    region: "서울",
    places: [
      {
        id: "date-seongsu-1",
        name: "성수동 카페거리",
        description: "트렌디한 카페들이 모여있는 성수동의 대표 거리",
        lat: 37.545,
        lng: 127.043,
        type: "CAFE" as const,
        rating: 4.5,
        price_level: 2,
        image_url: "https://picsum.photos/seed/seongsu-cafe/800/600",
        address: "서울특별시 성동구 성수동",
        phone: "02-1234-5678",
        website: "https://example-seongsu-1.com",
      },
      {
        id: "date-seongsu-2",
        name: "성수동 맛집 골목",
        description: "로컬 맛집들이 모여있는 성수동의 숨은 맛집 거리",
        lat: 37.547,
        lng: 127.045,
        type: "FOOD" as const,
        rating: 4.3,
        price_level: 2,
        image_url: "https://picsum.photos/seed/seongsu-food/800/600",
        address: "서울특별시 성동구 성수동",
        phone: "02-1234-5679",
        website: "https://example-seongsu-2.com",
      },
      {
        id: "date-seongsu-3",
        name: "뚝섬한강공원",
        description: "성수동 근처 한강공원에서 즐기는 피크닉",
        lat: 37.527,
        lng: 127.047,
        type: "VIEW" as const,
        rating: 4.6,
        price_level: 1,
        image_url: "https://picsum.photos/seed/seongsu-park/800/600",
        address: "서울특별시 광진구 뚝섬로",
        phone: "02-1234-5680",
        website: "https://example-seongsu-3.com",
      },
    ],
  },
  {
    id: "date-course-hangang",
    title: "한강 데이트",
    region: "서울",
    places: [
      {
        id: "date-hangang-1",
        name: "한강공원 반포지구",
        description: "한강을 따라 산책하며 피크닉을 즐길 수 있는 로맨틱한 장소",
        lat: 37.519,
        lng: 126.998,
        type: "VIEW" as const,
        rating: 4.7,
        price_level: 1,
        image_url: "https://picsum.photos/seed/hangang-banpo/800/600",
        address: "서울특별시 서초구 반포동",
        phone: "02-1234-5681",
        website: "https://example-hangang-1.com",
      },
      {
        id: "date-hangang-2",
        name: "여의도한강공원",
        description: "넓은 공원과 한강 전망을 즐길 수 있는 곳",
        lat: 37.527,
        lng: 126.934,
        type: "VIEW" as const,
        rating: 4.5,
        price_level: 1,
        image_url: "https://picsum.photos/seed/hangang-yeouido/800/600",
        address: "서울특별시 영등포구 여의도동",
        phone: "02-1234-5682",
        website: "https://example-hangang-2.com",
      },
      {
        id: "date-hangang-3",
        name: "한강공원 뚝섬지구",
        description: "한강을 따라 자전거와 산책을 즐길 수 있는 공원",
        lat: 37.527,
        lng: 127.047,
        type: "VIEW" as const,
        rating: 4.4,
        price_level: 1,
        image_url: "https://picsum.photos/seed/hangang-ttukseom/800/600",
        address: "서울특별시 광진구 뚝섬로",
        phone: "02-1234-5683",
        website: "https://example-hangang-3.com",
      },
      {
        id: "date-hangang-4",
        name: "한강 카페",
        description: "한강을 보며 즐기는 로맨틱한 카페 타임",
        lat: 37.525,
        lng: 127.001,
        type: "CAFE" as const,
        rating: 4.6,
        price_level: 2,
        image_url: "https://picsum.photos/seed/hangang-cafe/800/600",
        address: "서울특별시 서초구 반포동",
        phone: "02-1234-5684",
        website: "https://example-hangang-4.com",
      },
    ],
  },
  {
    id: "date-course-jeonju",
    title: "전주 데이트",
    region: "전주",
    places: [
      {
        id: "date-jeonju-1",
        name: "전주 한옥마을",
        description: "전통 한옥의 아름다움을 느낄 수 있는 문화 마을",
        lat: 35.815,
        lng: 127.153,
        type: "VIEW" as const,
        rating: 4.6,
        price_level: 1,
        image_url: "https://picsum.photos/seed/jeonju-hanok/800/600",
        address: "전라북도 전주시 완산구",
        phone: "063-123-4567",
        website: "https://example-jeonju-1.com",
      },
      {
        id: "date-jeonju-2",
        name: "전주 전동성당",
        description: "아름다운 로마네스크 양식의 성당 건축물",
        lat: 35.817,
        lng: 127.155,
        type: "MUSEUM" as const,
        rating: 4.5,
        price_level: 1,
        image_url: "https://picsum.photos/seed/jeonju-church/800/600",
        address: "전라북도 전주시 완산구",
        phone: "063-123-4568",
        website: "https://example-jeonju-2.com",
      },
      {
        id: "date-jeonju-3",
        name: "전주 맛집 거리",
        description: "전주 비빔밥과 한정식 맛집이 모여있는 거리",
        lat: 35.816,
        lng: 127.154,
        type: "FOOD" as const,
        rating: 4.7,
        price_level: 2,
        image_url: "https://picsum.photos/seed/jeonju-food/800/600",
        address: "전라북도 전주시 완산구",
        phone: "063-123-4569",
        website: "https://example-jeonju-3.com",
      },
    ],
  },
  {
    id: "date-course-gangnam",
    title: "강남 데이트",
    region: "서울",
    places: [
      {
        id: "date-gangnam-1",
        name: "강남역 카페거리",
        description: "트렌디한 쇼핑과 맛집이 가득한 상권",
        lat: 37.498,
        lng: 127.028,
        type: "CAFE" as const,
        rating: 4.4,
        price_level: 3,
        image_url: "https://picsum.photos/seed/gangnam-cafe/800/600",
        address: "서울특별시 강남구 강남대로",
        phone: "02-1234-5690",
        website: "https://example-gangnam-1.com",
      },
      {
        id: "date-gangnam-2",
        name: "압구정로데오거리",
        description: "고급스러운 쇼핑과 카페 문화를 즐길 수 있는 거리",
        lat: 37.527,
        lng: 127.040,
        type: "CAFE" as const,
        rating: 4.5,
        price_level: 3,
        image_url: "https://picsum.photos/seed/gangnam-apgujeong/800/600",
        address: "서울특별시 강남구 압구정로",
        phone: "02-1234-5691",
        website: "https://example-gangnam-2.com",
      },
      {
        id: "date-gangnam-3",
        name: "코엑스",
        description: "전시와 쇼핑을 함께 즐길 수 있는 복합 문화 공간",
        lat: 37.512,
        lng: 127.059,
        type: "VIEW" as const,
        rating: 4.3,
        price_level: 2,
        image_url: "https://picsum.photos/seed/gangnam-coex/800/600",
        address: "서울특별시 강남구 영동대로",
        phone: "02-1234-5692",
        website: "https://example-gangnam-3.com",
      },
    ],
  },
  {
    id: "date-course-hongdae",
    title: "홍대 데이트",
    region: "서울",
    places: [
      {
        id: "date-hongdae-1",
        name: "홍대거리",
        description: "젊은 감성과 문화가 살아있는 거리",
        lat: 37.557,
        lng: 126.924,
        type: "VIEW" as const,
        rating: 4.4,
        price_level: 2,
        image_url: "https://picsum.photos/seed/hongdae-street/800/600",
        address: "서울특별시 마포구 홍익로",
        phone: "02-1234-5693",
        website: "https://example-hongdae-1.com",
      },
      {
        id: "date-hongdae-2",
        name: "홍대 카페거리",
        description: "독특한 컨셉의 카페들이 모여있는 거리",
        lat: 37.556,
        lng: 126.925,
        type: "CAFE" as const,
        rating: 4.5,
        price_level: 2,
        image_url: "https://picsum.photos/seed/hongdae-cafe/800/600",
        address: "서울특별시 마포구 홍익로",
        phone: "02-1234-5694",
        website: "https://example-hongdae-2.com",
      },
      {
        id: "date-hongdae-3",
        name: "홍대 맛집 골목",
        description: "다양한 음식이 모여있는 홍대의 맛집 거리",
        lat: 37.558,
        lng: 126.923,
        type: "FOOD" as const,
        rating: 4.3,
        price_level: 2,
        image_url: "https://picsum.photos/seed/hongdae-food/800/600",
        address: "서울특별시 마포구 홍익로",
        phone: "02-1234-5695",
        website: "https://example-hongdae-3.com",
      },
    ],
  },
]

// 데이트 코스의 모든 장소를 평탄화 (API 호환성을 위해)
const dateCoursePlaces = dateCourses.flatMap(course => 
  course.places.map(place => ({
    ...place,
    course_id: course.id,
    course_title: course.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
)

// 여행 코스 정의 (코스 제목과 해당 장소들)
const travelCourses = [
  {
    id: "travel-course-jeju",
    title: "제주도 여행",
    region: "제주도",
    places: [
      {
        id: "travel-jeju-1",
        name: "제주도 성산일출봉",
        description: "제주도의 대표적인 일출 명소로 로맨틱한 일출을 감상할 수 있는 곳",
        lat: 33.458,
        lng: 126.942,
        type: "VIEW" as const,
        rating: 4.8,
        price_level: 1,
        image_url: "https://picsum.photos/seed/jeju-sunrise/800/600",
        address: "제주특별자치도 서귀포시 성산읍",
        phone: "064-123-4567",
        website: "https://example-jeju-travel-1.com",
      },
      {
        id: "travel-jeju-2",
        name: "제주도 한라산",
        description: "한반도 최고봉으로 등산과 자연을 즐길 수 있는 국립공원",
        lat: 33.361,
        lng: 126.533,
        type: "VIEW" as const,
        rating: 4.7,
        price_level: 1,
        image_url: "https://picsum.photos/seed/jeju-halla/800/600",
        address: "제주특별자치도 제주시",
        phone: "064-123-4568",
        website: "https://example-jeju-travel-2.com",
      },
      {
        id: "travel-jeju-3",
        name: "제주도 카멜리아힐",
        description: "아름다운 동백꽃과 정원을 감상할 수 있는 로맨틱한 장소",
        lat: 33.305,
        lng: 126.319,
        type: "VIEW" as const,
        rating: 4.6,
        price_level: 2,
        image_url: "https://picsum.photos/seed/jeju-camellia/800/600",
        address: "제주특별자치도 서귀포시 안덕면",
        phone: "064-123-4569",
        website: "https://example-jeju-travel-3.com",
      },
      {
        id: "travel-jeju-4",
        name: "제주도 섭지코지",
        description: "드라마 촬영지로 유명한 아름다운 해안 절경",
        lat: 33.424,
        lng: 126.928,
        type: "VIEW" as const,
        rating: 4.7,
        price_level: 1,
        image_url: "https://picsum.photos/seed/jeju-seopjikoji/800/600",
        address: "제주특별자치도 서귀포시 성산읍",
        phone: "064-123-4570",
        website: "https://example-jeju-travel-4.com",
      },
      {
        id: "travel-jeju-5",
        name: "제주도 우도",
        description: "제주도에서 가장 아름다운 섬으로 자전거 여행이 인기",
        lat: 33.506,
        lng: 126.953,
        type: "VIEW" as const,
        rating: 4.8,
        price_level: 2,
        image_url: "https://picsum.photos/seed/jeju-udo/800/600",
        address: "제주특별자치도 제주시 우도면",
        phone: "064-123-4571",
        website: "https://example-jeju-travel-5.com",
      },
    ],
  },
  {
    id: "travel-course-busan",
    title: "부산 여행",
    region: "부산",
    places: [
      {
        id: "travel-busan-1",
        name: "부산 해운대",
        description: "부산의 대표 해수욕장으로 여름 휴가의 명소",
        lat: 35.163,
        lng: 129.163,
        type: "VIEW" as const,
        rating: 4.6,
        price_level: 2,
        image_url: "https://picsum.photos/seed/busan-haeundae/800/600",
        address: "부산광역시 해운대구",
        phone: "051-123-4567",
        website: "https://example-busan-travel-1.com",
      },
      {
        id: "travel-busan-2",
        name: "부산 감천문화마을",
        description: "산자락에 붙어있는 아름다운 색채의 마을",
        lat: 35.097,
        lng: 129.011,
        type: "VIEW" as const,
        rating: 4.5,
        price_level: 1,
        image_url: "https://picsum.photos/seed/busan-gamcheon/800/600",
        address: "부산광역시 사하구",
        phone: "051-123-4568",
        website: "https://example-busan-travel-2.com",
      },
      {
        id: "travel-busan-3",
        name: "부산 태종대",
        description: "부산의 아름다운 해안 절경을 감상할 수 있는 곳",
        lat: 35.055,
        lng: 129.083,
        type: "VIEW" as const,
        rating: 4.7,
        price_level: 1,
        image_url: "https://picsum.photos/seed/busan-taejongdae/800/600",
        address: "부산광역시 영도구",
        phone: "051-123-4569",
        website: "https://example-busan-travel-3.com",
      },
      {
        id: "travel-busan-4",
        name: "부산 광안리",
        description: "부산의 또 다른 대표 해수욕장과 야경 명소",
        lat: 35.153,
        lng: 129.118,
        type: "VIEW" as const,
        rating: 4.6,
        price_level: 2,
        image_url: "https://picsum.photos/seed/busan-gwangalli/800/600",
        address: "부산광역시 수영구",
        phone: "051-123-4570",
        website: "https://example-busan-travel-4.com",
      },
    ],
  },
  {
    id: "travel-course-gyeongju",
    title: "경주 여행",
    region: "경주",
    places: [
      {
        id: "travel-gyeongju-1",
        name: "경주 불국사",
        description: "신라시대의 대표적인 불교 사원으로 세계문화유산",
        lat: 35.789,
        lng: 129.332,
        type: "MUSEUM" as const,
        rating: 4.8,
        price_level: 2,
        image_url: "https://picsum.photos/seed/gyeongju-bulguksa/800/600",
        address: "경상북도 경주시 불국로",
        phone: "054-123-4567",
        website: "https://example-gyeongju-travel-1.com",
      },
      {
        id: "travel-gyeongju-2",
        name: "경주 첨성대",
        description: "신라시대의 천문대 유적으로 역사적 가치가 높은 곳",
        lat: 35.835,
        lng: 129.219,
        type: "MUSEUM" as const,
        rating: 4.6,
        price_level: 1,
        image_url: "https://picsum.photos/seed/gyeongju-cheomseongdae/800/600",
        address: "경상북도 경주시 첨성로",
        phone: "054-123-4568",
        website: "https://example-gyeongju-travel-2.com",
      },
      {
        id: "travel-gyeongju-3",
        name: "경주 대릉원",
        description: "신라 왕들의 무덤이 모여있는 역사 공원",
        lat: 35.839,
        lng: 129.213,
        type: "MUSEUM" as const,
        rating: 4.5,
        price_level: 1,
        image_url: "https://picsum.photos/seed/gyeongju-daereungwon/800/600",
        address: "경상북도 경주시",
        phone: "054-123-4569",
        website: "https://example-gyeongju-travel-3.com",
      },
    ],
  },
  {
    id: "travel-course-yeosu",
    title: "여수 여행",
    region: "여수",
    places: [
      {
        id: "travel-yeosu-1",
        name: "여수 오동도",
        description: "소나무와 바다가 어우러진 아름다운 섬",
        lat: 34.761,
        lng: 127.779,
        type: "VIEW" as const,
        rating: 4.7,
        price_level: 1,
        image_url: "https://picsum.photos/seed/yeosu-odongdo/800/600",
        address: "전라남도 여수시",
        phone: "061-123-4567",
        website: "https://example-yeosu-travel-1.com",
      },
      {
        id: "travel-yeosu-2",
        name: "여수 돌산공원",
        description: "여수의 아름다운 해안 절경을 감상할 수 있는 공원",
        lat: 34.748,
        lng: 127.762,
        type: "VIEW" as const,
        rating: 4.6,
        price_level: 1,
        image_url: "https://picsum.photos/seed/yeosu-dolsan/800/600",
        address: "전라남도 여수시",
        phone: "061-123-4568",
        website: "https://example-yeosu-travel-2.com",
      },
    ],
  },
  {
    id: "travel-course-gangneung",
    title: "강릉 여행",
    region: "강릉",
    places: [
      {
        id: "travel-gangneung-1",
        name: "강릉 안목해변",
        description: "강릉의 대표 해변으로 카페 거리가 유명",
        lat: 37.789,
        lng: 128.906,
        type: "VIEW" as const,
        rating: 4.6,
        price_level: 2,
        image_url: "https://picsum.photos/seed/gangneung-anmok/800/600",
        address: "강원특별자치도 강릉시",
        phone: "033-123-4567",
        website: "https://example-gangneung-travel-1.com",
      },
      {
        id: "travel-gangneung-2",
        name: "강릉 정동진",
        description: "일출과 일몰을 감상할 수 있는 아름다운 해안",
        lat: 37.689,
        lng: 129.033,
        type: "VIEW" as const,
        rating: 4.7,
        price_level: 1,
        image_url: "https://picsum.photos/seed/gangneung-jeongdongjin/800/600",
        address: "강원특별자치도 강릉시",
        phone: "033-123-4568",
        website: "https://example-gangneung-travel-2.com",
      },
    ],
  },
  {
    id: "travel-course-sokcho",
    title: "속초 여행",
    region: "속초",
    places: [
      {
        id: "travel-sokcho-1",
        name: "속초 설악산",
        description: "가을 단풍이 아름다운 산으로 등산 명소",
        lat: 38.121,
        lng: 128.466,
        type: "VIEW" as const,
        rating: 4.8,
        price_level: 1,
        image_url: "https://picsum.photos/seed/sokcho-seorak/800/600",
        address: "강원특별자치도 속초시",
        phone: "033-123-4569",
        website: "https://example-sokcho-travel-1.com",
      },
    ],
  },
  {
    id: "travel-course-chuncheon",
    title: "춘천 여행",
    region: "춘천",
    places: [
      {
        id: "travel-chuncheon-1",
        name: "춘천 남이섬",
        description: "가을 단풍과 자연을 즐길 수 있는 아름다운 섬",
        lat: 37.792,
        lng: 127.526,
        type: "VIEW" as const,
        rating: 4.7,
        price_level: 2,
        image_url: "https://picsum.photos/seed/chuncheon-nami/800/600",
        address: "강원특별자치도 춘천시",
        phone: "033-123-4570",
        website: "https://example-chuncheon-travel-1.com",
      },
    ],
  },
]

// 여행 코스의 모든 장소를 평탄화 (API 호환성을 위해)
const coupleTripPlaces = travelCourses.flatMap(course =>
  course.places.map(place => ({
    ...place,
    course_id: course.id,
    course_title: course.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
)

// 경비 모킹 데이터 (20개)
const budgetItems = Array.from({ length: 20 }, (_, i) => {
  const categories: Array<"교통비" | "숙박비" | "식비" | "액티비티" | "쇼핑" | "기타"> = [
    "교통비",
    "숙박비",
    "식비",
    "액티비티",
    "쇼핑",
    "기타",
  ]
  const category = categories[i % categories.length]

  const names = {
    교통비: ["KTX 왕복", "렌터카 3일", "항공권", "버스 교통비", "지하철 1일권"],
    숙박비: ["호텔 2박", "펜션 1박", "리조트 3박", "게스트하우스 1박", "모텔 1박"],
    식비: ["저녁 식사", "점심 식사", "브런치", "카페", "디저트"],
    액티비티: ["테마파크 입장권", "전시회 입장권", "액티비티 체험", "스파 이용권", "투어 예약"],
    쇼핑: ["기념품", "의류", "화장품", "전자제품", "로컬 특산품"],
    기타: ["보험", "통신비", "팁", "기타 비용", "예비비"],
  }

  const plannedAmounts = {
    교통비: [150000, 200000, 300000, 50000, 30000],
    숙박비: [200000, 150000, 400000, 80000, 100000],
    식비: [80000, 60000, 70000, 30000, 25000],
    액티비티: [100000, 50000, 120000, 150000, 80000],
    쇼핑: [150000, 200000, 100000, 300000, 50000],
    기타: [50000, 30000, 20000, 40000, 100000],
  }

  const categoryNames = names[category]
  const categoryAmounts = plannedAmounts[category]
  const nameIndex = Math.floor(i / categories.length) % categoryNames.length

  const plannedAmount = categoryAmounts[nameIndex] || Math.floor(Math.random() * 200000) + 50000
  const actualAmount = plannedAmount + Math.floor((Math.random() - 0.5) * 50000)

  return {
    id: `budget-item-${i + 1}`,
    travel_plan_id: `travel-plan-${Math.floor(i / 5) + 1}`,
    category: category,
    name: categoryNames[nameIndex] || `${category} ${i + 1}`,
    planned_amount: plannedAmount,
    actual_amount: Math.max(0, actualAmount),
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    notes: i % 3 === 0 ? `비고: ${category} 관련 추가 비용` : null,
    receipt_url: i % 4 === 0 ? `https://picsum.photos/seed/receipt-${i + 1}/400/300` : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
})

export const handlers = [
  // Supabase REST API - places 테이블 조회
  // 모든 Supabase 도메인에 대해 매칭
  http.get(
    ({ request }) => {
      const url = new URL(request.url)
      return url.pathname.includes("/rest/v1/places")
    },
    ({ request }) => {
      const url = new URL(request.url)
      const select = url.searchParams.get("select") || "*"
      const typeParam = url.searchParams.get("type")
      const limit = parseInt(url.searchParams.get("limit") || "20", 10)
      const order = url.searchParams.get("order") || "rating.desc"

      // Supabase의 type 필터 형식: type=in.(VIEW,MUSEUM,CAFE,FOOD)
      let places: typeof dateCoursePlaces = []

      // type 파라미터 파싱
      let requestedTypes: string[] = []
      if (typeParam) {
        // in.(VIEW,MUSEUM) 형식 파싱
        const match = typeParam.match(/in\.\(([^)]+)\)/)
        if (match) {
          requestedTypes = match[1].split(",").map(t => t.trim())
        } else if (
          typeParam.includes("CAFE") ||
          typeParam.includes("FOOD") ||
          typeParam.includes("VIEW") ||
          typeParam.includes("MUSEUM")
        ) {
          // 단순 문자열 매칭
          requestedTypes = typeParam.split(",").map(t => t.trim())
        }
      }

      // 데이트 코스: CAFE, FOOD가 포함되거나 preferredTypes가 없을 때 기본값
      // getCoupleRecommendations는 기본적으로 VIEW, MUSEUM, CAFE, FOOD를 포함하므로 데이트 코스로 간주
      const isDateCourse =
        requestedTypes.length === 0 ||
        requestedTypes.some(t => t === "CAFE" || t === "FOOD") ||
        (requestedTypes.includes("VIEW") &&
          requestedTypes.includes("MUSEUM") &&
          requestedTypes.includes("CAFE"))

      if (isDateCourse) {
        // 데이트 코스 데이터 사용
        places = dateCoursePlaces.filter(p => {
          if (requestedTypes.length === 0) return true
          return requestedTypes.includes(p.type)
        })
      } else {
        // 커플 여행 코스 데이터 사용
        places = coupleTripPlaces.filter(p => {
          if (requestedTypes.length === 0) return p.type === "VIEW" || p.type === "MUSEUM"
          return requestedTypes.includes(p.type)
        })
      }

      // 정렬 적용 (rating.desc)
      if (order === "rating.desc") {
        places.sort((a, b) => b.rating - a.rating)
      }

      // limit 적용
      const limitedPlaces = places.slice(0, limit)

      // Supabase REST API 응답 형식
      return HttpResponse.json(limitedPlaces, {
        headers: {
          "Content-Type": "application/json",
          "Content-Range": `0-${limitedPlaces.length - 1}/${places.length}`,
          Prefer: "return=representation",
        },
      })
    }
  ),

  // Supabase REST API - budget_items 테이블 조회
  http.get(
    ({ request }) => {
      const url = new URL(request.url)
      return url.pathname.includes("/rest/v1/budget_items")
    },
    ({ request }) => {
      const url = new URL(request.url)
      const travelPlanId = url.searchParams.get("travel_plan_id")
      const limit = parseInt(url.searchParams.get("limit") || "20", 10)

      let items = budgetItems

      // travel_plan_id 필터 적용
      if (travelPlanId) {
        items = budgetItems.filter(item => item.travel_plan_id === travelPlanId)
      }

      // limit 적용
      const limitedItems = items.slice(0, limit)

      return HttpResponse.json(limitedItems, {
        headers: {
          "Content-Type": "application/json",
          "Content-Range": `0-${limitedItems.length - 1}/${items.length}`,
          Prefer: "return=representation",
        },
      })
    }
  ),
]
