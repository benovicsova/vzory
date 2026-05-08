window.savePatternsToJSON = function (patterns, fileName = "zadania") {
    const safeName = sanitizeDownloadName(fileName);

    const exportData = {
        zadania: patterns.map((p, i) => ({
            id: i + 1,
            meno_zadania: p.name,
            typ: p.type || "konstantny",
            typ_vzoru: p.patternString,

            growA: !!p.growA,
            growB: !!p.growB,
            growC: !!p.growC,

            obrazok_A: p.imageA || null,
            obrazok_B: p.imageB || null,
            obrazok_C: p.imageC || null,

            obrazok_A_meno: p.imageAName || "",
            obrazok_B_meno: p.imageBName || "",
            obrazok_C_meno: p.imageCName || "",

            pocet_opakovani: Number(p.repeat || 0),

            startEnabled: !!p.startEnabled,
            startValue: p.startValue || "A",

            endEnabled: !!p.endEnabled,
            endValue: p.endValue || "A",

            hiddenIndices: Array.isArray(p.hiddenIndices) ? p.hiddenIndices : []
        }))
    };

    const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        { type: "application/json" }
    );

    downloadBlob(blob, `${safeName}.json`);
};

window.loadPatternsFromJSON = function (file, onSuccess, onError) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const text = String(reader.result).replace(/^\uFEFF/, "").trim();
            const data = JSON.parse(text);

            if (!data.zadania || !Array.isArray(data.zadania)) {
                throw new Error("Neplatný formát JSON");
            }

            const imported = data.zadania.map((z) => ({
                id: Date.now() + Math.random(),

                name: z.meno_zadania || "",
                type: z.typ || "konstantny",
                patternString: String(z.typ_vzoru || "ABC").toUpperCase(),

                growA: !!z.growA,
                growB: !!z.growB,
                growC: !!z.growC,

                imageA: z.obrazok_A || null,
                imageB: z.obrazok_B || null,
                imageC: z.obrazok_C || null,

                imageAName: z.obrazok_A_meno || "",
                imageBName: z.obrazok_B_meno || "",
                imageCName: z.obrazok_C_meno || "",

                repeat: z.pocet_opakovani || 3,

                startEnabled: !!z.startEnabled,
                startValue: z.startValue || "A",

                endEnabled: !!z.endEnabled,
                endValue: z.endValue || "A",

                hiddenIndices: Array.isArray(z.hiddenIndices) ? z.hiddenIndices : []
            }));

            onSuccess(imported);
        } catch (err) {
            console.error("Chyba pri načítaní JSON:", err);
            if (onError) onError(err);
        }
    };

    reader.onerror = () => {
        if (onError) onError(new Error("Nepodarilo sa prečítať súbor."));
    };

    reader.readAsText(file, "utf-8");
};

window.exportPatternsToHTML = function (patterns, fileName = "zadania") {
    const safeExportName = sanitizeDownloadName(fileName);
    const templates = {};
    const pyFiles = [];
    const imagesForDownload = collectImages(patterns);

    const cards = patterns.map((p, index) => {
        const safeBase = toSafeFileBase(p.name || `zadanie_${index + 1}`);
        const templateKey = `template_${index + 1}`;
        const pyFileName = `${safeBase}.py`;

        const pyContent = buildStudentTemplate(p);

        templates[templateKey] = pyContent;
        pyFiles.push({ name: pyFileName, content: pyContent });

        return `
<section class="task-card">
    <div class="task-head">
        <div>
            <div class="task-number">${index + 1}.</div>
            <h2>${window.escapeHtml(p.name || `Zadanie ${index + 1}`)}</h2>
        </div>

        <button class="download-btn" onclick="downloadTemplate('${templateKey}', '${window.escapeHtml(pyFileName)}')">
            Stiahnuť .py šablónu
        </button>
    </div>

    <div class="preview-row">
        ${window.generatePreviewHTML(p)}
    </div>
</section>`;
    }).join("\n");

    const templatesJson = JSON.stringify(templates).replace(/<\/script/gi, "<\\/script");
    const imagesJson = JSON.stringify(imagesForDownload).replace(/<\/script/gi, "<\\/script");
    const pyFilesJson = JSON.stringify(pyFiles).replace(/<\/script/gi, "<\\/script");
    const exportNameJson = JSON.stringify(safeExportName).replace(/<\/script/gi, "<\\/script");

    const htmlString = `
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${window.escapeHtml(safeExportName)}</title>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f7fb;
            color: #1f2937;
        }

        .page {
            max-width: 1200px;
            margin: 0 auto;
            padding: 32px 20px 60px;
        }

        .top-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .top-btn,
        .download-btn {
            border: none;
            background: #2563eb;
            color: white;
            border-radius: 12px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
            white-space: nowrap;
        }

        .top-btn:hover,
        .download-btn:hover {
            background: #1d4ed8;
        }

        .task-list {
            display: grid;
            gap: 18px;
        }

        .task-card {
            background: white;
            border-radius: 18px;
            padding: 22px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }

        .task-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 14px;
        }

        .task-head h2 {
            margin: 4px 0 6px 0;
            font-size: 24px;
        }

        .task-number {
            font-weight: bold;
            color: #2563eb;
            font-size: 18px;
        }

        .preview-row {
            overflow-x: auto;
            padding-top: 6px;
        }

        @media (max-width: 700px) {
            .task-head {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>

<body>
    <div class="page">
        <div class="top-actions">
            <button class="top-btn" onclick="downloadAllTogether()">Stiahnuť všetko spolu</button>
            <button class="top-btn" onclick="downloadImagesOnly()">Stiahnuť obrázky</button>
        </div>

        <main class="task-list">
            ${cards}
        </main>
    </div>

    <script>
        const templates = ${templatesJson};
        const pyFiles = ${pyFilesJson};
        const images = ${imagesJson};
        const exportFileName = ${exportNameJson};

        function dataUrlToBlob(dataUrl) {
            if (!dataUrl || typeof dataUrl !== "string") {
                return null;
            }

            if (!dataUrl.startsWith("data:")) {
                return null;
            }

            const parts = dataUrl.split(",");

            if (parts.length !== 2) {
                return null;
            }

            const mimeMatch = parts[0].match(/data:(.*?);base64/);

            if (!mimeMatch) {
                return null;
            }

            const mime = mimeMatch[1];
            const binary = atob(parts[1]);
            const bytes = new Uint8Array(binary.length);

            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            return new Blob([bytes], { type: mime });
        }

        function downloadBlobFromStudentPage(blob, filename) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        function downloadTemplate(key, filename) {
            const content = templates[key];
            const blob = new Blob([content], { type: "text/x-python;charset=utf-8" });

            downloadBlobFromStudentPage(blob, filename);
        }

        async function downloadImagesOnly() {
            const zip = new JSZip();
            const folder = zip.folder("vzory_obrazky");

            let count = 0;

            images.forEach((img) => {
                const blob = dataUrlToBlob(img.data);

                if (blob && img.name) {
                    folder.file(img.name, blob);
                    count++;
                }
            });

            if (count === 0) {
                alert("V exporte nie sú žiadne reálne obrázky. Treba ich znova vybrať cez formulár.");
                return;
            }

            const blob = await zip.generateAsync({ type: "blob" });
            downloadBlobFromStudentPage(blob, exportFileName + "_obrazky.zip");
        }

        async function downloadAllTogether() {
            const zip = new JSZip();

            const templatesFolder = zip.folder("python_sablony");
            const imagesFolder = zip.folder("vzory_obrazky");

            pyFiles.forEach((file) => {
                templatesFolder.file(file.name, file.content);
            });

            let imageCount = 0;

            images.forEach((img) => {
                const blob = dataUrlToBlob(img.data);

                if (blob && img.name) {
                    imagesFolder.file(img.name, blob);
                    imageCount++;
                }
            });

            if (imageCount === 0) {
                alert(
                    "ZIP sa vytvorí, ale priečinok vzory_obrazky bude prázdny, pretože v exporte nie sú uložené reálne dáta obrázkov."
                );
            }

            const blob = await zip.generateAsync({ type: "blob" });
            downloadBlobFromStudentPage(blob, exportFileName + ".zip");
        }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlString], { type: "text/html;charset=utf-8" });
    downloadBlob(blob, `${safeExportName}.html`);
};

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeDownloadName(name) {
    return String(name || "zadania")
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, "_") || "zadania";
}

function collectImages(patterns) {
    const result = [];
    const seen = new Set();

    patterns.forEach((pattern) => {
        ["A", "B", "C"].forEach((letter) => {
            const data = pattern["image" + letter];
            const originalName = pattern["image" + letter + "Name"];

            if (!data || !originalName) {
                return;
            }

            if (typeof data !== "string" || !data.startsWith("data:image/")) {
                return;
            }

            const safeName = sanitizeImageFileName(originalName);

            if (!seen.has(safeName)) {
                seen.add(safeName);
                result.push({
                    name: safeName,
                    data: data
                });
            }
        });
    });

    return result;
}

function sanitizeImageFileName(name) {
    const cleaned = String(name || "obrazok.png")
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, "_");

    return cleaned || "obrazok.png";
}

function imageNameWithoutExtension(name) {
    return sanitizeImageFileName(name).replace(/\.[^/.]+$/, "");
}

function toSafeFileBase(name) {
    return String(name || "zadanie")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase() || "zadanie";
}

function getSelectedImageFileName(pattern, letter) {
    const name = pattern["image" + letter + "Name"];

    if (name && String(name).trim()) {
        return sanitizeImageFileName(name);
    }

    return null;
}

function getSelectedImageBaseName(pattern, letter) {
    const name = getSelectedImageFileName(pattern, letter);

    if (name) {
        return imageNameWithoutExtension(name);
    }

    return null;
}

function buildImageNamesArray(pattern) {
    const a = getSelectedImageBaseName(pattern, "A") || "obrazokA";
    const b = getSelectedImageBaseName(pattern, "B") || "obrazokB";
    const c = getSelectedImageBaseName(pattern, "C") || "obrazokC";

    return JSON.stringify([a, b, c]);
}

function buildStudentTemplate(pattern) {
    const imageNames = buildImageNamesArray(pattern);

    return `import tkinter as tk
import math

WIDTH = 1500
HEIGHT = 600

root = tk.Tk()
root.title("Vzor - doplň cyklus")

canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="white")
canvas.pack()

canvas.images = []

nazvy = ${imageNames}

for nazov in nazvy:
    canvas.images.append(
        tk.PhotoImage(file="../vzory_obrazky/" + nazov + ".png")
    )

obrazokA = canvas.images[0]
obrazokB = canvas.images[1]
obrazokC = canvas.images[2]

VZDIALENOST_X = 5

VELKOST = canvas.images[0].width() if canvas.images else 50

pozicia = 0

pocet_opakovani = 0

# ----------------------------------------
# TU UPRAV PROGRAM
# ----------------------------------------

for i in range(pocet_opakovani):

    x = 50 + pozicia * (VELKOST + VZDIALENOST_X)
    y = 100

    canvas.create_image(x, y, image=obrazokA)

    pozicia += 1


root.mainloop()
`;
}