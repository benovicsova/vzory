const html = htm.bind(React.createElement);

window.EMPTY_FORM = {
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

    imageAName: "",
    imageBName: "",
    imageCName: "",

    repeat: 3,

    startEnabled: false,
    startValue: "A",

    endEnabled: false,
    endValue: "A",

    hiddenIndices: []
};