import { NavLink, useLocation } from '@remix-run/react';
import React, { ReactNode } from 'react';
import { FocusScope, Overlay, useModalOverlay } from 'react-aria';
import { useOverlayTriggerState } from 'react-stately';

interface ModalProps {
  title: string;
  onClose?: () => void;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  ...rest
}) => {
  const location = useLocation();

  let ref = React.useRef(null);

  let state = useOverlayTriggerState(rest);

  let { modalProps, underlayProps } = useModalOverlay(rest, state, ref);

  return (
    <Overlay>
      <FocusScope contain restoreFocus autoFocus>
        <div
          className="fixed inset-0 z-10 flex flex-col items-center justify-center p-8 backdrop-brightness-90"
          {...underlayProps}
        >
          <div {...modalProps} ref={ref} className="max-h-full">
            <div className="flex max-h-full flex-col rounded-lg bg-white shadow-md">
              <div className="flex justify-between bg-neutral-100 p-2">
                <div className="font-semibold">{title}</div>
                <NavLink to=".." onClick={() => onClose?.()}>
                  ✕
                </NavLink>
              </div>
              <div className="overflow-auto">{children}</div>
            </div>
          </div>
        </div>
      </FocusScope>
    </Overlay>
  );
};
