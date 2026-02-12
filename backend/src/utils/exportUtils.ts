const escapeCsvValue = (value: string) => {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const toCsv = (rows: Record<string, unknown>[], columns?: string[]) => {
  if (rows.length === 0) {
    return "";
  }

  const header = columns ?? (rows[0] ? Object.keys(rows[0] as Record<string, unknown>) : []);

  const lines = [header.join(",")];

  for (const row of rows) {
    const line = header
      .map((key) => {
        const value = row[key];
        if (value === null || value === undefined) {
          return "";
        }
        if (typeof value === "string") {
          return escapeCsvValue(value);
        }
        if (typeof value === "number" || typeof value === "boolean") {
          return String(value);
        }
        return escapeCsvValue(JSON.stringify(value));
      })
      .join(",");

    lines.push(line);
  }

  return lines.join("\n");
};
