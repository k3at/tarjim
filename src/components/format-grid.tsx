import { Icon, type IconName } from "@/components/icons";
import { Card } from "@/components/ui/layout";

type Group = {
  icon: IconName;
  title: string;
  body: string;
  items: string[];
  tone: string;
};

const GROUPS: Group[] = [
  {
    icon: "document",
    title: "المستندات",
    body: "ملفات العمل اليومية مع الحفاظ على بنيتها.",
    items: ["Word (DOCX)", "Excel (XLSX)", "PowerPoint (PPTX)", "PDF"],
    tone: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  },
  {
    icon: "text",
    title: "النصوص والبيانات",
    body: "ملفات نصية وقوائم وجداول وإعدادات.",
    items: ["TXT", "Markdown", "CSV / TSV", "JSON", "YAML", "INI / Properties", "LOG", "reStructuredText"],
    tone: "bg-accent-500/10 text-accent-700 dark:text-accent-400",
  },
  {
    icon: "code",
    title: "الويب والبرمجة",
    body: "نصوص صفحات وملفات بيانات منظمة.",
    items: ["HTML", "HTM", "XML", "JSON"],
    tone: "bg-gold-500/15 text-gold-500",
  },
  {
    icon: "subtitles",
    title: "الترجمة المرئية",
    body: "ملفات التوقيت للفيديو مع الحفاظ على الأرقام الزمنية.",
    items: ["SRT", "WebVTT"],
    tone: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
  },
];

export function FormatGrid({ className }: { className?: string }) {
  return (
    <div className={className ?? "grid gap-5 sm:grid-cols-2"}>
      {GROUPS.map((group) => (
        <Card key={group.title} className="h-full">
          <div className="flex items-start gap-4">
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${group.tone}`}>
              <Icon name={group.icon} className="size-5" />
            </span>
            <div>
              <h2 className="text-foreground text-lg font-bold">{group.title}</h2>
              <p className="text-muted mt-1 text-sm leading-7">{group.body}</p>
            </div>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li
                key={item}
                className="border-border-subtle bg-surface-sunken/60 text-muted rounded-lg border px-2.5 py-1 text-xs font-medium"
                dir="ltr"
              >
                {item}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
