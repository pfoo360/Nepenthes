import { createPortal } from "react-dom";
import { FC, ReactNode, MouseEvent, MouseEventHandler } from "react";

interface ModalProps {
  open: boolean;
  onClose: (
    event: MouseEvent<HTMLButtonElement> | MouseEvent<HTMLDivElement>
  ) => void;
  children: ReactNode | string;
}

const Modal: FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  const overlayRootEl = document.getElementById("modal-root");
  if (!overlayRootEl) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[1000] bg-neutral-900 opacity-70"
      />
      <div className="fixed z-[1000] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </>,
    overlayRootEl
  );
};

export default Modal;
