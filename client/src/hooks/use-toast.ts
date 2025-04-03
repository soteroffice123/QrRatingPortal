import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastOriginal,
  type ToastActionProps,
} from "@/components/ui/use-toast";

type ToastOptions = Omit<Toast, "id" | "title" | "description"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export function useToast() {
  const { toast, dismiss, toasts } = useToastOriginal();

  function customToast({
    title,
    description,
    action,
    ...props
  }: ToastOptions) {
    return toast({
      title,
      description,
      action,
      ...props,
    });
  }

  return {
    toast: customToast,
    dismiss,
    toasts,
  };
}
