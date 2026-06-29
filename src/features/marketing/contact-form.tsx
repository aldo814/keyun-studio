"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [type, setType] = useState("서비스 도입");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function openMailClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(`[KEYUN ${type}] ${name || "문의"}`);
    const body = encodeURIComponent(
      `문의 유형: ${type}\n이름·회사명: ${name}\n회신 이메일: ${email}\n\n문의 내용\n${message}`,
    );

    window.location.href = `mailto:hello@keyun.io?subject=${subject}&body=${body}`;
  }

  return (
    <form className="space-y-5" onSubmit={openMailClient}>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">문의 유형</span>
        <select
          className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          onChange={(event) => setType(event.target.value)}
          value={type}
        >
          {["서비스 도입", "제작 상담", "파트너십", "기타"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">이름·회사명</span>
          <Input
            onChange={(event) => setName(event.target.value)}
            placeholder="홍길동 / 키운스튜디오"
            required
            value={name}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">회신 이메일</span>
          <Input
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hello@example.com"
            required
            type="email"
            value={email}
          />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">문의 내용</span>
        <Textarea
          className="min-h-40 resize-none"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="필요한 사이트와 운영 방식에 대해 알려주세요."
          required
          value={message}
        />
      </label>
      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="size-4 text-emerald-600" />
          입력한 내용은 메일 앱에서 전송 전 다시 확인할 수 있어요.
        </p>
        <Button className="h-11 bg-blue-600 px-5 text-white hover:bg-blue-700" type="submit">
          문의 메일 작성
          <ArrowRight />
        </Button>
      </div>
    </form>
  );
}
