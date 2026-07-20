import { Icon, Text } from "@portal/ui";

export interface ChecklistWindowClosedStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function ChecklistWindowClosedState({
  title = "Fora do horário de preenchimento",
  description = "Não há uma janela de preenchimento aberta para esta turma no momento",
  className,
}: ChecklistWindowClosedStateProps) {
  const classes = ["flex flex-col items-center justify-center p-20 text-center", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <Icon name="circle-alert" size="lg" decorative className="text-text-disabled" />

      <Text variant="heading-h2" className="mt-14">
        {title}
      </Text>

      <Text variant="body-sm-emphasis" tone="disabled" className="mt-14 max-w-md">
        {description}
      </Text>
    </div>
  );
}
