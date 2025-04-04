/** @format */

import Link from "next/link";
import React, {
  isValidElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ContextMenu,
  ContextMenuProps,
  ContextMenuTrigger,
  ContextMenuTriggerProps,
  hideMenu,
  MenuItem,
  MenuItemProps,
} from "react-contextmenu";
import { Resizable, ResizeCallbackData } from "react-resizable";

import { ConfigProvider, Empty, Table, TableProps } from "antd";
import { ColumnType } from "antd/es/table";
import { saveAs } from "file-saver";
import styled from "styled-components";
import { useVT } from "virtualizedtableforantd4";
import * as XLSX from "xlsx";

import useDynamicHeight from "@/hooks/useDynamicHeight";
import { getSafeValue, getTextWidth } from "@/lib/utils";

interface ContextMenuTriggerWrapperProps extends ContextMenuTriggerProps {
  children: ReactNode;
}

const ContextMenuTriggerWrapper: React.FC<ContextMenuTriggerWrapperProps> = ({
  children,
  ...props
}) => <ContextMenuTrigger {...props}>{children}</ContextMenuTrigger>;

interface MenuItemWrapperProps extends MenuItemProps {
  children: ReactNode;
}

const MenuItemWrapper: React.FC<MenuItemWrapperProps> = ({
  children,
  ...props
}) => <MenuItem {...props}>{children}</MenuItem>;

interface ContextMenuWrapperProps extends ContextMenuProps {
  children: ReactNode;
}

const ContextMenuWrapper: React.FC<ContextMenuWrapperProps> = ({
  children,
  ...props
}) => <ContextMenu {...props}>{children}</ContextMenu>;

interface GridTableProps<T> extends TableProps<T> {
  customAction?: boolean;
  enableCellSelection?: boolean;
  heightPer?: number;
  style?: React.CSSProperties;
  loading?: boolean;
  footerContent?: React.ReactNode;
}

const StyledGridTable = styled(Table)<GridTableProps<any>>`
  .ant-table-wrapper {
    border-collapse: separate;
    border-spacing: 0;
    min-width: 350px;
  }

  .ant-table-wrapper tr th,
  .ant-table-wrapper tr td {
    border-right: 1px solid #bbb;
    border-bottom: 1px solid #bbb;
  }

  .ant-table-wrapper tr th:first-child,
  .ant-table-wrapper tr td:first-child {
    border-left: 1px solid #bbb;
  }

  .ant-table-wrapper tr th {
    border-top: 1px solid #bbb;
  }

  .ant-table-wrapper tr:first-child th:first-child {
    border-top-left-radius: 6px;
  }

  .ant-table-wrapper tr:first-child th:last-child {
    border-top-right-radius: 6px;
  }

  .ant-table-wrapper tr:last-child td:first-child {
    border-bottom-left-radius: 6px;
  }

  .ant-table-wrapper tr:last-child td:last-child {
    border-bottom-right-radius: 6px;
  }
  .ant-table-thead > tr > th {
    border: 0.5px solid black; /* Set your desired border color */
  }

  .ant-table-body > table {
    height: 100%;
  }
  .ant-table-tbody > tr > td {
    border: 0.5px solid #a9a9a9; /* Set your desired border color */
  }
  .ant-table-placeholder {
    z-index: 10;
  }
  .ant-table-cell {
    user-select: none;
    padding: 2px !important;
    font-size: 12px !important;
    font-weight: 500;
  }
  .ant-table table {
    font-size: 12px !important;
    text-overflow: ellipsis;
  }
  .ant-table-thead .ant-table-cell {
    background-color: #e6e6e6 !important;
    font-size: 12px !important;
    font-weight: 500 !important;
  }
  .ant-table-tbody .ant-table-row:nth-child(even) {
    background-color: #e6e6e630;
  }
  .ant-table-column-title {
    z-index: 0 !important;
  }

  .ant-pagination .ant-pagination-item-active {
    font-weight: 600;
    background-color: #ffffff;
    border-color: transparent;
  }

  .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector {
    border-radius: 4px;
  }

  .ant-table-cell-fix-left {
    z-index: 1 !important;
  }

  .ant-table-summary {
    z-index: 0 !important;
  }
  .ant-table-cell {
    position: relative;
  }
  .ant-table-fixed-left .ant-table-cell {
    background-color: rgb(176, 45, 45);
    position: absolute;
  }
  .ant-table-cell {
    overflow: hidden;
  }
  .ant-table-title {
    padding: 0 !important;
    border: 1px solid #d9d9d9 !important;
  }
  .react-resizable {
    position: relative;
    background-clip: padding-box;
  }

  .react-resizable-handle {
    position: absolute;
    right: -5px;
    bottom: 0;
    z-index: 1;
    width: 10px;
    height: 100%;
    cursor: col-resize;
  }
  .ant-table-tbody > tr.ant-table-row:hover > td {
    background-color: #d9eeff !important; /* Replace with your desired color */
    transition: background 0.2s ease-in-out;
  }
`;

interface ResizableTitleProps {
  onResize: (
    e: React.SyntheticEvent<Element, Event>,
    data: ResizeCallbackData
  ) => void;
  width: number;
}

const ResizableTitle: React.FC<ResizableTitleProps> = ({
  onResize,
  width,
  ...restProps
}) => {
  if (!width) {
    return <th {...restProps} />;
  }

  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => e.stopPropagation()}
        />
      }
      onResize={onResize}
      draggableOpts={{ enableUserSelectHack: false }}
    >
      <th {...restProps} />
    </Resizable>
  );
};

export const renderColumnContent = (
  text: string,
  record: any,
  col: any,
  userRole?: number
) => {
  const childrenValidation =
    record?.children?.length === undefined ? true : false;

  // Check if user role is 2, 3, or 4
  const isRestrictedRole =
    userRole !== undefined && [2, 3, 4].includes(userRole);

  if (col?.field === "dna" && record?.stock_no && childrenValidation) {
    return (
      <Link
        className="cursor-pointer font-semibold text-primary"
        href={`/dna/${record?.stock_no}`}
        prefetch
        scroll={false}
        target="_blank"
      >
        DNA
      </Link>
    );
  }

  if (col?.field === "image" && record?.image && childrenValidation) {
    return (
      <Link
        className="cursor-pointer font-semibold text-primary"
        href={`${record?.image}`}
        prefetch
        scroll={false}
        target="_blank"
      >
        Image
      </Link>
    );
  }

  if (col?.field === "video" && record?.video && childrenValidation) {
    return (
      <Link
        className="cursor-pointer font-semibold text-primary"
        href={`${record?.video}`}
        prefetch
        scroll={false}
        target="_blank"
      >
        Video
      </Link>
    );
  }

  // Apply condition only if userRole is 2, 3, or 4
  if (
    isRestrictedRole &&
    record?.is_fancy &&
    ["markup_disc", "sell_disc", "rap", "markup_ppc", "sell_ppc"].includes(
      col?.field
    )
  ) {
    if (
      (["markup_disc", "sell_disc"].includes(col?.field) &&
        record?.sell_disc) ||
      (col?.field === "rap" && record?.rap) ||
      (["markup_ppc", "sell_ppc"].includes(col?.field) && record?.sell_ppc)
    ) {
      return <div>-</div>;
    }
  }

  if (col?.field === "lab" && record?.certificate) {
    return (
      <Link
        className="cursor-pointer font-semibold text-primary"
        href={`${record?.certificate}`}
        prefetch
        scroll={false}
        target="_blank"
      >
        {record?.lab}
      </Link>
    );
  }

  const percentageFields = ["sell_disc", "markup_disc", "disc"];

  if (
    percentageFields.includes(col?.field) &&
    record[col?.field] !== undefined
  ) {
    return `${getSafeValue(record[col?.field])}%`;
  }

  const currencyFields = [
    "sell_ppc",
    "sell_amt",
    "markup_ppc",
    "markup_amt",
    "rap",
  ];

  if (currencyFields.includes(col?.field) && record[col?.field]) {
    return `$${getSafeValue(record[col?.field])}`;
  }

  return text;
};

export const exportExcel = <T extends object>(
  data: readonly T[],
  columns: any[],
  filename = "table-data.xlsx"
) => {
  const headers = columns.map((col: any) => ({
    header:
      typeof col.title === "function" ? col.title().props.label : col.title,
    key: col.dataIndex,
    width: 10,
  }));

  const filteredData = data.map((row: Record<string, any>) => {
    const filteredRow: Record<string, unknown> = {};

    headers.forEach((header) => {
      filteredRow[header.key] = row[header.key];
    });

    return filteredRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(filteredData, {
    header: headers.map((header) => header.key),
  });

  headers.forEach((header) => {
    worksheet[`${XLSX.utils.encode_col(headers.indexOf(header))}1`].v =
      header.header;
  });
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
};

const exportCSV = <T extends object>(
  data: readonly T[],
  columns: unknown[] | any[],
  filename = "table-data.csv"
) => {
  const csvHeader = columns
    .map((col: unknown | any) =>
      typeof col.title === "function" ? col.title().props.label : col.title
    )
    .join(",");
  const csvRows = data.map((row: Record<string, any>) =>
    columns.map((col: any) => `"${row[col.dataIndex] || ""}"`).join(",")
  );
  const csvString = [csvHeader, ...csvRows].join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  saveAs(blob, filename);
};

const GridTable = <T extends object>({
  customAction = false,
  enableCellSelection = false,
  columns,
  heightPer,
  dataSource,
  scroll,
  style,
  loading,
  footerContent = null,
  ...props
}: GridTableProps<T>) => {
  const clickCount = useRef(0);

  useEffect(() => {
    const handleClick = () => {
      clickCount.current += 1;
      setTimeout(() => {
        if (clickCount.current === 1) {
          hideMenu();
        }
        clickCount.current = 0;
      }, 200);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const [columnsData, setColumnsData] = useState<TableProps<T>["columns"]>(
    columns ? [...columns] : []
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: { rowIndex: number; colIndex: number } | null;
    end: { rowIndex: number; colIndex: number } | null;
  }>({
    start: null,
    end: null,
  });
  const [vt] = useVT(() => ({ scroll: { y: 600 }, overscanRowCount: 10 }), []);
  const contextMenuId = "table_context_menu";

  useEffect(() => {
    setColumnsData(columns?.map((column) => column) ?? []);
  }, [columns]);

  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  const tableHeight = useDynamicHeight(tableContainerRef as any, 100);

  const copySelectedText = useCallback(() => {
    if (enableCellSelection && selectedRange.start && selectedRange.end) {
      const { start, end } = selectedRange;
      const startRow = Math.min(start.rowIndex, end.rowIndex);
      const endRow = Math.max(start.rowIndex, end.rowIndex);
      const startCol = Math.min(start.colIndex, end.colIndex);
      const endCol = Math.max(start.colIndex, end.colIndex);

      let textToCopy = "";

      for (let row = startRow; row <= endRow; row++) {
        let rowText = "";

        for (let col = startCol; col <= endCol; col++) {
          const column = columns![col];
          const cellValue =
            dataSource![row][(column as ColumnType<T>).dataIndex as keyof T];

          if (column.render) {
            const renderedElement = column.render(
              cellValue,
              dataSource![row],
              row
            );

            if (isValidElement(renderedElement)) {
              const elementType = renderedElement.type;

              if (
                typeof elementType === "function" &&
                elementType.name === "XlSelectBox"
              ) {
                const selectedOption = (
                  renderedElement as React.ReactElement<{
                    option: { value: string; label: string }[];
                    value: string;
                  }>
                ).props.option.find(
                  (option) =>
                    option.value ===
                    (renderedElement as React.ReactElement<{ value: string }>)
                      .props.value
                );
                const labelToCopy = selectedOption?.label || "";

                rowText +=
                  (labelToCopy === "-select-" ? "" : labelToCopy) + "\t";
              } else if (
                typeof elementType === "function" &&
                elementType.name === "XlInputBox"
              ) {
                rowText +=
                  ((renderedElement as React.ReactElement<{ value: string }>)
                    .props.value || "") + "\t";
              } else {
                rowText += (cellValue || "") + "\t";
              }
            } else {
              rowText += (cellValue || "") + "\t";
            }
          } else {
            rowText += (cellValue || "") + "\t";
          }
        }
        textToCopy += rowText.trim() + "\n";
      }

      navigator.clipboard.writeText(textToCopy.trim());
    }
  }, [selectedRange, columns, dataSource, enableCellSelection]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (enableCellSelection && (event.ctrlKey || event.metaKey)) {
        if (event.key === "c" || event.key === "C") {
          event.preventDefault();
          copySelectedText();
        }
      }

      if (!enableCellSelection || !selectedRange.start || !event.shiftKey) {
        return;
      }

      const { start, end } = selectedRange;
      const startRow = Math.min(
        start.rowIndex,
        end?.rowIndex ?? start.rowIndex
      );
      const endRow = Math.max(start.rowIndex, end?.rowIndex ?? start.rowIndex);
      const endCol = end
        ? Math.max(start.colIndex, end.colIndex)
        : start.colIndex;

      let newEndRow = endRow;
      let newEndCol = endCol;

      switch (event.key) {
        case "ArrowUp":
          newEndRow = Math.max(startRow, endRow - 1);
          break;
        case "ArrowDown":
          newEndRow = Math.min(dataSource!.length - 1, endRow + 1);
          break;
        case "ArrowLeft":
          newEndCol = Math.max(0, endCol - 1);
          break;
        case "ArrowRight":
          newEndCol = Math.min(columns!.length - 1, endCol + 1);
          break;
        default:
          return;
      }

      setSelectedRange((prevRange) => ({
        start: prevRange.start,
        end: { rowIndex: newEndRow, colIndex: newEndCol },
      }));
    },
    [enableCellSelection, selectedRange, dataSource, columns]
  );

  const handleCellMouseDown = useCallback(
    (event: React.MouseEvent, rowIndex: number, colIndex: number) => {
      const isInsideInputOrSelectBox =
        (event.target as Element)?.closest(".xl-select-box") ||
        (event.target as Element)?.closest(".xl-input-box");

      if (isInsideInputOrSelectBox || !enableCellSelection) {
        return;
      }

      if (event.shiftKey && selectedRange.start && !isDragging) {
        const start = selectedRange.start;

        setSelectedRange({
          start,
          end: { rowIndex, colIndex },
        });
      } else {
        setSelectedRange({
          start: { rowIndex, colIndex },
          end: { rowIndex, colIndex },
        });
        setIsDragging(true);
      }
      event.preventDefault();
    },
    [enableCellSelection, selectedRange, isDragging]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRange, dataSource, columns, enableCellSelection]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const getCellStyle = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (enableCellSelection && selectedRange.start && selectedRange.end) {
        const { start, end } = selectedRange;
        const startRow = Math.min(start?.rowIndex, end?.rowIndex);
        const endRow = Math.max(start.rowIndex, end.rowIndex);
        const startCol = Math.min(start.colIndex, end.colIndex);
        const endCol = Math.max(start.colIndex, end.colIndex);

        if (
          rowIndex >= startRow &&
          rowIndex <= endRow &&
          colIndex >= startCol &&
          colIndex <= endCol
        ) {
          const isFirstRow = rowIndex === startRow;
          const isFirstCol = colIndex === startCol;
          const isLastRow = rowIndex === endRow;
          const isLastCol = colIndex === endCol;

          const borderStyle = [
            isFirstRow ? "2px" : "0", // Top border only for the first row
            isLastRow ? "2px" : "0", // Bottom border only for the last row
            isFirstCol ? "2px" : "0", // Left border only for the first column
            isLastCol ? "2px" : "0", // Right border only for the last column
          ].join(" ");

          const borderColor = "rgba(24, 144, 255, 1)";
          const backgroundColor = "#edeff6";
          const borderWidth = `${borderStyle} solid ${borderColor} !important`;

          return {
            border: borderWidth,
            backgroundColor,
          };
        }
      }

      return {};
    },
    [selectedRange]
  );

  const handleResize = useCallback(
    (index: number) =>
      (e: React.SyntheticEvent, { size }: { size: { width: number } }) => {
        const nextColumns = Array.isArray(columnsData) ? [...columnsData] : [];

        nextColumns[index] = {
          ...nextColumns[index],
          width: Math.round(size.width),
        };
        setColumnsData(nextColumns);
      },
    [columnsData]
  );

  const handleCellMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (enableCellSelection && isDragging) {
        setSelectedRange((prevRange) => ({
          ...prevRange,
          end: { rowIndex, colIndex },
        }));
      }
    },
    [enableCellSelection, isDragging]
  );

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false); // End dragging
      }
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleCellMouseLeave = () => {
    if (selectedRange.start !== null) {
      setSelectedRange((prevRange) => ({
        start: prevRange.start,
        end: null,
      }));
    }
  };

  const extendedColumns = useMemo(
    () =>
      columnsData
        ?.map((col, colIndex) => {
          if (!col) {
            return undefined;
          }
          const width =
            col.width === "0" || col.width === 0 || !col.width
              ? getTextWidth(col.title?.toString() || "")
              : col.width;

          return {
            ...col,
            width,
            showSorterTooltip: false,
            onCell: (record: T, rowIndex: number) => ({
              onMouseDown: (event: React.MouseEvent) =>
                handleCellMouseDown(event, rowIndex, colIndex),
              onMouseEnter: () => handleCellMouseEnter(rowIndex, colIndex),
              style: getCellStyle(rowIndex, colIndex),
            }),
            onHeaderCell: (column: { width: string }) => ({
              width: column.width,
              onResize: handleResize(colIndex),
            }),
            ellipsis: {
              showTitle: false,
            },
            render:
              ["lab", "video", "image", "dna"].includes(col?.key as string) &&
              !customAction
                ? (
                    text: ReactNode,
                    record: {
                      lab?: string;
                      certificate?: string;
                      id: string;
                      stock_no?: string;
                      image?: string;
                      video?: string;
                    }
                  ) => {
                    switch (col?.key) {
                      case "dna":
                        return (
                          <Link
                            className="cursor-pointer font-semibold text-primary"
                            href={`/dna/${record?.stock_no}`}
                            prefetch
                            scroll={false}
                            target="_blank"
                          >
                            DNA
                          </Link>
                        );
                      case "image":
                        return (
                          <Link
                            className="cursor-pointer font-semibold text-primary"
                            href={`${record?.image}`}
                            prefetch
                            scroll={false}
                            target="_blank"
                          >
                            Image
                          </Link>
                        );
                      case "video":
                        return (
                          <Link
                            className="cursor-pointer font-semibold text-primary"
                            href={`${record?.video}`}
                            prefetch
                            scroll={false}
                            target="_blank"
                          >
                            Video
                          </Link>
                        );
                      case "lab":
                        return (
                          <Link
                            className="cursor-pointer font-semibold text-primary"
                            href={`${record?.certificate}`}
                            prefetch
                            scroll={false}
                            target="_blank"
                          >
                            {record?.lab}
                          </Link>
                        );

                      default:
                        return null;
                    }
                  }
                : col?.render,
          };
        })
        ?.filter(
          (col): col is Exclude<typeof col, undefined> => col !== undefined
        ), // Filter out undefined values
    [columnsData, handleCellMouseDown, getCellStyle, handleResize]
  );

  const handleScrollMouseDown = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isScrollbarClicked =
      target.closest(".ant-table-body") &&
      (target.clientWidth < target?.scrollWidth ||
        target.clientHeight < target.scrollHeight);

    if (isScrollbarClicked) {
      event.stopPropagation();
    }
  };

  useEffect(() => {
    const tableElement = tableContainerRef.current;

    if (tableElement) {
      tableElement?.addEventListener(
        "mousedown",
        handleScrollMouseDown as unknown as EventListener
      );
    }

    return () => {
      if (tableElement) {
        tableElement?.removeEventListener(
          "mousedown",
          handleScrollMouseDown as unknown as EventListener
        );
      }
    };
  }, []);

  const parseValue = (value: unknown): unknown => {
    const num = Number(value);

    if (!isNaN(num)) {
      return num;
    }

    const date = new Date(value as unknown as string);

    if (!isNaN(date.getTime())) {
      return date;
    }

    return value;
  };

  const addSortersToColumns = (columns: any[]): any[] =>
    columns.map((col) => {
      if (!col.sorting) {
        return col;
      }

      return {
        ...col,
        sorter: (
          a: Record<string, unknown>,
          b: Record<string, unknown>
        ): number => {
          const aValue = parseValue(a[col?.dataIndex as string]) as
            | string
            | number
            | Date;
          const bValue = parseValue(b[col?.dataIndex as string]) as
            | string
            | number
            | Date;

          if (aValue instanceof Date && bValue instanceof Date) {
            return aValue.getTime() - bValue.getTime();
          }

          if (typeof aValue === "number" && typeof bValue === "number") {
            return aValue - bValue;
          }

          if (typeof aValue === "string" && typeof bValue === "string") {
            return aValue.localeCompare(bValue);
          }

          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        },
      };
    });

  return (
    <div
      ref={tableContainerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      <ContextMenuTriggerWrapper id={contextMenuId}>
        <ConfigProvider
          theme={{
            // Token: {
            //   borderRadius: 8,
            // },
            components: {
              Table: {
                rowSelectedBg: "var(--highlighted-color)",

                // RowHoverBg: 'var(--highlighted-color)',
              },
            },
          }}
        >
          <StyledGridTable
            bordered
            loading={loading}
            className="custom-grid-table !rounded-md"
            dataSource={dataSource as unknown as []}
            columns={
              addSortersToColumns(extendedColumns as any[]) as unknown as []
            }
            style={{ transition: "all 1s", ...style }}
            scroll={{ ...scroll, y: scroll?.y ? scroll?.y : tableHeight }}
            components={
              {
                header: {
                  cell: ResizableTitle,
                },
                ...vt,
              } as object
            }
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  description="No Data"
                  style={{
                    height: tableHeight,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              ),
            }}
            {...props}
          />
        </ConfigProvider>
      </ContextMenuTriggerWrapper>
      {dataSource && dataSource?.length > 0 && (
        <ContextMenuWrapper
          id={contextMenuId}
          className="bg-white-a700 p-2 rounded-lg shadow gap-1"
        >
          <MenuItemWrapper
            data={{ foo: "bar" }}
            className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded-sm"
            onClick={() => copySelectedText()}
          >
            Copy
          </MenuItemWrapper>
          <MenuItemWrapper
            data={{ foo: "bar" }}
            onClick={() => exportExcel(dataSource, extendedColumns as any[])}
            className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded-sm text-sm"
          >
            Export to Excel
          </MenuItemWrapper>
          <div className="border-t border-gray-300" />
          <MenuItemWrapper
            data={{ foo: "bar" }}
            onClick={() => exportCSV(dataSource, extendedColumns as any[])}
            className="cursor-pointer py-1 px-2 hover:bg-gray-100 rounded-sm text-sm"
          >
            Export to CSV
          </MenuItemWrapper>
        </ContextMenuWrapper>
      )}
    </div>
  );
};

export { GridTable };
