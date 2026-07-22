"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { messageFor } from "@portal/core/http/errorPresentation";
import { HttpError } from "@portal/core/http/errors";
import { Button, ConfirmDialog, DefaultModal, Icon, Text } from "@portal/ui";

import { ChecklistManagerItem } from "../components/ChecklistManagerItem";
import { SuccessModal } from "../components/SuccessModal";
import {
  activateTemplateClient,
  createNewTemplateVersionClient,
  createTemplateClient,
  editTemplateClient,
} from "../services/client/templateClient";
import type { ChecklistCategory, ChecklistSchema } from "../types/template";
import type { MockTemplateItem } from "./gestaoItensMockData";

export interface PageChecklistTemplateManagerContentProps {
  room: string;
  backHref: string;
  roomId: string;
  /** Título do template — o existente ao editar, ou um sugerido ao criar. */
  title: string;
  /** Categoria do template — a existente ao editar, ou "GERAL" ao criar (sem seletor na UI ainda). */
  category: ChecklistCategory;
  /** Id do template ACTIVE da sala — presente = editar (new-version → editar DRAFT → ativar); ausente = criar. */
  templateId?: string;
  initialItems: MockTemplateItem[];
}

interface EditableItem extends MockTemplateItem {
  /** Item recém-criado por "Adicionar item" — ainda não confirmado. */
  isNew?: boolean;
}

export function PageChecklistTemplateManagerContent({
  room,
  backHref,
  roomId,
  title,
  category,
  templateId,
  initialItems,
}: PageChecklistTemplateManagerContentProps) {
  const router = useRouter();
  const [items, setItems] = useState<EditableItem[]>(initialItems);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    title: string;
    body: string;
  } | null>(null);
  const nextItemId = useRef(0);

  const deleteTargetItem = items.find((item) => item.key === deleteTarget);
  const hasPendingNewItem = items.some((item) => item.isNew);

  function handleAddItem() {
    if (hasPendingNewItem) return;

    setItems((prev) => [
      ...prev,
      {
        key: `new-${nextItemId.current++}`,
        title: "",
        description: "",
        isNew: true,
      },
    ]);
  }

  function handleSaveItem(
    key: string,
    values: { title: string; description: string },
  ) {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, ...values, isNew: false } : item,
      ),
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  function handleCancelItem(item: EditableItem) {
    // item novo descartado sem confirmar: some da lista em vez de ficar com título vazio
    if (item.isNew) removeItem(item.key);
  }

  function handleConfirmDelete() {
    if (deleteTarget) removeItem(deleteTarget);
    setDeleteTarget(null);
  }

  async function handleSave() {
    if (items.length === 0 || saving) return;

    setSaving(true);
    try {
      const schemaJson: ChecklistSchema = {
        sections: [
          {
            key: "geral",
            title: "Geral",
            order: 1,
            items: items.map((item, index) => ({
              key: item.key.startsWith("new-") ? crypto.randomUUID() : item.key,
              title: item.title,
              answerType: "CONFORMITY" as const,
              required: true,
              order: index + 1,
              ...(item.description ? { description: item.description } : {}),
            })),
          },
        ],
      };

      const draft = templateId
        ? await createNewTemplateVersionClient(templateId)
        : await createTemplateClient({ roomId, title, category, schemaJson });

      const updatedDraft = templateId
        ? await editTemplateClient(draft.id, { schemaJson })
        : draft;

      await activateTemplateClient(updatedDraft.id);

      setShowSaved(true);
    } catch (err) {
      if (err instanceof HttpError && err.kind === "unauthorized") {
        router.replace("/login");
        return;
      }
      setErrorModal({
        title: "Não foi possível salvar",
        body:
          err instanceof HttpError
            ? messageFor(err.kind)
            : "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Link href={backHref} className="flex items-center gap-2 self-start">
        <Icon name="chevron-left" size="lg" tone="primary" decorative />
        <Text as="h1" variant="heading-h2" tone="brand">
          Checklist — {room}
        </Text>
      </Link>

      <div>
        {items.map((item) => (
          <ChecklistManagerItem
            key={item.key}
            title={item.title}
            startEditing={item.isNew ?? false}
            onSave={(values) => handleSaveItem(item.key, values)}
            onDelete={() => setDeleteTarget(item.key)}
            onCancel={() => handleCancelItem(item)}
            {...(item.description ? { description: item.description } : {})}
          />
        ))}
      </div>

      <div className="flex justify-end gap-3 border-t border-border-default pt-6">
        <Button
          variant="outlined"
          tone="brand"
          iconLeft="plus"
          onClick={handleAddItem}
          disabled={hasPendingNewItem}
        >
          Adicionar item
        </Button>

        <Button
          variant="solid"
          tone="brand"
          iconLeft="check-check"
          onClick={handleSave}
          disabled={items.length === 0 || hasPendingNewItem}
          loading={saving}
        >
          Salvar alterações
        </Button>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir item?"
        subTitle="Gestão de Itens"
        content={
          deleteTargetItem
            ? `Tem certeza que deseja excluir "${deleteTargetItem.title}"? Essa ação não pode ser desfeita.`
            : ""
        }
        labelCancel="Cancelar"
        labelConfirm="Excluir"
        confirmTone="negative"
      />

      <SuccessModal
        open={showSaved}
        message="Alterações salvas com sucesso!"
        confirmLabel="Ok!"
        onClose={() => {
          setShowSaved(false);
          router.push(backHref);
        }}
      />

      <DefaultModal
        isOpen={errorModal !== null}
        onClose={() => setErrorModal(null)}
        title={errorModal?.title ?? ""}
        body={errorModal?.body ?? ""}
      />
    </div>
  );
}
