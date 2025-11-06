import { useCompanyModalStore } from "@/feature/companies/stores/useCompanyModalStore";
import { useCustomerModalStore } from "@/feature/customers/stores/useCustomersModel";
import ReactDOM from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: "company" | "customer";
};

const Modal = ({ open, onClose, children, type }: ModalProps) => {
  const { isOpen: isCompanyOpen } = useCompanyModalStore();
  const { isOpen: isCustomerOpen } = useCustomerModalStore();

  if (!open) return null;

  const backdropClass =
    isCompanyOpen || isCustomerOpen ? "bg-black/25" : "bg-black/50";

  let zIndex = 50;
  if (type === "company" && isCustomerOpen) zIndex = 60;
  if (type === "customer" && isCompanyOpen) zIndex = 40;

  const modalContent = (
    <div
      id="filter-backdrop"
      className={`fixed inset-0 flex items-center justify-center transition-colors duration-300 ${backdropClass}`}
      style={{ zIndex }}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "filter-backdrop") onClose();
      }}
    >
      {children}
    </div>
  );

  // ✅ Mount directly to <body>, bypassing layout stacking
  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;
