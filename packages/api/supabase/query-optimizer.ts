"use server"

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@lovetrip/shared/types/database"

type SupabaseClientType = SupabaseClient<Database>

/**
 * Query Optimizer
 * N+1 쿼리 문제 해결 및 쿼리 최적화 유틸리티
 */

/**
 * 배치 조회를 위한 헬퍼
 * 여러 ID를 한 번에 조회하여 N+1 문제 해결
 */
export async function batchFetch<T>(
  supabase: SupabaseClientType,
  table: string,
  ids: string[],
  selectColumns: string = "*"
): Promise<Map<string, T>> {
  if (ids.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase.from(table).select(selectColumns).in("id", ids)

  if (error) throw error

  const resultMap = new Map<string, T>()
  if (data) {
    data.forEach(item => {
      const id = (item as { id: string }).id
      resultMap.set(id, item as T)
    })
  }

  return resultMap
}

/**
 * 관계형 데이터를 한 번에 조회 (JOIN 대신)
 * Supabase의 중첩 쿼리를 최적화
 */
export async function fetchWithRelations<T>(
  supabase: SupabaseClientType,
  table: string,
  filters: Record<string, unknown>,
  relations: {
    table: string
    foreignKey: string
    select?: string
  }[]
): Promise<T[]> {
  // 메인 쿼리
  let query = supabase.from(table).select("*")

  // 필터 적용
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      query = query.eq(key, value)
    }
  })

  const { data: mainData, error } = await query

  if (error) throw error
  if (!mainData || mainData.length === 0) {
    return []
  }

  // 관계 데이터 배치 조회
  const relationDataMap = new Map<string, Map<string, unknown[]>>()

  for (const relation of relations) {
    const foreignKeyValues = mainData
      .map(item => (item as Record<string, unknown>)[relation.foreignKey])
      .filter(Boolean) as string[]

    if (foreignKeyValues.length > 0) {
      const { data: relationData } = await supabase
        .from(relation.table)
        .select(relation.select || "*")
        .in(relation.foreignKey, foreignKeyValues)

      if (relationData) {
        const grouped = new Map<string, unknown[]>()
        relationData.forEach(item => {
          const fk = (item as Record<string, unknown>)[relation.foreignKey] as string
          if (!grouped.has(fk)) {
            grouped.set(fk, [])
          }
          grouped.get(fk)!.push(item)
        })
        relationDataMap.set(relation.table, grouped)
      }
    }
  }

  // 데이터 결합
  return mainData.map(item => {
    const result = { ...item } as Record<string, unknown>

    relations.forEach(relation => {
      const fk = (item as Record<string, unknown>)[relation.foreignKey] as string
      const relationData = relationDataMap.get(relation.table)?.get(fk) || []
      result[relation.table] = relationData
    })

    return result as T
  })
}

/**
 * 페이지네이션 최적화
 */
export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export async function paginatedQuery<T>(
  supabase: SupabaseClientType,
  table: string,
  options: PaginationOptions,
  filters?: Record<string, unknown>
): Promise<PaginatedResult<T>> {
  const { page, limit } = options
  const from = (page - 1) * limit
  const to = from + limit - 1

  // 총 개수 조회
  let countQuery = supabase.from(table).select("*", { count: "exact", head: true })

  // 데이터 조회
  let dataQuery = supabase.from(table).select("*").range(from, to)

  // 필터 적용
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        countQuery = countQuery.eq(key, value)
        dataQuery = dataQuery.eq(key, value)
      }
    })
  }

  const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery])

  if (error) throw error

  return {
    data: (data || []) as T[],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > to + 1,
  }
}
