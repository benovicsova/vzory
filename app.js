const { useState, useRef, useEffect } = React;

function App() {
    const emptyForm = {
        id: null,
        name: "",
        type: "konstantny",
        patternString: "ABC",

        growA: false,
        growB: false,
        growC: false,

        imageA: null,
        imageB: null,
        imageC: null,

        repeat: 3,

        startEnabled: false,
        startValue: "A",

        endEnabled: false,
        endValue: "A"
    };

    const [patterns, setPatterns] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);

    const listRef = useRef(null);
    const fileLoadRef = useRef(null);
    const sortableRef = useRef(null);

    const fileRefs = {
        A: useRef(null),
        B: useRef(null),
        C: useRef(null)
    };

    /* ---------------- DRAG & DROP ---------------- */

    useEffect(() => {
        if (!listRef.current) return;

        if (sortableRef.current) {
            sortableRef.current.destroy();
        }

        sortableRef.current = new Sortable(listRef.current, {
            animation: 150,
            draggable: ".sortable-item",
            handle: ".drag-handle",
            onEnd: (evt) => {
                if (evt.oldIndex === evt.newIndex) return;

                setPatterns((prev) => {
                    const updated = [...prev];
                    const [moved] = updated.splice(evt.oldIndex, 1);
                    updated.splice(evt.newIndex, 0, moved);
                    return updated;
                });
            }
        });

        return () => {
            if (sortableRef.current) {
                sortableRef.current.destroy();
                sortableRef.current = null;
            }
        };
    }, [patterns.length]);

    /* ---------------- PREVIEW ---------------- */

    function generatePreview(pattern) {
        if (!pattern.patternString) return null;

        const images = {
            A: pattern.imageA,
            B: pattern.imageB,
            C: pattern.imageC
        };

        let sequence = [];

        if (pattern.startEnabled) {
            sequence.push(pattern.startValue);
        }

        for (let r = 0; r < Number(pattern.repeat || 0); r++) {
            for (let char of pattern.patternString) {
                sequence.push(char);
            }
        }

        if (pattern.endEnabled) {
            sequence.push(pattern.endValue);
        }

        return sequence.map((char, i) => {
            const src = images[char];

            if (src) {
                return (
                    <img
                        key={i}
                        src={src}
                        alt={char}
                        style={{
                            height: 50,
                            marginRight: 10
                        }}
                    />
                );
            }

            return (
                <div
                    key={i}
                    style={{
                        height: 50,
                        width: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "18px",
                        border: "1px dashed #aaa",
                        marginRight: 10
                    }}
                >
                    {char}
                </div>
            );
        });
    }

    /* ---------------- SAVE JSON ---------------- */

    function saveToJSON() {
        const exportData = {
            zadania: patterns.map((p, i) => ({
                id: i + 1,
                meno_zadania: p.name,
                typ_vzoru: p.patternString,
                obrazok_A: p.imageA,
                obrazok_B: p.imageB,
                obrazok_C: p.imageC,
                pocet_opakovani: Number(p.repeat || 0),
                startEnabled: !!p.startEnabled,
                startValue: p.startValue || "A",
                endEnabled: !!p.endEnabled,
                endValue: p.endValue || "A"
            }))
        };

        const blob = new Blob(
            [JSON.stringify(exportData, null, 2)],
            { type: "application/json" }
        );

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "zadania.json";
        link.click();
        URL.revokeObjectURL(link.href);
    }

    /* ---------------- LOAD JSON ---------------- */

    function loadFromJSON(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const text = String(reader.result).replace(/^\uFEFF/, "").trim();
                const data = JSON.parse(text);

                if (!data.zadania || !Array.isArray(data.zadania)) {
                    alert("Neplatný formát JSON.");
                    return;
                }

                const imported = data.zadania.map((z) => ({
                    id: Date.now() + Math.random(),
                    name: z.meno_zadania || "",
                    type: "konstantny",
                    patternString: z.typ_vzoru || "ABC",

                    growA: false,
                    growB: false,
                    growC: false,

                    imageA: z.obrazok_A || null,
                    imageB: z.obrazok_B || null,
                    imageC: z.obrazok_C || null,

                    repeat: z.pocet_opakovani || 3,

                    startEnabled: !!z.startEnabled,
                    startValue: z.startValue || "A",

                    endEnabled: !!z.endEnabled,
                    endValue: z.endValue || "A"
                }));

                setPatterns(imported);
                e.target.value = "";
            } catch (err) {
                console.error("Chyba pri načítaní JSON:", err);
                alert("Chyba: súbor nie je platný JSON.");
            }
        };

        reader.readAsText(file);
    }

    /* ---------------- EXPORT HTML ---------------- */

    function exportHTML() {
        let html = `
<!DOCTYPE html>
<html lang="sk">
<head>
    <meta charset="UTF-8">
    <title>Zadania</title>
</head>
<body>
    <h2>Zadania</h2>
`;

        patterns.forEach((p, index) => {
            html += `<div style="margin-bottom:24px;">`;
            html += `<h3>${index + 1}. ${escapeHtml(p.name)}</h3>`;
            html += generatePreviewHTML(p);
            html += `</div><hr>`;
        });

        html += `
</body>
</html>`;

        const blob = new Blob([html], { type: "text/html" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "zadania.html";
        link.click();
        URL.revokeObjectURL(link.href);
    }

    function generatePreviewHTML(pattern) {
        let result = "";

        const getImage = (letter) => pattern["image" + letter];
        let sequence = [];

        if (pattern.startEnabled) {
            sequence.push(pattern.startValue);
        }

        for (let r = 0; r < Number(pattern.repeat || 0); r++) {
            for (let char of pattern.patternString) {
                sequence.push(char);
            }
        }

        if (pattern.endEnabled) {
            sequence.push(pattern.endValue);
        }

        sequence.forEach((char) => {
            const img = getImage(char);

            if (img) {
                result += `
<img
    src="${img}"
    alt="${char}"
    height="50"
    style="margin-right:10px;"
>`;
            } else {
                result += `
<span style="
    display:inline-flex;
    width:40px;
    height:40px;
    align-items:center;
    justify-content:center;
    font-weight:bold;
    border:1px dashed #aaa;
    margin-right:10px;
">
    ${escapeHtml(char)}
</span>`;
            }
        });

        return `<div style="display:flex;flex-wrap:wrap;align-items:center;">${result}</div>`;
    }

    function escapeHtml(text) {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* ---------------- FORM ---------------- */

    function handleChange(e) {
        const { name, value, type, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    }

    function handleImage(e, key) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            setFormData({
                ...formData,
                [key]: reader.result
            });
        };

        reader.readAsDataURL(file);
    }

    /* ---------------- CRUD ---------------- */

    function savePattern() {
        if (!formData.name.trim()) {
            alert("Zadaj názov zadania.");
            return;
        }

        if (!formData.patternString.trim()) {
            alert("Zadaj vzor.");
            return;
        }

        if (formData.id) {
            setPatterns(
                patterns.map((p) =>
                    p.id === formData.id ? { ...formData } : p
                )
            );
        } else {
            setPatterns([
                ...patterns,
                { ...formData, id: Date.now() }
            ]);
        }

        setFormData(emptyForm);
        setShowForm(false);
    }

    function editPattern(pattern) {
        setFormData(pattern);
        setShowForm(true);
    }

    function deletePattern(id) {
        setPatterns(patterns.filter((p) => p.id !== id));
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="container mt-3">
            <h3>Programovanie vzorov</h3>

            <div className="mb-3 d-flex gap-2">
                <button
                    className="btn btn-dark"
                    onClick={() => {
                        setFormData(emptyForm);
                        setShowForm(true);
                    }}
                >
                    +
                </button>

                <button
                    className="btn btn-success"
                    onClick={saveToJSON}
                >
                    💾 Ulož
                </button>

                <button
                    className="btn btn-primary"
                    onClick={() => fileLoadRef.current.click()}
                >
                    📂 Načítaj
                </button>

                <button
                    className="btn btn-warning"
                    onClick={exportHTML}
                >
                    🌍 Export
                </button>

                <input
                    type="file"
                    ref={fileLoadRef}
                    style={{ display: "none" }}
                    onChange={loadFromJSON}
                    accept=".json,application/json"
                />
            </div>

            {showForm && (
                <div className="card p-3 mb-4">
                    <h5>
                        {formData.id ? "Editácia" : "Nové zadanie"}
                    </h5>

                    <div className="d-flex gap-3 mb-3">
                        <div>
                            <label>Názov</label>
                            <input
                                className="form-control"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Vzor</label>
                            <input
                                className="form-control"
                                name="patternString"
                                value={formData.patternString}
                                onChange={handleChange}
                                style={{ width: "120px" }}
                            />
                        </div>
                    </div>

                    <div className="d-flex gap-5 mb-3">
                        {["A", "B", "C"].map((letter) => (
                            <div key={letter}>
                                <strong>{letter}</strong>
                                <br />

                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary mt-1"
                                    onClick={() => fileRefs[letter].current.click()}
                                >
                                    Prehliadať
                                </button>

                                <input
                                    type="file"
                                    ref={fileRefs[letter]}
                                    style={{ display: "none" }}
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleImage(e, "image" + letter)
                                    }
                                />

                                {formData["image" + letter] && (
                                    <img
                                        src={formData["image" + letter]}
                                        alt={letter}
                                        style={{
                                            height: "50px",
                                            display: "block",
                                            marginTop: "8px"
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="d-flex gap-4 mb-3">
                        <div>
                            <label>Počet opakovaní</label>
                            <input
                                type="number"
                                name="repeat"
                                value={formData.repeat}
                                onChange={handleChange}
                                className="form-control"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <input
                            type="checkbox"
                            name="startEnabled"
                            checked={formData.startEnabled}
                            onChange={handleChange}
                        />{" "}
                        Navyše na začiatku

                        {formData.startEnabled && (
                            <select
                                name="startValue"
                                value={formData.startValue}
                                onChange={handleChange}
                                className="form-select mt-1"
                                style={{ width: "120px" }}
                            >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        )}
                    </div>

                    <div className="mb-3">
                        <input
                            type="checkbox"
                            name="endEnabled"
                            checked={formData.endEnabled}
                            onChange={handleChange}
                        />{" "}
                        Navyše na konci

                        {formData.endEnabled && (
                            <select
                                name="endValue"
                                value={formData.endValue}
                                onChange={handleChange}
                                className="form-select mt-1"
                                style={{ width: "120px" }}
                            >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        )}
                    </div>

                    <h6>Náhľad</h6>

                    <div className="border p-3 mb-3 d-flex flex-wrap">
                        {generatePreview(formData)}
                    </div>

                    <button
                        className="btn btn-success"
                        onClick={savePattern}
                    >
                        Uložiť
                    </button>
                </div>
            )}

            <div ref={listRef}>
                {patterns.map((pattern, index) => (
                    <div
                        key={pattern.id}
                        className="sortable-item"
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            marginBottom: "10px"
                        }}
                    >
                        <div
                            style={{
                                width: "30px",
                                textAlign: "right",
                                marginRight: "10px",
                                fontWeight: "bold",
                                paddingTop: "12px",
                                userSelect: "none"
                            }}
                        >
                            {index + 1}.
                        </div>

                        <div
                            className="card p-3 flex-grow-1 drag-handle"
                            style={{ cursor: "grab" }}
                        >
                            <div className="d-flex justify-content-between">
                                <strong>{pattern.name}</strong>

                                <div>
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => editPattern(pattern)}
                                    >
                                        ✏
                                    </button>

                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => deletePattern(pattern.id)}
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 d-flex flex-wrap">
                                {generatePreview(pattern)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

ReactDOM
    .createRoot(document.getElementById("root"))
    .render(<App />);