import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Field = {
  label: string;
  value: string | number;
  name?: string;
  readOnly?: boolean;
};

type EditPanelProps = {
  title: string;
  description: string;
  fields: Field[];
  action?: (formData: FormData) => void | Promise<void>;
  children?: React.ReactNode;
};

export function EditPanel({
  title,
  description,
  fields,
  action,
  children,
}: EditPanelProps) {
  return (
    <Card className="rounded-lg border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          {children}
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.label} className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  {field.label}
                </span>
                <Input
                  defaultValue={field.value}
                  name={field.name}
                  readOnly={field.readOnly}
                />
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="reset" variant="outline">
              변경 취소
            </Button>
            <Button type="submit">수정 저장</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type NotesPanelProps = {
  title?: string;
  placeholder?: string;
  action?: (formData: FormData) => void | Promise<void>;
  targetType?: string;
  targetId?: string;
};

export function NotesPanel({
  title = "운영 메모",
  placeholder = "처리 이력, 고객 응대 내용, 내부 판단 근거를 적어두세요.",
  action,
  targetType,
  targetId,
}: NotesPanelProps) {
  return (
    <Card className="rounded-lg border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          메모는 나중에 admin_logs와 연결해서 자동 저장할 영역입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action}>
          <input name="targetType" type="hidden" value={targetType} />
          <input name="targetId" type="hidden" value={targetId} />
          <Textarea
            className="min-h-36"
            name="note"
            placeholder={placeholder}
          />
          <div className="mt-5 flex justify-end">
            <Button type="submit">메모 저장</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type ActionPanelProps = {
  title: string;
  description: string;
  actions: Array<{
    label: string;
    variant?: "default" | "outline" | "destructive" | "secondary";
    action?: (formData: FormData) => void | Promise<void>;
    fields?: Record<string, string | number | boolean | null | undefined>;
  }>;
};

export function ActionPanel({ title, description, actions }: ActionPanelProps) {
  return (
    <Card className="rounded-lg border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <form key={action.label} action={action.action}>
            {Object.entries(action.fields ?? {}).map(([name, value]) => (
              <input
                key={name}
                name={name}
                type="hidden"
                value={String(value ?? "")}
              />
            ))}
            <Button
              className="w-full"
              type="submit"
              variant={action.variant ?? "outline"}
            >
              {action.label}
            </Button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}
