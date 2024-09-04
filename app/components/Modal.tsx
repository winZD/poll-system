import { NavLink, useLocation } from '@remix-run/react';
import React, { ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  const location = useLocation();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-brightness-50">
      <div className="flex flex-col overflow-hidden rounded-lg">
        <div className="flex justify-between gap-8 bg-blue-200 px-4 py-2 font-bold">
          <div>{title}</div>
          <NavLink
            to={`..${location.search}`}
            onClick={() => onClose?.()}
            className="font-bold"
          >
            ✕
          </NavLink>
        </div>
        <div className="bg-white">{children}</div>
      </div>
    </div>
  );
};
