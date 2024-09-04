import React from 'react';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export const AgGrid: React.FC<AgGridReactProps> = ({
  rowData,
  columnDefs,
  defaultColDef = { suppressMenu: true },
  suppressRowHoverHighlight = true,
  suppressCellFocus = true,
  overlayNoRowsTemplate = 'Nema podataka',
  ...props
}) => {
  return (
    <div className={`${props.className || ''} ag-theme-quartz flex-1`}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        suppressRowHoverHighlight={suppressRowHoverHighlight}
        suppressCellFocus={suppressCellFocus}
        overlayNoRowsTemplate={overlayNoRowsTemplate}
        {...props} // Spread other props to allow further customization if needed
      />{' '}
    </div>
  );
};
