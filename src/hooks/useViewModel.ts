import { useState, useEffect } from 'react';
import { BaseViewModel } from '../MVVM/viewmodels/BaseViewModel';

export function useViewModel<T>(
  ViewModelClass: new () => BaseViewModel<T>,
  id?: string
) {
  const [viewModel] = useState(() => new ViewModelClass());
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      viewModel.load(id).catch(console.error);
    }
  }, [id, viewModel]);

  useEffect(() => {
    const updateState = () => {
      setData(viewModel.getData());
      setLoading(viewModel.isLoading());
      setError(viewModel.getError());
    };

    // Initial state
    updateState();

    // TODO: Implement proper observable pattern in ViewModels
    // and subscribe to changes here
  }, [viewModel]);

  return {
    viewModel,
    data,
    loading,
    error
  };
}
