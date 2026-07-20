interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
}

export function AdminPageHeader({ title, subtitle }: AdminPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-1">
      <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="text-sm text-subtle">{subtitle}</p>
    </header>
  );
}
