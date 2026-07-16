"use client"

import React, { useState } from 'react';

import { Button, Input, Text, Field } from '@portal/ui';

interface CreateCourseFormProps {
  onSubmit?: (data: { code: string; name: string }) => void;
  onCancel?: () => void;
  isSaving?: boolean;
}

export const CreateCourseForm: React.FC<CreateCourseFormProps> = ({
  onCancel,
  onSubmit,
  isSaving = false,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  
  const [errors, setErrors] = useState({ code: '', name: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); 
    
    let hasError = false;
    const newErrors = { code: '', name: '' };

    if (!code.trim()) {
      newErrors.code = 'Código é obrigatório.';
      hasError = true;
    }
    
    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório.';
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError && onSubmit) {
      onSubmit({ code, name });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
      
      <div className="flex flex-col gap-4">
        
        <div className="flex flex-col">
          <Field label="Código do curso">
            <Input
              value={code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCode(e.target.value);
                if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
              }}
            />
          </Field>
          
          {errors.code && (
            <Text variant="body-sm" className="mt-1 text-red-600">
              {errors.code}
            </Text>
          )}
        </div>

        <div className="flex flex-col">
          <Field label="Nome do curso">
            <Input
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Ex: Desenvolvimento de Sistema"
            />
          </Field>
          
          {errors.name && (
            <Text variant="body-sm" className="mt-1 text-red-600">
              {errors.name}
            </Text>
          )}
        </div>

      </div>

      <div className="mt-2 flex gap-4">
        <Button
          type="button" 
          variant="outlined"
          onClick={onCancel}
          className="flex-1 font-normal text-label-xs md:text-label-sm lg:text-label-sm"
        >
          Descartar alterações
        </Button>
        <Button
          type="submit" 
          variant="solid"
          disabled={isSaving}
          className="flex-1 font-normal text-label-xs md:text-label-sm lg:text-label-sm"
        >
          {isSaving ? 'Salvando...' : 'Salvar e criar curso'}
        </Button>
      </div>
    </form>
  );
};