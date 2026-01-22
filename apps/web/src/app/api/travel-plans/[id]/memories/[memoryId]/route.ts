import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@lovetrip/api/supabase/server"
import { updateTravelMemory, deleteTravelMemory } from "@lovetrip/planner/services/travel-memory-service"

/**
 * PUT /api/travel-plans/[id]/memories/[memoryId]
 * 추억 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memoryId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { memoryId } = await params
    const body = await request.json()

    const memory = await updateTravelMemory(memoryId, user.id, {
      title: body.title,
      description: body.description,
      photo_urls: body.photoUrls,
      memory_date: body.memoryDate,
      location: body.location,
      place_id: body.placeId,
      tags: body.tags,
      is_shared: body.isShared,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ memory }, { status: 200 })
  } catch (error) {
    console.error("Error in PUT /api/travel-plans/[id]/memories/[memoryId]:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "추억을 업데이트하는데 실패했습니다",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/travel-plans/[id]/memories/[memoryId]
 * 추억 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memoryId: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { memoryId } = await params

    await deleteTravelMemory(memoryId, user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error in DELETE /api/travel-plans/[id]/memories/[memoryId]:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "추억을 삭제하는데 실패했습니다",
      },
      { status: 500 }
    )
  }
}
