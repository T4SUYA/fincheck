import { Controller } from 'react-hook-form';
import { Input } from '../../../../components/Input';
import { Modal } from '../../../../components/Modal';
import { Select } from '../../../../components/Select';
import { useNewCategoryModalController } from './useNewCategoryModalController';
import { Button } from '../../../../components/Button';

export function NewCategoryModal() {
  const {
    control,
    handleSubmit,
    errors,
    register,
    isLoading,
    isNewCategoryModalOpen,
    closeNewCategoryModal
  } = useNewCategoryModalController();

  return (
    <Modal
      title="Nova Categoria"
      open={isNewCategoryModalOpen}
      onClose={closeNewCategoryModal}
    >
      <form onSubmit={handleSubmit}>
        <div className="mt-10 flex flex-col gap-4">
          <Input
            type="text"
            placeholder="Nome da categoria"
            {...register('name')}
            error={errors.name?.message}
          />
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <Input
                type="file"
                error={errors.file?.message as string}
                onChange={(event) => {
                  if (
                    event.target &&
                    event.target.files &&
                    event.target.files.length > 0
                  ) {
                    field.onChange(event.target.files[0]);
                  }
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="type"
            defaultValue="INCOME"
            render={({ field: { onChange, value } }) => (
              <Select
                placeholder="Tipo"
                error={errors.type?.message}
                onChange={onChange}
                value={value}
                options={[
                  {
                    value: 'INCOME',
                    label: 'Receita'
                  },
                  {
                    value: 'EXPENSE',
                    label: 'Despesa'
                  }
                ]}
              />
            )}
          />
        </div>
        <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
          Criar
        </Button>
      </form>
    </Modal>
  );
}
