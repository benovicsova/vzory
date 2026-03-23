const { useState, useRef, useEffect } = React;

function App() {
    const [patterns, setPatterns] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(window.EMPTY_FORM);

    const listRef = useRef(null);
    const sortableRef = useRef(null);

    const fileRefs = {
        A: useRef(null),
        B: useRef(null),
        C: useRef(null)
    };

    useEffect(() => {
        window.attachSortable(listRef.current, setPatterns, sortableRef);

        return () => {
            window.destroySortable(sortableRef);
        };
    }, [patterns.length]);

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
            const nameKey = key + "Name";

            setFormData({
                ...formData,
                [key]: reader.result,
                [nameKey]: file.name
            });
        };

        reader.readAsDataURL(file);
    }

    function toggleHiddenIndex(index) {
        const current = Array.isArray(formData.hiddenIndices) ? formData.hiddenIndices : [];
        const exists = current.includes(index);

        setFormData({
            ...formData,
            hiddenIndices: exists
                ? current.filter((i) => i !== index)
                : [...current, index].sort((a, b) => a - b)
        });
    }

    function randomChoice(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function randomBool() {
        return Math.random() < 0.5;
    }

    function randomPatternString() {
        const letters = ["A", "B", "C"];
        const len = 2 + Math.floor(Math.random() * 3);
        let out = "";

        for (let i = 0; i < len; i++) {
            out += randomChoice(letters);
        }

        return out;
    }

    function randomizeForm() {
        const nextType = randomChoice(["konstantny", "rastuci"]);
        const nextPattern = randomPatternString();

        const updated = {
            ...formData,
            type: nextType,
            patternString: nextPattern,
            repeat: 1 + Math.floor(Math.random() * 5),
            startEnabled: randomBool(),
            startValue: randomChoice(["A", "B", "C"]),
            endEnabled: randomBool(),
            endValue: randomChoice(["A", "B", "C"]),
            hiddenIndices: []
        };

        if (nextType === "rastuci") {
            updated.growA = randomBool();
            updated.growB = randomBool();
            updated.growC = randomBool();

            if (!updated.growA && !updated.growB && !updated.growC) {
                updated[randomChoice(["growA", "growB", "growC"])] = true;
            }
        } else {
            updated.growA = false;
            updated.growB = false;
            updated.growC = false;
        }

        setFormData(updated);
    }

    function savePattern() {
        if (!formData.name.trim()) {
            alert("Zadaj názov zadania.");
            return;
        }

        if (!formData.patternString.trim()) {
            alert("Zadaj vzor.");
            return;
        }

        if (!/^[ABC]+$/.test(formData.patternString)) {
            alert("Vzor môže obsahovať iba písmená A, B, C.");
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

        setFormData(window.EMPTY_FORM);
        setShowForm(false);
    }

    function editPattern(pattern) {
        setFormData({
            ...window.EMPTY_FORM,
            ...pattern,
            hiddenIndices: Array.isArray(pattern.hiddenIndices) ? pattern.hiddenIndices : []
        });
        setShowForm(true);
    }

    function deletePattern(id) {
        setPatterns(patterns.filter((p) => p.id !== id));
    }

    function handleLoadClick() {
        const input = document.getElementById("jsonFileInput");
        if (input) {
            input.click();
        }
    }

    function handleLoadFile(e) {
        const file = e.target.files[0];

        window.loadPatternsFromJSON(
            file,
            (imported) => {
                setPatterns(imported);
                e.target.value = "";
            },
            () => {
                alert("Chyba: súbor nie je platný JSON.");
                e.target.value = "";
            }
        );
    }

    return html`
        <div className="container mt-3">
            <h3>Programovanie vzorov</h3>

            <div className="mb-3 d-flex gap-2">
                <button
                    className="btn btn-dark"
                    onClick=${() => {
                        setFormData(window.EMPTY_FORM);
                        setShowForm(true);
                    }}
                >
                    +
                </button>

                <button
                    className="btn btn-success"
                    onClick=${() => window.savePatternsToJSON(patterns)}
                >
                    💾 Ulož
                </button>

                <button
                    className="btn btn-primary"
                    onClick=${handleLoadClick}
                >
                    📂 Načítaj
                </button>

                <button
                    className="btn btn-warning"
                    onClick=${() => window.exportPatternsToHTML(patterns)}
                >
                    🌍 Export
                </button>

                <input
                    id="jsonFileInput"
                    type="file"
                    style=${{ display: "none" }}
                    onChange=${handleLoadFile}
                    accept=".json,application/json"
                />
            </div>

            ${showForm && html`
                <${window.PatternForm}
                    formData=${formData}
                    fileRefs=${fileRefs}
                    onChange=${handleChange}
                    onImageChange=${handleImage}
                    onSave=${savePattern}
                    onRandomize=${randomizeForm}
                    onToggleHidden=${toggleHiddenIndex}
                    preview=${window.generatePreview(formData, toggleHiddenIndex)}
                />
            `}

            <${window.PatternList}
                patterns=${patterns}
                listRef=${listRef}
                onEdit=${editPattern}
                onDelete=${deletePattern}
            />
        </div>
    `;
}

ReactDOM
    .createRoot(document.getElementById("root"))
    .render(html`<${App} />`);