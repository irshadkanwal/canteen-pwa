const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");

async function convertToWord() {
  const readmeContent = fs.readFileSync("./README.md", "utf-8");
  const lines = readmeContent.split("\n");
  const children = [];
  let inCodeBlock = false;
  let codeBlockContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        const codeText = codeBlockContent.join("\n");
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: codeText, font: "Courier New", size: 20 }),
            ],
            shading: { fill: "F5F5F5" },
            spacing: { before: 200, after: 200 },
          })
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Horizontal rule
    if (trimmed === "---") {
      children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace("# ", ""),
          heading: HeadingLevel.TITLE,
          spacing: { before: 400, after: 400 },
        })
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace("## ", ""),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        })
      );
      continue;
    }
    if (trimmed.startsWith("### ")) {
      children.push(
        new Paragraph({
          text: trimmed.replace("### ", ""),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 150 },
        })
      );
      continue;
    }

    // Lists
    if (trimmed.match(/^[-*•]\s/) || trimmed.match(/^\d+\.\s/)) {
      const listText = trimmed
        .replace(/^[-*•]\s*/, "")
        .replace(/^\d+\.\s*/, "");
      const runs = [];
      const parts = listText.split(/(\*\*.+?\*\*)/);
      parts.forEach((part) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          runs.push(
            new TextRun({ text: part.replace(/\*\*/g, ""), bold: true })
          );
        } else if (part) {
          runs.push(new TextRun({ text: part }));
        }
      });
      children.push(
        new Paragraph({
          children: runs.length > 0 ? runs : [new TextRun({ text: listText })],
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
      continue;
    }

    // Empty line
    if (trimmed === "") {
      children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      continue;
    }

    // Regular paragraph
    const runs = [];
    const parts = trimmed.split(/(\*\*.+?\*\*|`.+?`)/);
    parts.forEach((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        runs.push(new TextRun({ text: part.replace(/\*\*/g, ""), bold: true }));
      } else if (part.startsWith("`") && part.endsWith("`")) {
        runs.push(
          new TextRun({ text: part.replace(/`/g, ""), font: "Courier New" })
        );
      } else if (part) {
        runs.push(new TextRun({ text: part }));
      }
    });

    children.push(
      new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: trimmed })],
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children: children }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("./Canteen-PWA-Documentation.docx", buffer);
  console.log("✅ Word document created: Canteen-PWA-Documentation.docx");
}

convertToWord().catch(console.error);
