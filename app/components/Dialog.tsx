// context/DialogContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { FocusScope } from 'react-aria';
import { IoWarningOutline } from 'react-icons/io5';

type DialogConfig = {
  title?: string;
  message?: string;
  buttonText?: string;
  onConfirm: () => void;
};

type DialogContextType = {
  openDialog: (config: DialogConfig) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useConfirmDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig>({
    title: '',
    message: '',
    buttonText: '',
    onConfirm: () => {},
  });

  const openDialog = (config: DialogConfig) => {
    setDialogConfig({
      onConfirm: config.onConfirm,
      title: config.title || 'Potvrda',
      message: config.message || 'Potvrdite radnju',
      buttonText: config.buttonText || 'Potvrdi',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {dialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-brightness-75">
          <FocusScope contain restoreFocus autoFocus>
            <div className="flex min-h-64 min-w-96 flex-col overflow-hidden rounded-lg bg-white shadow">
              <div className="flex items-center gap-2 border-b border-b-slate-200 px-4 py-4">
                <IoWarningOutline size={20} />
                <div>{dialogConfig.title}</div>
              </div>
              <div className="flex flex-1 items-center justify-center p-4">
                {dialogConfig.message}
              </div>
              <div className="flex justify-between bg-gray-100 p-4">
                <button
                  className="rounded px-4 py-2 hover:bg-gray-400"
                  onClick={closeDialog}
                >
                  Odustani
                </button>
                <button
                  className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-400"
                  onClick={() => {
                    dialogConfig.onConfirm();
                    closeDialog();
                  }}
                >
                  {dialogConfig.buttonText}
                </button>
              </div>
            </div>
          </FocusScope>
        </div>
      )}
    </DialogContext.Provider>
  );
};
