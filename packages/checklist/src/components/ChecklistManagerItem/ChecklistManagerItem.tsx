'use client'

import { Button, Text } from "@portal/ui";
import { useEffect, useRef, useState } from "react";

export interface ChecklistManagerItemProps {
  title: string;
  description?: string;
  onSave?: (values: { title: string; description: string }) => void;
  onDelete: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ChecklistManagerItem({
  title,
  description,
  onSave,
  onDelete,
  onEdit,
  onCancel,
  className,
}: ChecklistManagerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [descriptionValue, setDescriptionValue] = useState(description ?? "");
  const titleRef = useRef<HTMLInputElement>(null);

  // mantém o estado interno em sincronia caso as props mudem enquanto não está editando
  useEffect(() => {
    if (!isEditing) {
      setTitleValue(title);
      setDescriptionValue(description ?? "");
    }
  }, [title, description, isEditing]);

  // ao entrar em edição, o título já vem selecionado (foco = borda + texto brand)
  useEffect(() => {
    if (isEditing) titleRef.current?.focus();
  }, [isEditing]);

  const isTitleEmpty = titleValue.trim().length === 0;

  function handleEdit() {
    setTitleValue(title);
    setDescriptionValue(description ?? "");
    setIsEditing(true);
    onEdit?.();
  }

  function handleConfirm() {
    // título é obrigatório: não salva vazio
    if (isTitleEmpty) {
      titleRef.current?.focus();
      return;
    }
    onSave?.({
      title: titleValue.trim(),
      description: descriptionValue.trim(),
    });
    setIsEditing(false);
  }

  function handleCancel() {
    // descarta as mudanças e volta ao estado original
    setTitleValue(title);
    setDescriptionValue(description ?? "");
    setIsEditing(false);
    onCancel?.();
  }

  // padding varia conforme o modo: leitura = px 12px / py 16px, edição = py 12px
  const paddingClass = isEditing ? "py-3" : "px-3 py-4";

  // coluna no mobile e tablet (botões pra baixo), linha só no desktop (lg)
  const containerClass = [
    "flex flex-col gap-4 border-t border-border-default",
    paddingClass,
    "lg:flex-row lg:items-center lg:justify-between lg:gap-8",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // px 12px / py 8px, radius via token, cores via token semântico
  // não selecionado = cinza (border-default + text-secondary)
  // selecionado (foco) = brand na borda e no texto
  // field-sizing:content ajusta a largura ao conteúdo (inclui placeholder)
  // OBS: field-sizing:content não é suportado no Firefox — largura cai para o padrão lá
  const inputBase =
    "rounded-lg border border-border-default bg-transparent px-3 py-2 " +
    "text-text-secondary placeholder:text-text-secondary " +
    "focus:border-border-focus focus:text-text-brand focus:outline-none " +
    "transition-colors duration-200 [field-sizing:content]";

  if (isEditing) {
    return (
      <div className={containerClass}>
        <div className="flex min-w-0 flex-col items-start gap-2 lg:max-w-3xl">
          {/* mesmo tamanho do título no modo leitura: label-sm / md:label-md */}
          <input
            ref={titleRef}
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            placeholder="Digite o título do item"
            aria-label="Título do item"
            aria-invalid={isTitleEmpty}
            className={`${inputBase} text-label-sm md:text-label-md`}
          />

          {/* mesmo tamanho da descrição no modo leitura: label-xs / md:label-sm */}
          <textarea
            value={descriptionValue}
            onChange={(e) => setDescriptionValue(e.target.value)}
            placeholder="Digite a descrição do item"
            aria-label="Descrição do item"
            rows={2}
            className={`${inputBase} resize-none text-label-xs md:text-label-sm`}
          />
        </div>

        {/* confirmar e cancelar sempre lado a lado */}
        <div className="flex shrink-0 flex-row items-center gap-3">
          <Button
            variant="outlined"
            tone="positive"
            size="sm"
            iconLeft="check-check"
            onClick={handleConfirm}
            disabled={isTitleEmpty}
            aria-label="Confirmar alterações"
          >
            <span className="hidden lg:inline">Confirmar alterações</span>
          </Button>

          <Button
            variant="outlined"
            tone="negative"
            size="sm"
            iconLeft="x"
            onClick={handleCancel}
            aria-label="Descartar alterações"
          >
            <span className="hidden lg:inline">Descartar alterações</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex w-full min-w-0 flex-col gap-2 lg:max-w-3xl">
        <Text variant="label-sm" tone="brand" className="md:text-label-md">
          {title}
        </Text>
        {description && (
          <Text
            variant="label-xs"
            tone="secondary"
            className="break-words md:text-label-sm"
          >
            {description}
          </Text>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Button
          variant="outlined"
          tone="brand"
          size="sm"
          iconLeft="square-pen"
          onClick={handleEdit}
          aria-label="Editar item"
        >
          <span className="hidden lg:inline">Editar</span>
        </Button>

        <Button
          variant="outlined"
          tone="negative"
          size="sm"
          iconLeft="trash-2"
          onClick={onDelete}
          aria-label="Excluir item"
        >
          <span className="hidden lg:inline">Excluir Item</span>
        </Button>
      </div>
    </div>
  );
}
