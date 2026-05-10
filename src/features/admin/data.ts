import {
  Activity,
  AlertTriangle,
  BarChart3,
  CreditCard,
  FileText,
  Flag,
  Globe2,
  LayoutTemplate,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

export const adminNavItems = [
  { href: "/admin", label: "개요", icon: BarChart3 },
  { href: "/admin/users", label: "사용자", icon: Users },
  { href: "/admin/workspaces", label: "워크스페이스", icon: Workflow },
  { href: "/admin/sites", label: "사이트", icon: Globe2 },
  { href: "/admin/templates", label: "템플릿", icon: LayoutTemplate },
  { href: "/admin/subscriptions", label: "구독/결제", icon: CreditCard },
  { href: "/admin/reports", label: "신고/검수", icon: Flag },
  { href: "/admin/logs", label: "운영 로그", icon: FileText },
  { href: "/admin/settings", label: "설정", icon: Settings },
] as const;

export const overviewStats = [
  { label: "전체 사용자", value: "12,842", delta: "+18.2%" },
  { label: "활성 워크스페이스", value: "2,194", delta: "+9.7%" },
  { label: "공개 사이트", value: "8,735", delta: "+31.4%" },
  { label: "월 반복 매출", value: "₩48.6M", delta: "+12.1%" },
] as const;

export const users = [
  {
    id: "usr_1024",
    name: "김은요",
    email: "eunyo@keyun.studio",
    role: "workspace_owner",
    workspace: "키운 디자인",
    plan: "Pro",
    status: "active",
    joinedAt: "2026-05-01",
    lastSeen: "방금 전",
  },
  {
    id: "usr_1025",
    name: "박지민",
    email: "jimin@example.com",
    role: "workspace_admin",
    workspace: "모어브랜드",
    plan: "Business",
    status: "active",
    joinedAt: "2026-05-02",
    lastSeen: "18분 전",
  },
  {
    id: "usr_1026",
    name: "이서윤",
    email: "seoyoon@example.com",
    role: "editor",
    workspace: "스튜디오 온",
    plan: "Free",
    status: "review",
    joinedAt: "2026-05-04",
    lastSeen: "2시간 전",
  },
  {
    id: "usr_1027",
    name: "최도현",
    email: "dohyun@example.com",
    role: "viewer",
    workspace: "낮은책방",
    plan: "Starter",
    status: "suspended",
    joinedAt: "2026-05-05",
    lastSeen: "어제",
  },
] as const;

export const workspaces = [
  {
    id: "wks_3001",
    name: "키운 디자인",
    owner: "김은요",
    members: 6,
    sites: 14,
    plan: "Pro",
    usage: "62%",
    status: "healthy",
  },
  {
    id: "wks_3002",
    name: "모어브랜드",
    owner: "박지민",
    members: 12,
    sites: 31,
    plan: "Business",
    usage: "78%",
    status: "healthy",
  },
  {
    id: "wks_3003",
    name: "스튜디오 온",
    owner: "이서윤",
    members: 2,
    sites: 3,
    plan: "Free",
    usage: "95%",
    status: "limit",
  },
] as const;

export const sites = [
  {
    id: "site_8001",
    name: "Keyun Studio Landing",
    owner: "키운 디자인",
    slug: "keyun-studio",
    status: "published",
    domain: "keyun.studio",
    updatedAt: "2026-05-10 00:42",
    lastDeploy: "성공",
  },
  {
    id: "site_8002",
    name: "Cafe Archive",
    owner: "모어브랜드",
    slug: "cafe-archive",
    status: "draft",
    domain: "-",
    updatedAt: "2026-05-09 22:18",
    lastDeploy: "대기",
  },
  {
    id: "site_8003",
    name: "Studio On Portfolio",
    owner: "스튜디오 온",
    slug: "studio-on",
    status: "review",
    domain: "studio-on.kr",
    updatedAt: "2026-05-09 18:11",
    lastDeploy: "검수 필요",
  },
] as const;

export const templates = [
  {
    id: "tpl_2101",
    name: "브랜드 랜딩",
    category: "Landing",
    visibility: "public",
    used: 428,
    status: "featured",
  },
  {
    id: "tpl_2102",
    name: "예약형 스튜디오",
    category: "Booking",
    visibility: "public",
    used: 173,
    status: "active",
  },
  {
    id: "tpl_2103",
    name: "포트폴리오 그리드",
    category: "Portfolio",
    visibility: "private",
    used: 38,
    status: "draft",
  },
] as const;

export const subscriptions = [
  {
    id: "sub_5001",
    customer: "키운 디자인",
    plan: "Pro",
    amount: "₩29,000",
    status: "active",
    renewal: "2026-06-01",
  },
  {
    id: "sub_5002",
    customer: "모어브랜드",
    plan: "Business",
    amount: "₩99,000",
    status: "active",
    renewal: "2026-06-02",
  },
  {
    id: "sub_5003",
    customer: "스튜디오 온",
    plan: "Starter",
    amount: "₩12,000",
    status: "past_due",
    renewal: "2026-05-12",
  },
] as const;

export const reports = [
  {
    id: "rpt_9001",
    target: "Studio On Portfolio",
    reason: "상표권 신고",
    severity: "high",
    status: "open",
    createdAt: "2026-05-10 00:11",
  },
  {
    id: "rpt_9002",
    target: "Cafe Archive",
    reason: "부적절한 이미지",
    severity: "medium",
    status: "reviewing",
    createdAt: "2026-05-09 21:04",
  },
] as const;

export const logs = [
  {
    id: "log_7001",
    actor: "super_admin",
    action: "사이트 비공개 처리",
    target: "site_8003",
    createdAt: "2026-05-10 00:44",
  },
  {
    id: "log_7002",
    actor: "stripe_webhook",
    action: "결제 실패 이벤트 수신",
    target: "sub_5003",
    createdAt: "2026-05-10 00:31",
  },
  {
    id: "log_7003",
    actor: "super_admin",
    action: "추천 템플릿 변경",
    target: "tpl_2101",
    createdAt: "2026-05-09 23:18",
  },
] as const;

export const alertCards = [
  {
    title: "검수 대기 사이트",
    value: "18",
    description: "24시간 이상 대기 3건",
    icon: AlertTriangle,
  },
  {
    title: "결제 실패",
    value: "7",
    description: "자동 재시도 예정 5건",
    icon: CreditCard,
  },
  {
    title: "시스템 상태",
    value: "정상",
    description: "API, DB, Storage 모두 정상",
    icon: ShieldCheck,
  },
  {
    title: "최근 배포",
    value: "284",
    description: "오늘 성공률 98.6%",
    icon: Activity,
  },
] as const;
