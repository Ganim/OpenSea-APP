'use client';

import type { UpdateProfileRequest } from '@/types/auth';
import { useForm } from '@tanstack/react-form';

interface ProfileFormProps {
  initialData: UpdateProfileRequest;
  onSubmit: (data: UpdateProfileRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProfileForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProfileFormProps) {
  const form = useForm({
    defaultValues: initialData,
    onSubmit: async ({ value }: { value: UpdateProfileRequest }) => {
      await onSubmit(value);
    },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      {/* Nome */}
      <form.Field name="name">
        {field => (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Seu nome"
            />
          </div>
        )}
      </form.Field>

      {/* Sobrenome */}
      <form.Field name="surname">
        {field => (
          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sobrenome
            </label>
            <input
              id="surname"
              type="text"
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Seu sobrenome"
            />
          </div>
        )}
      </form.Field>

      {/* Localização */}
      <form.Field name="location">
        {field => (
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Localização
            </label>
            <input
              id="location"
              type="text"
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Cidade, País"
            />
          </div>
        )}
      </form.Field>

      {/* Bio */}
      <form.Field name="bio">
        {field => (
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={field.state.value || ''}
              onChange={e => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Conte um pouco sobre você..."
            />
          </div>
        )}
      </form.Field>

      {/* Buttons */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Salvando...
            </span>
          ) : (
            '💾 Salvar'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
