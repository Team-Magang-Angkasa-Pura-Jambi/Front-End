// lib/exportUtils.ts

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import type { RecapSummary } from "@/modules/RecapData/type";

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
    const startSummaryRow = worksheet.rowCount + 2;
    const summaryHeader = worksheet.getRow(startSummaryRow);
    summaryHeader.values = ["RINGKASAN LAPORAN"];
    summaryHeader.font = { name: "Calibri", size: 12, bold: true };
    worksheet.mergeCells(startSummaryRow, 1, startSummaryRow, 2);

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
      if (item.value !== null && item.value !== undefined && item.value > 0) {
        // Hanya tampilkan jika relevan
        const row = worksheet.addRow([item.label, item.value]);
        const labelCell = row.getCell(1);
        const valueCell = row.getCell(2);

        labelCell.font = { bold: true };
        labelCell.alignment = { horizontal: "left" };
        valueCell.numFmt = item.format;
        valueCell.alignment = { horizontal: "right" };

        labelCell.border = {
          bottom: { style: "dotted", color: { argb: "FFD0D0D0" } },
        };
        valueCell.border = {
          bottom: { style: "dotted", color: { argb: "FFD0D0D0" } },
        };
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
    column.width = Math.max(15, Math.min(50, maxLen + 4)); // Batasi lebar kolom
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

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 100,
    theme: "striped",
    tableWidth: "auto",
    columnStyles: {
      // Atur perataan kolom angka ke kanan
      consumption: { halign: "right" },
      wbp: { halign: "right" },
      lwbp: { halign: "right" },
      target: { halign: "right" },
      pax: { halign: "right" },
      avg_temp: { halign: "right" },
      cost: { halign: "right" },
      predict: { halign: "right" },
      confidence_score: { halign: "center" },
    },
    headStyles: {
      fillColor: headerColor,
      textColor: "#FFFFFF",
      fontStyle: "bold",
      halign: "center",
    },
    styles: { fontSize: 8, cellPadding: 5 },
    didDrawPage: (hookData) => {
      const { pageNumber, pageCount } = doc.internal.pages;
      // --- Header Halaman ---
      if (logoBase64) {
        const logoWidth = 105;
        const logoHeight = 45;
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.addImage(
          logoBase64,
          "PNG",
          pageWidth - hookData.settings.margin.right - logoWidth,
          30,
          logoWidth,
          logoHeight
        );
      }
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(headerColor);
      doc.text(options.title, hookData.settings.margin.left, 50);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#333333");
      doc.text(options.subtitle, hookData.settings.margin.left, 65);

      // --- Footer Halaman ---
      const pageStr = `Halaman ${pageNumber} dari ${pageCount}`;
      const footerY = doc.internal.pageSize.getHeight() - 30;
      doc.line(
        hookData.settings.margin.left,
        footerY - 10,
        doc.internal.pageSize.getWidth() - hookData.settings.margin.right,
        footerY - 10
      );
      doc.setFontSize(9);
      doc.setTextColor("#777777");
      doc.text(pageStr, doc.internal.pageSize.width / 2, footerY, {
        align: "center",
      });
    },
    // Tambahkan ringkasan setelah tabel selesai digambar
    didParseCell: (data) => {
      // Ubah perataan untuk kolom 'classification'
      if (data.column.dataKey === "classification") {
        data.cell.styles.halign = "center";
      }
    },
  });

  // --- Bagian Ringkasan Terpisah ---
  if (summary) {
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Ringkasan Laporan", 40, finalY + 40);

    const summaryItems = [
      {
        label: "Total Konsumsi:",
        value: formatDisplayValue(summary.totalConsumption, "consumption"),
      },
      {
        label: "Total WBP:",
        value: formatDisplayValue(summary.totalWbp, "wbp"),
      },
      {
        label: "Total LWBP:",
        value: formatDisplayValue(summary.totalLwbp, "lwbp"),
      },
      {
        label: "Total Target:",
        value: formatDisplayValue(summary.totalTarget, "target"),
      },
      {
        label: "Total Pax:",
        value: formatDisplayValue(summary.totalPax, "pax"),
      },
      {
        label: "Total Biaya:",
        value: formatDisplayValue(summary.totalCost, "cost"),
      },
    ];

    autoTable(doc, {
      startY: finalY + 50,
      body: summaryItems.filter(
        (item) => parseFloat(item.value.replace(/[^0-9,-]/g, "")) > 0
      ),
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: "bold" } },
    });
  }

  doc.save(`${fileName}.pdf`);
};
