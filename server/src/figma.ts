import express from "express";

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

function findFirstFrame(node: any): any {
  if (!node) return null;
  if (node.type === "FRAME" || node.type === "SECTION" || node.type === "COMPONENT") return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findFirstFrame(child);
      if (found) return found;
    }
  }
  return null;
}

router.get("/file/:fileKey", async (req, res) => {
  try {
    let { fileKey } = req.params;
    let nodeId: string | null = null;

    // Support full URLs and extract fileKey and nodeId
    if (fileKey.includes("figma.com")) {
      const url = new URL(decodeURIComponent(fileKey));
      const match = url.pathname.match(/(?:file|design)\/([^/]+)/);
      if (match) fileKey = match[1];
      nodeId = url.searchParams.get("node-id");
    }

    const cacheKey = `${fileKey}${nodeId ? `-${nodeId}` : ""}`;
    if (figmaCache.has(cacheKey)) {
      return res.json(figmaCache.get(cacheKey));
    }

    // 1. Fetch file/node data
    const url = nodeId
      ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
      : `https://api.figma.com/v1/files/${fileKey}`;

    const figmaRes = await fetch(url, {
      headers: { "X-Figma-Token": process.env.FIGMA_TOKEN! },
    });

    if (!figmaRes.ok) {
      const error = await figmaRes.json();
      return res.status(figmaRes.status).json(error);
    }

    const rawData: any = await figmaRes.json();
    let targetNode: any = null;

    if (nodeId) {
      // If we requested a specific node, get it
      const nodes = rawData.nodes || {};
      const nodeData = nodes[nodeId] || Object.values(nodes)[0];
      targetNode = nodeData?.document;
    } else {
      // Otherwise find the first frame in the whole document
      targetNode = findFirstFrame(rawData.document);
    }

    if (!targetNode) {
      return res.status(404).json({ error: "No valid Frame found in this file/node." });
    }

    // 2. Fetch image for the frame
    const imageRes = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${targetNode.id}&format=png`,
      {
        headers: { "X-Figma-Token": process.env.FIGMA_TOKEN! },
      }
    );

    let figmaImageBase64 = null;
    if (imageRes.ok) {
      const imageData: any = await imageRes.json();
      const imageUrl = imageData.images[targetNode.id];
      if (imageUrl) {
        const imgBufferRes = await fetch(imageUrl);
        if (imgBufferRes.ok) {
          const arrayBuffer = await imgBufferRes.arrayBuffer();
          figmaImageBase64 = Buffer.from(arrayBuffer).toString("base64");
        }
      }
    }

    const figmaJson = getCleanFigmaData(targetNode);
    const payload = { figmaJson, figmaImageBase64 };

    figmaCache.set(cacheKey, payload);
    return res.json(payload);
  } catch (err: any) {
    console.error("Figma Fetch Error:", err.message);
    return res.status(500).json({
      error: "Failed to fetch Figma file. Check terminal for details.",
    });
  }
});

export default router;
