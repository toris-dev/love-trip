import { Header } from "@/components/layout/header"

/**
 * 병렬 라우트 @header 슬롯의 기본 컴포넌트.
 * 헤더는 독립적으로 로딩/에러 처리를 가지며 메인 콘텐츠를 블로킹하지 않음.
 */
export default function HeaderSlot() {
  return <Header />
}
