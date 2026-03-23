window.buildSequence = function (pattern) {
    const sequence = [];

    if (pattern.startEnabled) {
        sequence.push(pattern.startValue);
    }

    for (let r = 0; r < Number(pattern.repeat || 0); r++) {
        for (const char of pattern.patternString || "") {
            const grows =
                pattern.type === "rastuci" &&
                (
                    (char === "A" && pattern.growA) ||
                    (char === "B" && pattern.growB) ||
                    (char === "C" && pattern.growC)
                );

            const count = grows ? r + 1 : 1;

            for (let i = 0; i < count; i++) {
                sequence.push(char);
            }
        }
    }

    if (pattern.endEnabled) {
        sequence.push(pattern.endValue);
    }

    return sequence;
};

window.generatePreview = function (pattern, onToggleHidden) {
    if (!pattern || !pattern.patternString) return null;

    const images = {
        A: pattern.imageA,
        B: pattern.imageB,
        C: pattern.imageC
    };

    const sequence = window.buildSequence(pattern);
    const hidden = Array.isArray(pattern.hiddenIndices) ? pattern.hiddenIndices : [];

    return sequence.map((char, i) => {
        const isHidden = hidden.includes(i);
        const src = images[char];

        const commonStyle = {
            height: 50,
            width: 50,
            marginRight: 10,
            cursor: onToggleHidden ? "pointer" : "default",
            userSelect: "none"
        };

        if (isHidden) {
            return html`
                <div
                    key=${i}
                    onClick=${onToggleHidden ? () => onToggleHidden(i) : undefined}
                    title="Klikni pre zobrazenie"
                    style=${{
                        ...commonStyle,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "22px",
                        border: "2px dashed #666",
                        background: "#f8f9fa"
                    }}
                >
                    ?
                </div>
            `;
        }

        if (src) {
            return html`
                <img
                    key=${i}
                    src=${src}
                    alt=${char}
                    title=${onToggleHidden ? "Klikni pre skrytie" : char}
                    onClick=${onToggleHidden ? () => onToggleHidden(i) : undefined}
                    style=${{
                        ...commonStyle,
                        objectFit: "contain"
                    }}
                />
            `;
        }

        return html`
            <div
                key=${i}
                onClick=${onToggleHidden ? () => onToggleHidden(i) : undefined}
                title=${onToggleHidden ? "Klikni pre skrytie" : char}
                style=${{
                    ...commonStyle,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "18px",
                    border: "1px dashed #aaa"
                }}
            >
                ${char}
            </div>
        `;
    });
};

window.escapeHtml = function (text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
};

window.generatePreviewHTML = function (pattern) {
    const images = {
        A: pattern.imageA,
        B: pattern.imageB,
        C: pattern.imageC
    };

    const sequence = window.buildSequence(pattern);
    const hidden = Array.isArray(pattern.hiddenIndices) ? pattern.hiddenIndices : [];

    let result = "";

    sequence.forEach((char, i) => {
        const src = images[char];
        const isHidden = hidden.includes(i);

        if (isHidden) {
            result += `
<span style="
    display:inline-flex;
    width:40px;
    height:40px;
    align-items:center;
    justify-content:center;
    font-weight:bold;
    border:2px dashed #666;
    margin-right:10px;
    background:#f8f9fa;
">
    ?
</span>`;
            return;
        }

        if (src) {
            result += `
<img
    src="${src}"
    alt="${char}"
    height="50"
    style="margin-right:10px;object-fit:contain;"
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
    ${window.escapeHtml(char)}
</span>`;
        }
    });

    return `<div style="display:flex;flex-wrap:wrap;align-items:center;">${result}</div>`;
};