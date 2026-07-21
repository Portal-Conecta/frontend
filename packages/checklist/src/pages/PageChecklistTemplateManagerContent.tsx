"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { Button, ConfirmDialog, Icon, Text } from "@portal/ui";

import { ChecklistManagerItem } from "../components/ChecklistManagerItem";
import { SuccessModal } from "../components/SuccessModal";
import type { MockTemplateItem } from "./gestaoItensMockData";

export interface PageChecklistTemplateManagerContentProps {
  room: string;
  backHref: string;
  initialItems: MockTemplateItem[];
}

interface EditableItem extends MockTemplateItem {
  /** Item recém-criado por "Adicionar item" — ainda não confirmado. */
  isNew?: boolean;
}

export function PageChecklistTemplateManagerContent({
  room,
  backHref,
  initialItems,
}: PageChecklistTemplateManagerContentProps) {
  const [items, setItems] = useState<EditableItem[]>(initialItems);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
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
          onClick={() => setShowSaved(true)}
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
        onClose={() => setShowSaved(false)}
      />
    </div>
  );
}
