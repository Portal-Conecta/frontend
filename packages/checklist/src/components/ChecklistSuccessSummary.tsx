import { Text, Icon, Button } from "@portal/ui";
import { Alert } from "@portal/ui/molecules";
import type { ChecklistExecutionResponse } from "../types/execution";
import type { ChecklistIssueResponse } from "../types/issue";

export interface ChecklistSuccessSummaryProps {
  execution: ChecklistExecutionResponse;
  onFinish: () => void;
}

export function ChecklistSuccessSummary({ execution, onFinish }: ChecklistSuccessSummaryProps) {
  const { complianceScore, summary, issues } = execution;
  const isPerfect = complianceScore === 100;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center justify-center bg-background-surface rounded-xl border border-border-default p-8 shadow-sm text-center">
        <div className="bg-feedback-success/10 p-4 rounded-full mb-4">
          <Icon name="circle" size="lg" className="text-feedback-success" decorative />
        </div>
        <Text as="h2" variant="heading-h2" tone="primary" className="mb-2">
          Checklist Enviado com Sucesso!
        </Text>
        <Text variant="body-md" tone="secondary">
          A avaliação da sala foi registrada e sincronizada com sucesso.
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background-surface rounded-lg border border-border-default p-5 shadow-sm flex flex-col items-center text-center">
          <Text variant="label-sm" tone="secondary" className="uppercase tracking-wide mb-1">
            Conformidade
          </Text>
          <Text as="span" variant="heading-h2" className={isPerfect ? "text-feedback-success" : "text-interactive-default"}>
            {complianceScore ?? 0}%
          </Text>
        </div>
        <div className="bg-background-surface rounded-lg border border-border-default p-5 shadow-sm flex flex-col items-center text-center">
          <Text variant="label-sm" tone="secondary" className="uppercase tracking-wide mb-1">
            Itens Conformes
          </Text>
          <Text as="span" variant="heading-h2" className="text-feedback-success">
            {summary?.compliantItems ?? 0}
          </Text>
        </div>
        <div className="bg-background-surface rounded-lg border border-border-default p-5 shadow-sm flex flex-col items-center text-center">
          <Text variant="label-sm" tone="secondary" className="uppercase tracking-wide mb-1">
            Não Conformes
          </Text>
          <Text as="span" variant="heading-h2" className={summary?.nonCompliantItems ? "text-feedback-error" : "text-text-primary"}>
            {summary?.nonCompliantItems ?? 0}
          </Text>
        </div>
      </div>

      {issues && issues.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          <Text as="h3" variant="heading-h2" tone="primary">
            Pendências Geradas
          </Text>
          <Alert variant="error">
            <Text variant="label-md-emphasis">{`${issues.length} pendência(s) registrada(s)`}</Text>
            <Text variant="body-sm">Foram criadas pendências automaticamente para os itens não conformes. A equipe responsável foi notificada.</Text>
          </Alert>
          
          <div className="flex flex-col gap-3">
            {issues.map((issue: ChecklistIssueResponse) => (
              <div key={issue.id} className="bg-background-surface rounded-md border border-border-default p-4 flex flex-col gap-2">
                <Text variant="label-md" tone="primary">
                  {issue.itemTitleSnapshot}
                </Text>
                <Text variant="body-sm" tone="secondary">
                  <span className="font-semibold text-text-primary">Observação: </span>
                  {issue.description}
                </Text>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        <Button variant="solid" tone="brand" onClick={onFinish}>
          Voltar para Início
        </Button>
      </div>
    </div>
  );
}
