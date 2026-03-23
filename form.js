window.PatternForm = function PatternForm(props) {
    const {
        formData,
        fileRefs,
        onChange,
        onImageChange,
        onSave,
        onRandomize,
        onToggleHidden,
        preview
    } = props;

    return html`
        <div className="card p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">${formData.id ? "Editácia" : "Nové zadanie"}</h5>

                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick=${onRandomize}
                >
                    Náhodné nastavenia
                </button>
            </div>

            <div className="d-flex gap-3 mb-3">
                <div>
                    <label>Názov</label>
                    <input
                        className="form-control"
                        name="name"
                        value=${formData.name}
                        onChange=${onChange}
                    />
                </div>

                <div>
                    <label>Vzor</label>
                    <input
                        className="form-control"
                        name="patternString"
                        value=${formData.patternString}
                        onChange=${onChange}
                        style=${{ width: "120px" }}
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="me-3">
                    <input
                        type="radio"
                        name="type"
                        value="konstantny"
                        checked=${formData.type === "konstantny"}
                        onChange=${onChange}
                    />
                    ${" "}Konštantný
                </label>

                <label>
                    <input
                        type="radio"
                        name="type"
                        value="rastuci"
                        checked=${formData.type === "rastuci"}
                        onChange=${onChange}
                    />
                    ${" "}Rastúci
                </label>
            </div>

            ${formData.type === "rastuci" && html`
                <div className="mb-3">
                    <div className="fw-bold mb-1">Rastú:</div>

                    <label className="me-3">
                        <input
                            type="checkbox"
                            name="growA"
                            checked=${formData.growA}
                            onChange=${onChange}
                        />
                        ${" "}A
                    </label>

                    <label className="me-3">
                        <input
                            type="checkbox"
                            name="growB"
                            checked=${formData.growB}
                            onChange=${onChange}
                        />
                        ${" "}B
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            name="growC"
                            checked=${formData.growC}
                            onChange=${onChange}
                        />
                        ${" "}C
                    </label>
                </div>
            `}

            <div className="d-flex gap-5 mb-3">
                ${["A", "B", "C"].map((letter) => html`
                    <div key=${letter}>
                        <strong>${letter}</strong>
                        <br />

                        <button
                            type="button"
                            className="btn btn-sm btn-secondary mt-1"
                            onClick=${() => fileRefs[letter].current.click()}
                        >
                            Prehliadať
                        </button>

                        <input
                            type="file"
                            ref=${fileRefs[letter]}
                            style=${{ display: "none" }}
                            accept="image/*"
                            onChange=${(e) => onImageChange(e, "image" + letter)}
                        />

                        ${formData["image" + letter] && html`
                            <img
                                src=${formData["image" + letter]}
                                alt=${letter}
                                style=${{
                                    height: "50px",
                                    display: "block",
                                    marginTop: "8px"
                                }}
                            />
                        `}
                    </div>
                `)}
            </div>

            <div className="d-flex gap-4 mb-3">
                <div>
                    <label>Počet opakovaní</label>
                    <input
                        type="number"
                        name="repeat"
                        value=${formData.repeat}
                        onChange=${onChange}
                        className="form-control"
                        min="1"
                    />
                </div>
            </div>

            <div className="mb-2">
                <input
                    type="checkbox"
                    name="startEnabled"
                    checked=${formData.startEnabled}
                    onChange=${onChange}
                />
                ${" "}Navyše na začiatku

                ${formData.startEnabled && html`
                    <select
                        name="startValue"
                        value=${formData.startValue}
                        onChange=${onChange}
                        className="form-select mt-1"
                        style=${{ width: "120px" }}
                    >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                `}
            </div>

            <div className="mb-3">
                <input
                    type="checkbox"
                    name="endEnabled"
                    checked=${formData.endEnabled}
                    onChange=${onChange}
                />
                ${" "}Navyše na konci

                ${formData.endEnabled && html`
                    <select
                        name="endValue"
                        value=${formData.endValue}
                        onChange=${onChange}
                        className="form-select mt-1"
                        style=${{ width: "120px" }}
                    >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>
                `}
            </div>

            <h6>Náhľad</h6>
            <div className="border p-3 mb-2 d-flex flex-wrap">
                ${preview}
            </div>

            <div className="text-muted small mb-3">
                Kliknutím na prvok v náhľade ho skryješ alebo znovu zobrazíš.
            </div>

            <button
                className="btn btn-success"
                onClick=${onSave}
            >
                Uložiť
            </button>
        </div>
    `;
};