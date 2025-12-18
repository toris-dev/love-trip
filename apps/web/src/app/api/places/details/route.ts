import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/places/details
 * 네이버 Places API와 블로그 검색 API를 사용하여 장소 상세 정보 및 블로그 정보 가져오기
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("query")

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "query parameter is required (min 2 characters)" },
      { status: 400 }
    )
  }

  const placesClientId = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_ID
  const placesClientSecret = process.env.NEXT_PUBLIC_NAVER_DEV_CLIENT_SECRET

  if (!placesClientId || !placesClientSecret) {
    return NextResponse.json(
      {
        error: "Naver Places API credentials are not configured.",
      },
      { status: 500 }
    )
  }

  try {
    // 1. 네이버 Places API로 장소 상세 정보 가져오기
    const placesResponse = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=1&sort=sim`,
      {
        headers: {
          "X-Naver-Client-Id": placesClientId,
          "X-Naver-Client-Secret": placesClientSecret,
        },
      }
    )

    let placeDetails = null
    if (placesResponse.ok) {
      const placesData = await placesResponse.json()
      if (placesData.items && placesData.items.length > 0) {
        const item = placesData.items[0]
        placeDetails = {
          category: item.category?.replace(/<[^>]*>/g, "") || "",
          telephone: item.telephone?.replace(/<[^>]*>/g, "") || "",
          link: item.link || "",
          roadAddress: item.roadAddress || "",
          address: item.address || "",
          title: item.title?.replace(/<[^>]*>/g, "") || "",
        }
      }
    }

    // 2. 네이버 블로그 검색 API로 블로그 포스트 가져오기
    const blogResponse = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=5&sort=sim`,
      {
        headers: {
          "X-Naver-Client-Id": placesClientId,
          "X-Naver-Client-Secret": placesClientSecret,
        },
      }
    )

    let blogs: Array<{
      title: string
      link: string
      description: string
      bloggername: string
      bloggerlink: string
      postdate: string
      image?: string
    }> = []

    if (blogResponse.ok) {
      const blogData = await blogResponse.json()
      if (blogData.items && blogData.items.length > 0) {
        blogs = blogData.items.map((item: any) => {
          // description에서 이미지 URL 추출
          const imageMatch = item.description?.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
          const imageUrl = imageMatch ? imageMatch[1] : undefined

          return {
            title: item.title?.replace(/<[^>]*>/g, "") || "",
            link: item.link || "",
            description: item.description?.replace(/<[^>]*>/g, "") || "",
            bloggername: item.bloggername || "",
            bloggerlink: item.bloggerlink || "",
            postdate: item.postdate || "",
            image: imageUrl,
          }
        })
      }
    }

    return NextResponse.json({
      place: placeDetails,
      blogs: blogs,
    })
  } catch (error) {
    console.error("API exception:", error)
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 })
  }
}
