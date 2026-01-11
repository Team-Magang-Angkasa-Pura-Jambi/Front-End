import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, isValid } from "date-fns";
import { saveAs } from "file-saver";
import { RecapSummary } from "@/modules/UsageSummary/types/recap.type";

interface ExportOptions {
  title: string;
  subtitle?: string;
  sheetName?: string;
  headerColor?: string;
}

interface ColumnDefinition {
  header: string;
  dataKey: string;
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
  data: [],
  options: ExportOptions,
  fileName: string,
  summary?: RecapSummary,
  logoBase64?: string
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(options.sheetName || "Data");

  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 5 }];

  const PRIMARY_BLUE = "FF0D47A1";
  const WHITE = "FFFFFFFF";

  if (logoBase64) {
    const ext = logoBase64.includes("image/jpeg") ? "jpeg" : "png";
    const logoId = workbook.addImage({ base64: logoBase64, extension: ext });

    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 100, height: 40 },
    });
  }

  worksheet.mergeCells("C1:H2");
  const titleCell = worksheet.getCell("C1");
  titleCell.value = options.title;
  titleCell.font = { size: 18, bold: true, color: { argb: PRIMARY_BLUE } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };

  if (options.subtitle) {
    worksheet.mergeCells("C3:H3");
    const subCell = worksheet.getCell("C3");
    subCell.value = options.subtitle;
    subCell.font = { size: 11, italic: true };
  }

  const headerRowIndex = 5;
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.values = columns.map((c) => c.header);

  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: PRIMARY_BLUE },
    };
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  data.forEach((item) => {
    const rowValues = columns.map((col) => item[col.dataKey]);
    const dataRow = worksheet.addRow(rowValues);

    dataRow.eachCell((cell, colIndex) => {
      const colDef = columns[colIndex - 1];
      if (!colDef) return;

      const key = colDef.dataKey;

      if (key === "date") {
        cell.numFmt = "dd mmm yyyy";
      } else if (key.toLowerCase().includes("cost")) {
        cell.numFmt = '"Rp"#,##0';
      } else if (typeof cell.value === "number") {
        cell.numFmt = "#,##0.00";
      }

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  if (summary) {
    worksheet.addRow([]);
    const summaryStartRow = worksheet.rowCount + 1;

    worksheet.mergeCells(summaryStartRow, 1, summaryStartRow, 2);
    const titleCell = worksheet.getCell(summaryStartRow, 1);
    titleCell.value = "RINGKASAN EKSEKUTIF";
    titleCell.font = { bold: true, size: 12 };

    const items = [
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

    items.forEach((item) => {
      const row = worksheet.addRow([item.l, item.v]);
      row.getCell(1).font = { italic: true };
      row.getCell(2).numFmt = item.f;
      row.getCell(2).alignment = { horizontal: "right" };
    });
  }

  worksheet.columns.forEach((column) => {
    column.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

export const exportToPdf = (
  columns: ColumnDefinition[],
  data: [],
  options: ExportOptions,
  fileName: string,
  summary?: RecapSummary,
  logoBase64?: string
) => {
  const doc = new jsPDF("p", "pt", "a4") as jsPDFWithPlugin;

  const tableData = data.map((item) =>
    columns.map((col) => formatPdfValue(item[col.dataKey], col.dataKey))
  );
  const headers = columns.map((c) => c.header);

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 90,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 4 },
    headStyles: { fillColor: [13, 71, 161], halign: "center" },
    didDrawPage: (data) => {
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 450, 20, 100, 40);
      }
      doc.setFontSize(18).setTextColor(13, 71, 161).text(options.title, 40, 45);
      doc
        .setFontSize(10)
        .setTextColor(100)
        .text(options.subtitle || "", 40, 60);
    },
  });

  if (summary) {
    const finalY = (doc.lastAutoTable?.finalY || 100) + 30;

    doc.setFontSize(11).setTextColor(0).text("Ringkasan Laporan:", 40, finalY);

    autoTable(doc, {
      startY: finalY + 10,
      body: [
        [
          "Total Konsumsi",
          formatPdfValue(summary.totalConsumption, "consumption"),
        ],
        [
          "DPP (Sebelum Pajak)",
          formatPdfValue(summary.totalCostBeforeTax, "cost"),
        ],
        [
          "Total Biaya (Setelah Pajak)",
          formatPdfValue(summary.totalCost, "cost"),
        ],
        ["Total Pax", formatPdfValue(summary.totalPax, "pax")],
      ],
      theme: "plain",
      styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 150 } },
    });
  }

  doc.save(`${fileName}.pdf`);
};
