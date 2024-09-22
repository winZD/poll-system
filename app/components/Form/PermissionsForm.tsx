import { t } from 'i18next';
import React, { InputHTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const PermissionsForm = ({ className = '', ...rest }) => {
  const { setValue, watch } = useFormContext();

  const { t } = useTranslation();

  const permissionsLabeled = {
    C: t('perms.C'), // Translates to 'Kreiranje' or equivalent
    U: t('perms.U'), // Translates to 'Ažuriranje'
    D: t('perms.D'), // Translates to 'Brisanje'
  };

  const permissions = watch('permissions');

  return (
    <div className="flex flex-col">
      <label className="">{t('permissions')}</label>
      <div className="flex flex-col">
        {['C', 'U', 'D'].map((e, index) => (
          <label
            key={index}
            className={`flex items-center gap-2 ${rest.disabled ? 'text-zinc-400' : ''}`}
          >
            <input
              key={index}
              disabled={rest.disabled}
              className=""
              type="checkbox"
              checked={permissions.includes(e)}
              onChange={() =>
                setValue(
                  'permissions',
                  permissions.includes(e)
                    ? permissions.replace(e, '')
                    : `${permissions}${e}`.split('').sort().join(''),
                )
              }
            />
            {`${permissionsLabeled[e]} (${e})`}
          </label>
        ))}
      </div>
    </div>
  );
};

export default PermissionsForm;
