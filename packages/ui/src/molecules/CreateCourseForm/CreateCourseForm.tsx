"use client"

import React, { useState } from 'react';

import { Button, Input, Text } from '@portal/ui';

interface CreateCourseFormProps {
  onSubmit?: (data: { codigo: string; nome: string }) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export const CreateCourseForm: React.FC<CreateCourseFormProps> = ({
  onCancel,
  onSubmit,
  isSaving = false,
}) => {
  const [codigo, setCodigo] = useState('WMA');
  const [nome, setNome] = useState('');

  const handleSalvarClick = () => {
    if (onSubmit) {
      onSubmit({ codigo, nome });
    }
  };

  return (
    <div className="flex w-full flex-col gap-5">
      
      <div className="flex flex-col gap-1.5">
        <Text as="label" variant="label-sm-emphasis" tone="brand"  >
          Código do curso
        </Text>
        <Input
          value={codigo}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCodigo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Text as="label" variant="label-sm-emphasis" tone="brand" >
          Nome do curso
        </Text>
        <Input
          value={nome}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
          placeholder="Ex: Desenvolvimento de Sistema"
        />
      </div>

      <div className="flex gap-4 mt-2">
        <Button
          variant="outlined" 
          onClick={onCancel}
          className="flex-1 text-label-xs md:text-label-sm lg:text-label-sm font-normal"
        >
          Descartar alterações
        </Button>
        <Button
          variant="solid" 
          
          onClick={handleSalvarClick}
          disabled={isSaving}
          className="flex-1 text-label-xs md:text-label-sm lg:text-label-sm font-normal"
        >
          {isSaving ? 'Salvando...' : 'Salvar e criar curso'}
        </Button>
      </div>
    </div>
  );
};