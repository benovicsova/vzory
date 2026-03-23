window.savePatternsToJSON = function (patterns) {
    const exportData = {
        zadania: patterns.map((p, i) => ({
            id: i + 1,
            meno_zadania: p.name,
            typ: p.type || "konstantny",
            typ_vzoru: p.patternString,
            growA: !!p.growA,
            growB: !!p.growB,
            growC: !!p.growC,
            obrazok_A: p.imageA,
            obrazok_B: p.imageB,
            obrazok_C: p.imageC,
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

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "zadania.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
                patternString: z.typ_vzoru || "ABC",
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

window.exportPatternsToHTML = function (patterns) {
    const templates = {};
    const cards = patterns.map((p, index) => {
        const templateKey = `template_${index + 1}`;

        templates[templateKey] =
            p.type === "rastuci"
                ? buildGrowingPythonTemplate(p)
                : buildConstantPythonTemplate(p);

        return `
<section class="task-card">
    <div class="task-head">
        <div>
            <div class="task-number">${index + 1}.</div>
            <h2>${window.escapeHtml(p.name || `Zadanie ${index + 1}`)}</h2>
        </div>

        <button class="download-btn" onclick="downloadTemplate('${templateKey}', '${window.escapeHtml(toSafeFileBase(p.name || `zadanie_${index + 1}`))}.py')">
            Stiahnuť .py šablónu
        </button>
    </div>

    <div class="preview-row">
        ${window.generatePreviewHTML(p)}
    </div>
</section>`;
    }).join("\n");

    const templatesJson = JSON.stringify(templates).replace(/<\/script/gi, "<\\/script");

    const htmlString = `
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Zadania</title>
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

        .download-btn:hover {
            background: #1d4ed8;
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
        <main class="task-list">
            ${cards}
        </main>
    </div>

    <script>
        const templates = ${templatesJson};

        function downloadTemplate(key, filename) {
            const content = templates[key];
            const blob = new Blob([content], { type: "text/x-python" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    </script>
</body>
</html>`;

    const blob = new Blob([htmlString], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "zadania.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

function toSafeFileBase(name) {
    return String(name || "zadanie")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase() || "zadanie";
}

function pythonValueOrNone(enabled, value) {
    return enabled ? `"${value}"` : "None";
}

function getPythonImageFileName(pattern, letter) {
    const key = `image${letter}Name`;
    const raw = pattern[key];

    if (raw && String(raw).trim()) {
        return String(raw).trim();
    }

    return null;
}

function buildPhotoImageLine(pattern, letter) {
    const filename = getPythonImageFileName(pattern, letter);

    if (filename) {
        return `obrazok${letter} = tk.PhotoImage(file="vzory_obrazky/${filename}")`;
    }

    return `# TODO: doplň názov obrázka ${letter}
obrazok${letter} = None`;
}

function buildConstantPythonTemplate(pattern) {
    const extraStart = pythonValueOrNone(pattern.startEnabled, pattern.startValue);
    const extraEnd = pythonValueOrNone(pattern.endEnabled, pattern.endValue);

    return `import tkinter as tk
import math

WIDTH = 1500
HEIGHT = 600

root = tk.Tk()
root.title("Vzor - doplň cyklus")

canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="white")
canvas.pack()

${buildPhotoImageLine(pattern, "A")}
${buildPhotoImageLine(pattern, "B")}
${buildPhotoImageLine(pattern, "C")}

VZDIALENOST_X = 5

VELKOST = obrazokA.width() if obrazokA else 50

pozicia = 0

mapa = {
    "A": obrazokA,
    "B": obrazokB,
    "C": obrazokC
}

canvas.images = [obrazokA, obrazokB, obrazokC]

# =================================================
# =================================================
#              ÚLOHA PRE ŽIAKA
# =================================================
# =================================================

vzor = "${pattern.patternString}"  # TODO: doplň vlastný vzor (napríklad "AAB")

pocet_opakovani = ${Number(pattern.repeat || 0)}  # TODO: doplň počet opakovaní vzoru

extra_zaciatok = ${extraStart}  # TODO: doplň extra znak na začiatku (ak žiadny nie je, doplň None)

extra_koniec = ${extraEnd}  # TODO: doplň extra znak na konci (ak žiadny nie je, doplň None)

# =================================================
# =================================================
#              VYKRESĽOVANIE VZORU
# =================================================
# =================================================

if extra_zaciatok and mapa[extra_zaciatok]:
    x = 50 + pozicia * (VELKOST + VZDIALENOST_X)
    y = 100
    canvas.create_image(x, y, image=mapa[extra_zaciatok])
    pozicia += 1

for opakovanie in range(pocet_opakovani):

    for i in range(len(vzor)):

        x = 50 + pozicia * (VELKOST + VZDIALENOST_X)
        y = 100

        znak = vzor[i % len(vzor)]
        if mapa[znak]:
            canvas.create_image(x, y, image=mapa[znak])

        pozicia += 1

if extra_koniec and mapa[extra_koniec]:
    x = 50 + pozicia * (VELKOST + VZDIALENOST_X)
    y = 100
    canvas.create_image(x, y, image=mapa[extra_koniec])

root.mainloop()
`;
}

function buildGrowingPythonTemplate(pattern) {
    const extraStart = pythonValueOrNone(pattern.startEnabled, pattern.startValue);
    const extraEnd = pythonValueOrNone(pattern.endEnabled, pattern.endValue);

    return `import tkinter as tk
import math

WIDTH = 600
HEIGHT = 600

root = tk.Tk()
root.title("Vzor - doplň cyklus")

canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="white")
canvas.pack()

${buildPhotoImageLine(pattern, "A")}
${buildPhotoImageLine(pattern, "B")}
${buildPhotoImageLine(pattern, "C")}

VZDIALENOST_X = 5

VELKOST = obrazokA.width() if obrazokA else 50

pozicia = 0

mapa = {
    "A": obrazokA,
    "B": obrazokB,
    "C": obrazokC
}

canvas.images = [obrazokA, obrazokB, obrazokC]

# =================================================
# =================================================
#              ÚLOHA PRE ŽIAKA
# =================================================
# =================================================

zakladny_vzor = "${pattern.patternString}"  # TODO: doplň vlastný vzor na začiatku (napríklad "AAB")

rastie_A = ${pattern.growA ? "True" : "False"}  # TODO: napíš True, ak opakovanie obrázka A rastie
rastie_B = ${pattern.growB ? "True" : "False"}  # TODO: napíš True, ak opakovanie obrázka B rastie
rastie_C = ${pattern.growC ? "True" : "False"}  # TODO: napíš True, ak opakovanie obrázka C rastie

pocet_opakovani = ${Number(pattern.repeat || 0)}  # TODO: doplň počet opakovaní vzoru

extra_zaciatok = ${extraStart}  # TODO: doplň extra znak na začiatku (ak žiadny nie je, doplň None)

extra_koniec = ${extraEnd}  # TODO: doplň extra znak na konci (ak žiadny nie je, doplň None)

# =================================================
# =================================================
#              VYKRESĽOVANIE VZORU
# =================================================
# =================================================

if extra_zaciatok and mapa[extra_zaciatok]:
    x = 50 + pozicia * (VELKOST + VZDIALENOST_X)
    y = 100
    canvas.create_image(x, y, image=mapa[extra_zaciatok])
    pozicia += 1

for opakovanie in range(1, pocet_opakovani + 1):

    for znak in zakladny_vzor:

        pocet_znakov = 1

        if znak == "A" and rastie_A:
            pocet_znakov = opakovanie

        if znak == "B" and rastie_B:
            pocet_znakov = opakovanie

        if znak == "C" and rastie_C:
            pocet_znakov = opakovanie

        for _ in range(pocet_znakov):

            x = 50 + pozicia * (VELKOST + VZDIALENOST_X)
            y = 100

            if mapa[znak]:
                canvas.create_image(x, y, image=mapa[znak])

            pozicia += 1

if extra_koniec and mapa[extra_koniec]:
    x = 50 + pozicia * (VELKOST + VZDIALENOST_X)
    y = 100
    canvas.create_image(x, y, image=mapa[extra_koniec])

root.mainloop()
`;
}