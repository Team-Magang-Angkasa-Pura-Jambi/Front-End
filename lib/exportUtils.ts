// lib/exportUtils.ts

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { RecapSummary } from "@/types/recap.types"; // Pastikan path ini benar

// --- Definisi Tipe Data ---
interface PdfOptions {
  title: string;
  subtitle: string;
  headerColor: string;
}

interface ColumnDefinition {
  header: string;
  dataKey: string;
}

// --- Helper untuk Format ---
const formatDisplayValue = (value: unknown, key: string): string => {
  if (value === null || value === undefined) return "-";

  if (key === "date" && (value instanceof Date || typeof value === "string")) {
    return format(new Date(value), "d MMM yyyy");
  }

  const num = Number(value);
  if (isNaN(num)) return value.toString();

  // Format angka desimal untuk PDF
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// ====================================================================
// EXCEL EXPORT (VERSI KORPORAT)
// ====================================================================
export const exportToExcel = async (
  columns: ColumnDefinition[],
  data: any[],
  options: { title: string; sheetName: string },
  fileName: string,
  summary?: RecapSummary,
  logoBase64?: string
) => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sentinel Platform";
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet(options.sheetName, {
    views: [{ state: "frozen", ySplit: 5 }], // Bekukan 5 baris teratas (header)
  });

  // --- Branding & Header ---
  const headerFillColor = "FF0D47A1"; // Biru korporat
  const fontColorLight = "FFFFFFFF";

  worksheet.mergeCells("C1:H2");
  const titleCell = worksheet.getCell("C1");
  titleCell.value = options.title;
  titleCell.font = {
    name: "Calibri",
    size: 20,
    bold: true,
    color: { argb: headerFillColor },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };

  if (logoBase64) {
    const logoId = workbook.addImage({ base64: logoBase64, extension: "png" });
    worksheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 140, height: 50 },
    });
  }

  // --- Header Tabel ---
  const headerRow = worksheet.addRow(columns.map((c) => c.header));
  headerRow.height = 30;
  headerRow.font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: fontColorLight },
  };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: headerFillColor },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // --- Baris Data & Format Angka Cerdas ---
  data.forEach((item) => {
    const rowValues = columns.map((col) => item[col.dataKey]); // Kirim angka mentah
    const dataRow = worksheet.addRow(rowValues);
    dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = columns[colNumber - 1].dataKey;
      if (key === "date") {
        cell.numFmt = "d mmmm yyyy";
      } else if (typeof cell.value === "number") {
        cell.numFmt = key === "cost" ? '"Rp"#,##0' : "#,##0.00";
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  // --- Baris Ringkasan (Total) ---
  if (summary) {
    worksheet.addRow([]); // Spasi
    const summaryHeader = worksheet.addRow(["RINGKASAN LAPORAN"]);
    summaryHeader.font = { name: "Calibri", size: 12, bold: true };
    worksheet.mergeCells(summaryHeader.number, 1, summaryHeader.number, 3);

    // Definisikan ringkasan
    const summaryItems = [
      {
        label: "Total Konsumsi",
        value: summary.totalConsumption,
        format: "#,##0.00",
      },
      { label: "Total WBP", value: summary.totalWbp, format: "#,##0.00" },
      { label: "Total LWBP", value: summary.totalLwbp, format: "#,##0.00" },
      { label: "Total Target", value: summary.totalTarget, format: "#,##0.00" },
      { label: "Total Pax", value: summary.totalPax, format: "#,##0" },
      { label: "Total Biaya", value: summary.totalCost, format: '"Rp"#,##0' },
    ];

    summaryItems.forEach((item) => {
      if (item.value > 0) {
        // Hanya tampilkan jika relevan
        const row = worksheet.addRow([item.label, item.value]);
        row.getCell(1).font = { bold: true };
        row.getCell(2).numFmt = item.format;
        row.getCell(2).alignment = { horizontal: "right" };
      }
    });
  }

  // --- Auto-fit Kolom ---
  worksheet.columns.forEach((column) => {
    let maxLen = 0;
    column.eachCell!({ includeEmpty: true }, (cell) => {
      const len = cell.value?.toString().length ?? 10;
      if (len > maxLen) maxLen = len;
    });
    column.width = maxLen < 15 ? 15 : maxLen + 4;
  });

  // --- Simpan File ---
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
};

// ====================================================================
// PDF EXPORT (VERSI KORPORAT)
// ====================================================================
export const exportToPdf = (
  columns: ColumnDefinition[],
  data: any[],
  options: PdfOptions,
  fileName: string,
  summary?: RecapSummary,
  logoBase64?: string
) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF("p", "pt"); // Gunakan point (pt) untuk kontrol lebih baik
  const tableData = data.map((item) =>
    columns.map((col) => formatDisplayValue(item[col.dataKey], col.dataKey))
  );
  const tableHeaders = columns.map((col) => col.header);

  const headerColor = options.headerColor || "#0D47A1";

  // --- Menambahkan Baris Ringkasan ke Data Tabel ---
  const body = [...tableData];
  if (summary) {
    const summaryRow: any[] = [];
    columns.forEach((col, index) => {
      let content = "";
      if (index === 0) {
        content = "TOTAL";
      } else if (
        summary.hasOwnProperty(
          `total${col.dataKey.charAt(0).toUpperCase() + col.dataKey.slice(1)}`
        )
      ) {
        content = formatDisplayValue(
          (summary as any)[`total${col.dataKey}`],
          col.dataKey
        );
      } else if (
        summary.hasOwnProperty(
          `total${col.dataKey.charAt(0).toUpperCase() + col.dataKey.slice(1)}`
        )
      ) {
        content = formatDisplayValue(
          (summary as any)[`total${col.dataKey}`],
          col.dataKey
        );
      } else if (col.dataKey.toLowerCase().includes("consumption")) {
        content = formatDisplayValue(summary.totalConsumption, "consumption");
      }

      summaryRow.push({
        content,
        styles: { fontStyle: "bold", halign: index === 0 ? "left" : "right" },
      });
    });
    body.push(summaryRow);
  }

  autoTable(doc, {
    head: [tableHeaders],
    body: body,
    startY: 100,
    theme: "striped",
    headStyles: {
      fillColor: headerColor,
      textColor: "#FFFFFF",
      fontStyle: "bold",
      halign: "center",
    },
    styles: { fontSize: 8, cellPadding: 5 },
    didDrawPage: (data) => {
      // --- Header Halaman ---
      if (logoBase64) {
        const logoWidth = 105;
        const logoHeight = 45;
        const pageWidth = doc.internal.pageSize.width;
        doc.addImage(
          logoBase64,
          "PNG",
          pageWidth - data.settings.margin.right - logoWidth,
          30,
          logoWidth,
          logoHeight
        );
      }
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(headerColor);
      doc.text(options.title, data.settings.margin.left, 50);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      doc.text(options.subtitle, data.settings.margin.left, 65);

      // --- Footer Halaman ---
      const pageStr = `Halaman ${data.pageNumber}`;
      doc.setFontSize(9);
      doc.setTextColor("#777777");
      doc.text(
        pageStr,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 20,
        { align: "center" }
      );
    },
  });

  doc.save(`${fileName}.pdf`);
};
