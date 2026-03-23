window.PatternList = function PatternList(props) {
    const {
        patterns,
        listRef,
        onEdit,
        onDelete
    } = props;

    return html`
        <div ref=${listRef}>
            ${patterns.map((pattern, index) => html`
                <div
                    key=${pattern.id}
                    className="sortable-item"
                    style=${{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px"
                    }}
                >
                    <div
                        style=${{
                            width: "30px",
                            textAlign: "right",
                            marginRight: "10px",
                            fontWeight: "bold",
                            paddingTop: "12px",
                            userSelect: "none"
                        }}
                    >
                        ${index + 1}.
                    </div>

                    <div
                        className="card p-3 flex-grow-1 drag-handle"
                        style=${{ cursor: "grab" }}
                    >
                        <div className="d-flex justify-content-between">
                            <strong>${pattern.name}</strong>

                            <div>
                                <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick=${() => onEdit(pattern)}
                                >
                                    ✏
                                </button>

                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick=${() => onDelete(pattern.id)}
                                >
                                    🗑
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 d-flex flex-wrap">
                            ${window.generatePreview(pattern)}
                        </div>
                    </div>
                </div>
            `)}
        </div>
    `;
};