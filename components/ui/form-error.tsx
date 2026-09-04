import { CircleAlert } from "lucide-react";

export function FormError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="form-error" role="alert">
      <CircleAlert aria-hidden="true" size={18} />
      <span>{message}</span>
    </div>
  );
}
