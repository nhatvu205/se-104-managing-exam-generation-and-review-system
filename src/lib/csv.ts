function rowsToObjects(rows: string[][]) {
  if (!rows.length) return { headers: [], data: [] as Record<string, string>[] };
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim());
  const data = rows.slice(1).map((values) =>
    headers.reduce((acc, header, index) => {
      acc[header] = values[index] || '';
      return acc;
    }, {} as Record<string, string>),
  );

  return { headers, data };
}

function detectDelimiter(text: string) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0) || '';
  const candidates = [',', ';', '\t'];
  const counts = candidates.map((delimiter) => ({
    delimiter,
    count: firstLine.split(delimiter).length,
  }));
  return counts.sort((a, b) => b.count - a.count)[0]?.delimiter || ',';
}

export function parseCsv(text: string, delimiter = detectDelimiter(text)) {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(current.trim());
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current.trim());
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  row.push(current.trim());
  if (row.some((cell) => cell.length > 0)) rows.push(row);

  return rowsToObjects(rows);
}

function parseHtmlTable(text: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const rowNodes = Array.from(doc.querySelectorAll('table tr'));
  const rows = rowNodes
    .map((rowNode) =>
      Array.from(rowNode.querySelectorAll('th,td')).map((cell) => (cell.textContent || '').trim()),
    )
    .filter((row) => row.some((cell) => cell.length > 0));
  return rowsToObjects(rows);
}

function parseExcelXml(text: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('File Excel XML không hợp lệ.');

  const rowNodes = Array.from(doc.getElementsByTagName('Row'));
  const rows = rowNodes.map((rowNode) => {
    const values: string[] = [];
    Array.from(rowNode.getElementsByTagName('Cell')).forEach((cellNode) => {
      const indexAttr = cellNode.getAttribute('ss:Index') || cellNode.getAttribute('Index');
      if (indexAttr) {
        const targetIndex = Math.max(1, Number(indexAttr)) - 1;
        while (values.length < targetIndex) values.push('');
      }
      const dataNode = cellNode.getElementsByTagName('Data')[0];
      values.push((dataNode?.textContent || '').trim());
    });
    return values;
  }).filter((row) => row.some((cell) => cell.length > 0));

  return rowsToObjects(rows);
}

export function parseSpreadsheetText(text: string) {
  const normalized = text.trimStart();
  if (!normalized) return { headers: [], data: [] as Record<string, string>[] };

  if (normalized.startsWith('<')) {
    if (/urn:schemas-microsoft-com:office:spreadsheet/i.test(normalized) || /<Workbook/i.test(normalized)) {
      return parseExcelXml(text);
    }
    if (/<table/i.test(normalized)) {
      return parseHtmlTable(text);
    }
  }

  return parseCsv(text);
}

export function downloadCsv(filename: string, content: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadDoc(filename: string, title: string, bodyHtml: string) {
  const html = `<!DOCTYPE html>
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
        h1, h2, h3 { margin: 0 0 12px; }
        p { margin: 0 0 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 8px; vertical-align: top; text-align: left; }
        ul, ol { margin: 8px 0; }
      </style>
    </head>
    <body>${bodyHtml}</body>
  </html>`;

  const blob = new Blob(['\uFEFF', html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readCsvFile(file: File) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder('utf-8').decode(bytes);

  if (!utf8.includes('�')) return utf8;

  try {
    return new TextDecoder('windows-1258').decode(bytes);
  } catch {
    return utf8;
  }
}

export async function readSpreadsheetFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (extension === 'xlsx') {
    throw new Error('Hiện hệ thống hỗ trợ import Excel dạng XML 2003 / XLS văn bản / CSV xuất từ Excel. Vui lòng lưu file Excel thành XML Spreadsheet 2003 hoặc CSV rồi import.');
  }

  const text = await readCsvFile(file);
  if (extension === 'xls') {
    const normalized = text.trimStart().toLowerCase();
    const looksLikeTextExcel = normalized.startsWith('<') || normalized.includes('\t') || normalized.includes(',') || normalized.includes(';');
    if (!looksLikeTextExcel) {
      throw new Error('File .xls hiện tại không ở dạng văn bản mà hệ thống có thể đọc. Vui lòng dùng template Excel từ hệ thống hoặc lưu lại file dưới dạng XML Spreadsheet 2003 / CSV rồi import.');
    }
  }

  const parsed = parseSpreadsheetText(text);
  if (!parsed.headers.length) {
    throw new Error('File import không có dữ liệu hợp lệ hoặc không đúng định dạng template lớp học.');
  }
  return parsed;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadExcelXml(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
  worksheetName = 'Sheet1',
) {
  const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${escapeXml(worksheetName)}">
    <Table>
      <Row>
        ${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(String(header))}</Data></Cell>`).join('')}
      </Row>
      ${rows.map((row) => `
      <Row>
        ${row.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(String(cell ?? ''))}</Data></Cell>`).join('')}
      </Row>`).join('')}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob(['\uFEFF', xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
