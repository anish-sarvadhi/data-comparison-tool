/** @format */

import { FixedSizeList as List } from "react-window";

const VirtualizedTable = ({ data }: any) => {
  return (
    <List
      height={500} // Adjust height as needed
      itemCount={data.length}
      itemSize={40} // Row height
      width="100%"
    >
      {({ index, style }) => {
        const row = data[index];
        return (
          <div style={style} className="flex border-b p-2">
            <div className="w-1/2">{row.oldData?.["Packet Id"] || "N/A"}</div>
            <div className="w-1/2">{row.newData?.["Stock ID"] || "N/A"}</div>
          </div>
        );
      }}
    </List>
  );
};

export default VirtualizedTable;
