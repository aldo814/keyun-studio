import type { Metadata } from "next";
import { Clock3, Mail, MessageSquareText } from "lucide-react";

import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ContactForm } from "@/features/marketing/contact-form";

export const metadata: Metadata = {
  title: "문의하기",
  description: "KEYUN 서비스 도입, 웹사이트 제작, 파트너십에 대해 문의하세요.",
};

export default function ContactPage() {
  return (
    <div className="bg-white text-slate-950">
      <MarketingHeader />
      <main>
        <section className="border-b border-slate-200 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold text-blue-600">문의하기</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-normal sm:text-6xl">
              필요한 사이트에 대해
              <br />
              편하게 이야기해주세요.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
              서비스 도입부터 제작 상담, 파트너십까지 확인 후 가장 적합한 방향으로
              안내해드리겠습니다.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
            <aside>
              <p className="text-sm font-semibold text-slate-950">연락처</p>
              <div className="mt-6 space-y-5">
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-400">이메일</p>
                    <a
                      className="mt-1 block text-sm font-medium hover:text-blue-600"
                      href="mailto:hello@keyun.io"
                    >
                      hello@keyun.io
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Clock3 className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-400">운영 시간</p>
                    <p className="mt-1 text-sm font-medium">평일 10:00–18:00</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <MessageSquareText className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-400">응답 안내</p>
                    <p className="mt-1 text-sm font-medium">영업일 기준 1–2일 이내</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-slate-200 pt-6">
                <p className="text-xs leading-6 text-slate-500">
                  사이트 목적, 필요한 페이지, 원하는 오픈 일정을 함께 알려주시면
                  더 정확하게 안내할 수 있습니다.
                </p>
              </div>
            </aside>

            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-8">
              <h2 className="text-xl font-semibold">문의 내용</h2>
              <p className="mt-2 text-sm text-slate-500">
                필수 정보만 받고, 메일 앱에서 전송 전 내용을 확인합니다.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
