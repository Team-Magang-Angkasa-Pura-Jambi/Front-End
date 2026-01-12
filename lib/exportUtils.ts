import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, isValid } from "date-fns";
import { saveAs } from "file-saver";
import {
  RecapDataRow,
  RecapSummary,
} from "@/modules/UsageSummary/types/recap.type";

interface ExportOptions {
  title: string;
  subtitle?: string;
  sheetName?: string;
  headerColor?: string;
}

interface ColumnDefinition {
  header: string;
  dataKey: keyof RecapDataRow;
}

interface jsPDFWithPlugin extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPdfValue = (value: unknown, key: string): string => {
  if (value === null || value === undefined) return "-";

  if (key === "date") {
    const date = new Date(value as string | number | Date);
    return isValid(date) ? format(date, "d MMM yyyy") : "-";
  }

  const num = Number(value);
  if (isNaN(num)) return String(value);

  if (key === "cost" || key.toLowerCase().includes("cost")) {
    return currencyFormatter.format(num);
  }

  return numberFormatter.format(num);
};

export const exportToExcel = async (
  columns: ColumnDefinition[],
  data: RecapDataRow[],
  options: ExportOptions,
  fileName: string,
  summary?: RecapSummary,
  logoBase64?: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName || "Data");

  worksheet.views = [
    { state: "frozen", xSplit: 0, ySplit: 5, showGridLines: false },
  ];

  const PRIMARY_BLUE = "FF0D47A1";
  const LIGHT_BLUE = "FFF1F4F9";
  const WHITE = "FFFFFFFF";

  if (logoBase64) {
    const ext = logoBase64.includes("image/jpeg") ? "jpeg" : "png";
    const logoId = workbook.addImage({ base64: logoBase64, extension: ext });
    worksheet.addImage(logoId, {
      tl: { col: 0.1, row: 0.2 },
      ext: { width: 100, height: 45 },
    });
  }

  worksheet.mergeCells("C1:H2");
  const titleCell = worksheet.getCell("C1");
  titleCell.value = options.title.toUpperCase();
  titleCell.font = { size: 16, bold: true, color: { argb: PRIMARY_BLUE } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };

  if (options.subtitle) {
    worksheet.mergeCells("C3:H3");
    const subCell = worksheet.getCell("C3");
    subCell.value = options.subtitle;
    subCell.font = { size: 10, italic: true, color: { argb: "FF666666" } };
    subCell.alignment = { vertical: "middle", horizontal: "left" };
  }

  const headerRow = worksheet.getRow(5);
  headerRow.values = columns.map((c) => c.header);
  headerRow.height = 35;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: PRIMARY_BLUE },
    };
    cell.font = { bold: true, color: { argb: WHITE }, size: 11 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { right: { style: "thin", color: { argb: WHITE } } };
  });

  data.forEach((item, index) => {
    const rowValues = columns.map((col) => item[col.dataKey]);
    const dataRow = worksheet.addRow(rowValues);
    dataRow.height = 22;

    dataRow.eachCell((cell, colIndex) => {
      const colDef = columns[colIndex - 1];
      if (!colDef) return;

      const key = colDef.dataKey as string;

      if (index % 2 !== 0) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: LIGHT_BLUE },
        };
      }

      if (key === "date") {
        cell.numFmt = "dd mmm yyyy";
        cell.alignment = { horizontal: "center" };
      } else if (
        key.toLowerCase().includes("cost") ||
        key.toLowerCase().includes("price")
      ) {
        cell.numFmt = '"Rp"#,##0';
        cell.alignment = { horizontal: "right" };
      } else if (typeof cell.value === "number") {
        cell.numFmt = "#,##0.00";
        cell.alignment = { horizontal: "right" };
      }

      cell.border = { bottom: { style: "thin", color: { argb: "FFEEEEEE" } } };
    });
  });

  worksheet.columns.forEach((column, i) => {
    let maxCharLength = 0;
    const headerText = columns[i].header;
    maxCharLength = headerText.length;

    data.slice(0, 50).forEach((row) => {
      const val = row[columns[i].dataKey];
      const len = val ? val.toString().length : 0;
      if (len > maxCharLength) maxCharLength = len;
    });

    column.width = maxCharLength < 15 ? 15 : maxCharLength + 5;
  });

  if (summary) {
    worksheet.addRow([]);
    const summaryRow = worksheet.addRow(["RINGKASAN EKSEKUTIF"]);
    summaryRow.getCell(1).font = {
      bold: true,
      size: 12,
      color: { argb: PRIMARY_BLUE },
    };

    const summaryItems = [
      { l: "Total Konsumsi", v: summary.totalConsumption, f: "#,##0.00" },
      {
        l: "DPP (Sebelum Pajak)",
        v: summary.totalCostBeforeTax,
        f: '"Rp"#,##0',
      },
      {
        l: "Total Biaya (Setelah Pajak)",
        v: summary.totalCost,
        f: '"Rp"#,##0',
      },
      { l: "Total Pax", v: summary.totalPax, f: "#,##0" },
    ];

    summaryItems.forEach((item) => {
      const row = worksheet.addRow([item.l, item.v]);
      row.getCell(1).font = { italic: true };
      row.getCell(2).numFmt = item.f;
      row.getCell(2).font = { bold: true };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

export const exportToPdf = (
  columns: ColumnDefinition[],
  data: RecapDataRow[],
  options: ExportOptions,
  fileName: string,
  summary?: RecapSummary,
  logoBase64?: string
) => {
  const orientation = columns.length > 7 ? "l" : "p";
  const doc = new jsPDF(orientation, "pt", "a4") as jsPDFWithPlugin;

  const tableData = data.map((item) =>
    columns.map((col) =>
      formatPdfValue(item[col.dataKey], col.dataKey as string)
    )
  );

  const headers = columns.map((c) => c.header);

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 100,
    theme: "striped",
    styles: {
      fontSize: columns.length > 8 ? 7 : 8,
      cellPadding: 5,
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [13, 71, 161],
      halign: "center",
      fontStyle: "bold",
    },

    columnStyles: {},
    didDrawPage: () => {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 40, 25, 70, 35);
      }
      doc
        .setFontSize(16)
        .setTextColor(13, 71, 161)
        .setFont("helvetica", "bold");
      doc.text(options.title, 120, 45);

      doc.setFontSize(9).setFont("helvetica", "italic").setTextColor(100);
      doc.text(options.subtitle || "", 120, 60);

      doc
        .setDrawColor(13, 71, 161)
        .setLineWidth(1.5)
        .line(40, 80, doc.internal.pageSize.width - 40, 80);
    },
  });

  if (summary) {
    const finalY = (doc.lastAutoTable?.finalY || 100) + 30;

    doc
      .setFontSize(12)
      .setTextColor(13, 71, 161)
      .text("RINGKASAN EKSEKUTIF", 40, finalY);

    autoTable(doc, {
      startY: finalY + 10,
      margin: { left: 40 },
      tableWidth: 250,
      body: [
        [
          "Total Konsumsi",
          formatPdfValue(summary.totalConsumption, "consumption"),
        ],
        [
          "DPP (Sebelum Pajak)",
          formatPdfValue(summary.totalCostBeforeTax, "cost"),
        ],
        ["Total Biaya", formatPdfValue(summary.totalCost, "cost")],
        ["Total Pax", formatPdfValue(summary.totalPax, "pax")],
      ],
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        1: { halign: "right", fontStyle: "bold" },
      },
    });
  }

  doc.save(`${fileName}.pdf`);
};
