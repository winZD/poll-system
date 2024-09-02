import { NavLink } from "@remix-run/react";
import React, { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className="flex flex-col inset-0 absolute items-center justify-center backdrop-brightness-50">
      <div className="flex flex-col">
        <div className="bg-zinc-200 flex justify-between gap-8 p-2">
          <div>{title}</div>
          <NavLink to={".."} onClick={() => onClose?.()} className="font-bold">
            ✕
          </NavLink>
        </div>
        <div className="bg-white">{children}</div>
      </div>
    </div>
  );
};
