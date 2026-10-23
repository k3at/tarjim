import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Container, Eyebrow } from "@/components/ui/layout";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  icon?: IconName;
  badges?: string[];
  children?: ReactNode;
  className?: string;
};

export function PageHero({ eyebrow, title, description, icon, badges = [], children, className }: Props) {
  return (
    <section className={className ? `relative overflow-hidden ${className}` : "relative overflow-hidden"}>
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <div
        className="from-brand-200/40 to-accent-400/20 pointer-events-none absolute -top-28 left-1/2 size-96 -translate-x-1/2 rounded-full bg-gradient-to-br blur-3xl"
        aria-hidden="true"
      />
      <Container className="relative py-12 sm:py-16">
        <div className="max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <div className="mt-4 flex items-start gap-4">
            {icon ? (
              <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300 mt-1 grid size-12 shrink-0 place-items-center rounded-2xl">
                <Icon name={icon} className="size-6" />
              </span>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-foreground font-display text-3xl font-extrabold text-balance sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h1>
              <p className="text-muted mt-4 text-base leading-8">{description}</p>
              {badges.length ? (
                <ul className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  {badges.map((badge) => (
                    <li key={badge} className="text-muted inline-flex items-center gap-1.5">
                      <Icon name="check-circle" className="text-accent-600 size-4" />
                      {badge}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          {children ? <div className="mt-7 flex flex-wrap items-center gap-3">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
