window.attachSortable = function (element, setPatterns, sortableRef) {
    if (!element) return;

    if (sortableRef.current) {
        sortableRef.current.destroy();
    }

    sortableRef.current = new Sortable(element, {
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
};

window.destroySortable = function (sortableRef) {
    if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
    }
};