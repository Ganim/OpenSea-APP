import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form';
import { Input } from './input';

const meta = {
  title: 'UI/Input + Form',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const schema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome muito curto'),
});

type FormValues = z.infer<typeof schema>;

const FormDemo = ({
  defaultValues = { email: '', name: '' },
  forceError = false,
}: {
  defaultValues?: FormValues;
  forceError?: boolean;
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (forceError) {
      form.setError('email', { message: 'Este email já está em uso' });
    }
  }, [forceError, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(data =>
          alert(JSON.stringify(data, null, 2))
        )}
        className="w-80 space-y-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Maria Silva" {...field} />
              </FormControl>
              <FormDescription>Como aparece no cadastro.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@empresa.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Salvar
        </Button>
      </form>
    </Form>
  );
};

export const InputDefault: Story = {
  render: () => <Input placeholder="Digite aqui..." className="w-80" />,
};

export const InputDisabled: Story = {
  render: () => <Input placeholder="Bloqueado" disabled className="w-80" />,
};

export const InputWithLabel: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label htmlFor="cpf-demo" className="text-sm font-medium text-foreground">
        Documento (CPF)
      </label>
      <Input
        id="cpf-demo"
        type="text"
        inputMode="numeric"
        placeholder="000.000.000-00"
      />
    </div>
  ),
};

export const InputAriaInvalid: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      <label htmlFor="email-demo" className="text-sm font-medium">
        Email
      </label>
      <Input
        id="email-demo"
        type="email"
        defaultValue="invalido"
        aria-invalid
      />
      <p className="text-sm text-destructive">Email inválido</p>
    </div>
  ),
};

export const FormDefault: Story = { render: () => <FormDemo /> };

export const FormWithError: Story = {
  render: () => (
    <FormDemo
      defaultValues={{ email: 'duplicado@empresa.com', name: 'Maria' }}
      forceError
    />
  ),
};

export const FormPrefilled: Story = {
  render: () => (
    <FormDemo
      defaultValues={{ email: 'maria@empresa.com', name: 'Maria Silva' }}
    />
  ),
};
