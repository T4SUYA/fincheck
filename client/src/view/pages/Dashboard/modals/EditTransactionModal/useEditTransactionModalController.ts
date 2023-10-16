import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBankAccounts } from '../../../../../shared/hooks/useBankAccounts';
import { useCategories } from '../../../../../shared/hooks/useCategories';
import { useMemo, useState } from 'react';
import { Transaction } from '../../../../../shared/entities/transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsService } from '../../../../../shared/services/transactionsService';
import { currencyStringToNumber } from '../../../../../shared/utils/currencyStringToNumber';
import toast from 'react-hot-toast';
import { Category } from '../../../../../shared/entities/category';
import { categoriesService } from '../../../../../shared/services/categoriesService';
import { useTranslation } from 'react-i18next';

const schema = z.object({
  value: z.union([z.string().nonempty('Valor é obrigatório'), z.number()]),
  categoryId: z.string().nonempty('Categoria é obrigatória'),
  bankAccountId: z.string().nonempty('Conta é obrigatória'),
  name: z.string().nonempty('Nome é obrigatório'),
  date: z.date()
});

type FormData = z.infer<typeof schema>;

export function useEditTransactionModalController(
  transaction: Transaction | null,
  onClose: () => void
) {
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankAccountId: transaction?.bankAccountId,
      categoryId: transaction?.categoryId,
      date: transaction ? new Date(transaction.date) : new Date(),
      name: transaction?.name,
      value: transaction?.value
    }
  });

  const { t } = useTranslation();
  const { accounts } = useBankAccounts();
  const queryClient = useQueryClient();
  const { categories: categoriesList } = useCategories();

  const { isLoading, mutateAsync: updateTransaction } = useMutation(
    transactionsService.update
  );

  const { isLoading: isLoadingRemove, mutateAsync: removeTransaction } =
    useMutation(transactionsService.remove);

  const { isLoading: isLoadingCategoryRemove, mutateAsync: removeCategory } =
    useMutation(categoriesService.remove);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);

  const [isEditCategoriesModalOpen, setIsEditCategoriesModalOpen] =
    useState(false);

  const [categoryBeingEdited, setCategoryBeingEdited] =
    useState<null | Category>(null);

  const [categoryBeingDeleted, setCategoryBeingDeleted] = useState<
    null | string
  >(null);

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      await updateTransaction({
        ...data,
        id: transaction!.id,
        value: currencyStringToNumber(data.value),
        type: transaction!.type,
        categoryId: data!.categoryId,
        bankAccountId: data!.bankAccountId,
        date: data.date.toISOString()
      });

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast.success(
        transaction!.type === 'EXPENSE'
          ? 'Despesa editada com sucesso.'
          : 'Receita editada com sucesso.'
      );
      onClose();
      reset();
    } catch {
      toast.error(
        transaction!.type === 'EXPENSE'
          ? 'Erro ao salvar a despesa.'
          : 'Erro ao salvar a receita.'
      );
    }
  });

  const categories = useMemo(() => {
    return categoriesList.filter(
      (category) => category.type === transaction?.type
    );
  }, [categoriesList, transaction]);

  async function handleDeleteTransaction() {
    try {
      await removeTransaction(transaction!.id);

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });

      toast.success(
        transaction!.type === 'EXPENSE'
          ? 'Despesa deletada com sucesso!'
          : 'Receita deletada com sucesso!'
      );
      onClose();
    } catch {
      toast.error(
        transaction!.type === 'EXPENSE'
          ? 'Erro ao deletar a despesa.'
          : 'Erro ao deletar a receita.'
      );
    }
  }

  async function handleDeleteCategory() {
    try {
      await removeCategory(categoryBeingDeleted!);

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });

      toast.success('Categoria deletada com sucesso!');
      onClose();
    } catch {
      toast.error('Erro ao deletar a categoria.');
    }
  }

  function handleCloseDeleteModal() {
    setIsDeleteModalOpen(false);
  }

  function handleOpenDeleteModal() {
    setIsDeleteModalOpen(true);
  }

  function handleCloseDeleteCategoryModal() {
    setIsDeleteCategoryModalOpen(false);
  }

  function handleOpenDeleteCategoryModal(categoryId: string) {
    setIsDeleteCategoryModalOpen(true);
    setCategoryBeingDeleted(categoryId);
  }

  function handleOpenEditCategoriesModal(category: Category) {
    setIsEditCategoriesModalOpen(true);
    setCategoryBeingEdited(category);
  }

  function handleCloseEditCategoriesModal() {
    setIsEditCategoriesModalOpen(false);
    setCategoryBeingEdited(null);
  }

  return {
    register,
    errors,
    control,
    handleSubmit,
    accounts,
    categories,
    reset,
    isLoading,
    isLoadingRemove,
    isLoadingCategoryRemove,
    isDeleteModalOpen,
    handleDeleteTransaction,
    handleCloseDeleteModal,
    handleOpenDeleteModal,
    isEditCategoriesModalOpen,
    isDeleteCategoryModalOpen,
    categoryBeingEdited,
    handleCloseEditCategoriesModal,
    handleOpenEditCategoriesModal,
    handleCloseDeleteCategoryModal,
    handleOpenDeleteCategoryModal,
    handleDeleteCategory,
    t
  };
}
