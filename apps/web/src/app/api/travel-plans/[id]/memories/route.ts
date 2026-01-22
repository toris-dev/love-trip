import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import {
  getTravelMemories,
  createTravelMemory,
  updateTravelMemory,
  deleteTravelMemory,
} from "@lovetrip/planner/services/travel-memory-service"

/**
 * GET /api/travel-plans/[id]/memories
 * 여행 계획의 추억 목록 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params

    const memories = await getTravelMemories(travelPlanId, user.id)

    return NextResponse.json({ memories }, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/travel-plans/[id]/memories:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "추억을 불러오는데 실패했습니다",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/travel-plans/[id]/memories
 * 추억 생성
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { id: travelPlanId } = await params
    const body = await request.json()

    const memory = await createTravelMemory(user.id, {
      travel_plan_id: travelPlanId,
      title: body.title || null,
      description: body.description || null,
      photo_urls: body.photoUrls || [],
      memory_date: body.memoryDate || new Date().toISOString().split("T")[0],
      location: body.location || null,
      place_id: body.placeId || null,
      tags: body.tags || [],
      is_shared: body.isShared || false,
    })

    return NextResponse.json({ memory }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/travel-plans/[id]/memories:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "추억을 생성하는데 실패했습니다",
      },
      { status: 500 }
    )
  }
}
