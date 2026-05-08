const html = htm.bind(React.createElement);

window.IMAGE_LIBRARY = [
    "hamburger0.png",
    "hamburger1.png",
    "hamburger2.png",

    "kruh0.png",
    "kruh1.png",
    "kruh2.png",

    "kvet0.png",
    "kvet1.png",
    "kvet2.png",

    "ovocie0.png",
    "ovocie1.png",
    "ovocie2.png",

    "srdce0.png",
    "srdce1.png",
    "srdce2.png",

    "strom0.png",
    "strom1.png",
    "strom2.png"
];

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