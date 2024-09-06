import React, { InputHTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';

const permissionsLabeled = {
  C: 'Kreiranje',
  R: 'Pregled',
  U: 'Ažuriranje',
  D: 'Brisanje',
};

const PermissionsForm = ({ className = '', ...rest }) => {
  const { setValue, watch } = useFormContext();

  const permissions = watch('permissions');

  return (
    <div className="flex flex-col">
      <label className="">Ovlasti</label>
      <div className="flex flex-col">
        {['C', 'R', 'U', 'D'].map((e) => (
          <label className="flex items-center gap-2">
            <input
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
