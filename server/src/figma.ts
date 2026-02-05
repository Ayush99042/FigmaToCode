import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const figmaCache = new Map<string, any>();

function rgbToHex(color: any) {
  if (!color) return undefined;
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function getCleanFigmaData(node: any): any {
  if (!node) return null;

  const box = node.absoluteBoundingBox;

  const solidFill = node.fills?.find((f: any) => f.type === "SOLID");
  const stroke = node.strokes?.find((s: any) => s.type === "SOLID");

  return {
    name: node.name,
    type: node.type,
    characters: node.characters,

    width: box?.width ? Math.round(box.width) : undefined,
    height: box?.height ? Math.round(box.height) : undefined,

    isImage:
      node.type === "RECTANGLE" &&
      node.fills?.some((f: any) => f.type === "IMAGE"),

    layout: {
      mode: node.layoutMode,
      gap: node.itemSpacing,
      padding: {
        t: node.paddingTop,
        r: node.paddingRight,
        b: node.paddingBottom,
        l: node.paddingLeft,
      },
    },

    style: {
      fontSize: node.style?.fontSize,
      fontWeight: node.style?.fontWeight,
      radius: node.cornerRadius,

      backgroundColor: rgbToHex(solidFill?.color),
      textColor: node.type === "TEXT" ? rgbToHex(solidFill?.color) : undefined,
      borderColor: rgbToHex(stroke?.color),
      borderWidth: node.strokeWeight,
    },

    children: node.children
      ? node.children.map(getCleanFigmaData).filter(Boolean)
      : [],
  };
}

router.get("/file/:fileKey", async (req, res) => {
  try {
    let { fileKey } = req.params;

    if (fileKey.includes("figma.com")) {
      const match = fileKey.match(/file\/([^/?]+)/);
      if (match) fileKey = match[1];
    }

    if (figmaCache.has(fileKey)) {
      return res.json(figmaCache.get(fileKey));
    }

    const figmaRes = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        "X-Figma-Token": process.env.FIGMA_TOKEN!,
      },
    });

    if (!figmaRes.ok) {
      const error = await figmaRes.json();
      return res.status(figmaRes.status).json(error);
    }

    const rawData: any = await figmaRes.json();
    const firstPage = rawData.document.children[0];
    const firstFrame = firstPage.children[0];

    const figmaJson = getCleanFigmaData(firstFrame);
    const payload = { figmaJson };

    figmaCache.set(fileKey, payload);
    return res.json(payload);
  } catch (err: any) {
    console.error("Figma Fetch Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch Figma file",
    });
  }
});

export default router;
