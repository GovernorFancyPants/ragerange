var rage1 = new RageRange(document.getElementById('slider1'), {
    anchors: {}
});
var rage2 = new RageRange(document.getElementById('slider2'), {
    labels: false
});
var rage3 = new RageRange(document.getElementById('slider3'), {
    input: false
});

function RageRange(el, opt_settings) {

    // SETTINGS

    range_setup = {
        startPosition: 256,
        range: {
            max: 1024,
            min: 0
        },
        labels: true,
        input: true,
        me: null,
        step: 256,
        anchors: {"Division": 0, "Balls": 256, "Konto":512, "Origin":768, "balls":1024},
        hook: function(x) {
            //console.log(x);
        }
    };

    merge(range_setup, opt_settings);

    function merge(obj1, obj2) {
        var obj = {},
            i = 0,
            il = arguments.length,
            key;
        for (; i < il; i++) {
            for (key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    obj[key] = arguments[i][key];
                }
            }
        }
        range_setup = obj;
        return range_setup;
    };

    // CREATE SLIDER CUSTOM RANGE COMPONENT

    var uiSliderContainer = document.createElement('div');
    uiSliderContainer.className = 'slider-container';

    var uiSlider = document.createElement('div');
    uiSlider.className = 'slider';

    var uiRange = document.createElement('div');
    uiRange.className = 'slider-range';

    var uiHandle = document.createElement('span');
    uiHandle.className = 'slider-handle';

    var iDivisions = (range_setup.range.max / range_setup.step) - 1;
    var i = 1;
    while (i <= iDivisions) {
        var uiDivisions = document.createElement('span');
        uiDivisions.className = 'divisions';
        uiSlider.appendChild(uiDivisions);
        i++;
    }

    uiSlider.appendChild(uiHandle);
    uiSlider.appendChild(uiRange);
    uiSliderContainer.appendChild(uiSlider);
    el.appendChild(uiSliderContainer);


    if (range_setup.labels) {
        uiSlider.className = 'slider with-labels';
    }
    if (range_setup.input) {
        var uiInputWrapper = document.createElement('div');
        uiInputWrapper.className = 'rage-input';
        var uiManualInput = document.createElement('input');
        uiManualInput.type = 'text';
        uiManualInput.className = 'custom-input';
        uiManualInput.value = range_setup.startPosition;

        uiSliderContainer.className = 'slider-container with-input';
        uiInputWrapper.appendChild(uiManualInput);
        uiSliderContainer.appendChild(uiInputWrapper);
    }

    // SETTING UP VARIABLES

    var uiCustRange = document.getElementsByClassName('custom-range')[0];

    var startPosition = range_setup.startPosition;
    var currentPosition = 0;
    var previousPosition = null;
    var scalePosition = null;
    var rangeMin = parseInt(range_setup.range.min);
    var rangeMax = parseInt(range_setup.range.max);
    var widthMax = uiHandle.offsetParent.clientWidth;

    function initiate() {

        // SET UP DEFAULTS

        var division = 100 / (range_setup.range.max / range_setup.step);
        var size = 100 / (range_setup.range.max / range_setup.startPosition);

        uiSlider.dataset.valueFirst = range_setup.range.min;
        uiSlider.dataset.valueLast = range_setup.range.max;
        uiRange.style.width = size.toString() + "%";
        uiHandle.style.left = size.toString() + "%";

        var divisions = el.getElementsByClassName('divisions');

        var i = 1;
        Array.prototype.forEach.call(divisions, function(el) {
            el.style.left = i * division.toString() + "%";
            el.dataset.value = i * range_setup.step;
            i++;
        });
    }

    function sliderClick(event) {
        var cursorPosition = event.clientX - uiHandle.offsetParent.offsetLeft;
        var regulatorPosition = (cursorPosition / uiHandle.offsetParent.clientWidth) * 100;

        uiHandle.style.left = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        uiRange.style.width = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        previousPosition = cursorPosition;

        var procent = Math.max(0, Math.min(regulatorPosition, 100));
        var position = rangeMin + (rangeMax - rangeMin) * procent / 100;

        if (position != scalePosition) {
            uiCustRange.value = Math.round(position).toString();
            if (el.getElementsByClassName('custom-input')[0]) {
                el.getElementsByClassName('custom-input')[0].value = Math.round(position).toString();
            }
        }

        scalePosition = position;

        if (Object.keys(range_setup.anchors).length) {
            var currentAnchor = range_setup.anchors[Object.keys(range_setup.anchors)[0]];
            var currentMin = Math.abs(position - range_setup.anchors[Object.keys(range_setup.anchors)[0]]);
            for (var x in range_setup.anchors) {
                if (Math.abs(position - range_setup.anchors[x]) < currentMin) {
                    currentAnchor = range_setup.anchors[x];
                    currentMin = Math.abs(position - range_setup.anchors[x]);
                }
            }
            uiHandle.style.left = getPosition(currentAnchor) / widthMax * 100 + "%";
            uiRange.style.width = getPosition(currentAnchor) / widthMax * 100 + "%";
            range_setup.hook(currentAnchor);
            uiCustRange.value = currentAnchor;
            if (el.getElementsByClassName('custom-input')[0]) {
                el.getElementsByClassName('custom-input')[0].value = currentAnchor;
            }
        }
    }

    function mouseUp(event) {
        window.removeEventListener('mousemove', divMove, true);
        document.body.className = document.body.className.replace(/\bselect-none\b/, '');
        currentPosition = event.clientX - uiHandle.offsetLeft - 10;
        previousPosition = null;

        if (range_setup.bounceBack) {
            uiHandle.style.left = getPosition(startPosition);
            range_setup.hook(startPosition);
        }

        if (Object.keys(range_setup.anchors).length) {
            var cursorPosition = event.clientX - currentPosition;
            var regulatorPosition = (cursorPosition / uiHandle.offsetParent.clientWidth) * 100;

            uiHandle.style.left = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
            uiRange.style.width = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
            previousPosition = cursorPosition;

            var procent = Math.max(0, Math.min(regulatorPosition, 100));
            var position = rangeMin + (rangeMax - rangeMin) * procent / 100;

            var currentAnchor = range_setup.anchors[Object.keys(range_setup.anchors)[0]];
            var currentMin = Math.abs(position - range_setup.anchors[Object.keys(range_setup.anchors)[0]]);
            for (var x in range_setup.anchors) {
                if (Math.abs(position - range_setup.anchors[x]) < currentMin) {
                    currentAnchor = range_setup.anchors[x];
                    currentMin = Math.abs(position - range_setup.anchors[x]);
                }
            }
            uiHandle.style.left = getPosition(currentAnchor) / widthMax * 100 + "%";
            uiRange.style.width = getPosition(currentAnchor) / widthMax * 100 + "%";
            range_setup.hook(currentAnchor);
            uiCustRange.value = currentAnchor;
            if (range_setup.input) {
                el.getElementsByClassName('custom-input')[0].value = currentAnchor;
            }
        }
    }

    function mouseDown(event) {
        currentPosition = event.clientX - uiHandle.offsetLeft - 10;

        window.addEventListener('mousemove', divMove, true);
        var currentClasses = document.body.className;
        document.body.className = currentClasses + " " + 'select-none';
        return false;
    }

    function divMove(event) {
        var cursorPosition = event.clientX - currentPosition;
        var regulatorPosition = (cursorPosition / uiHandle.offsetParent.clientWidth) * 100;

        uiHandle.style.left = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        uiRange.style.width = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        previousPosition = cursorPosition;

        var procent = Math.max(0, Math.min(regulatorPosition, 100));
        var position = rangeMin + (rangeMax - rangeMin) * procent / 100;

        if (position != scalePosition) {
            uiCustRange.value = Math.round(position).toString();
            if (range_setup.input) {
                el.getElementsByClassName('custom-input')[0].value = Math.round(position).toString();
            }
        }

        scalePosition = position;

        window.addEventListener("mouseup", mouseUp, false);
    }

    function keyUp(e) {
        var regulatorPosition = (el.getElementsByClassName('custom-input')[0].value / rangeMax) * 100;
        uiHandle.style.left = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        uiRange.style.width = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        uiCustRange.value = el.getElementsByClassName('custom-input')[0].value;

        var procent = Math.max(0, Math.min(regulatorPosition, 100));
        var position = rangeMin + (rangeMax - rangeMin) * procent / 100;

        if (Object.keys(range_setup.anchors).length) {
            var currentAnchor = range_setup.anchors[Object.keys(range_setup.anchors)[0]];
            var currentMin = Math.abs(position - range_setup.anchors[Object.keys(range_setup.anchors)[0]]);
            for (var x in range_setup.anchors) {
                if (Math.abs(position - range_setup.anchors[x]) < currentMin) {
                    currentAnchor = range_setup.anchors[x];
                    currentMin = Math.abs(position - range_setup.anchors[x]);
                }
            }
            uiHandle.style.left = getPosition(currentAnchor) / widthMax * 100 + "%";
            uiRange.style.width = getPosition(currentAnchor) / widthMax * 100 + "%";
            range_setup.hook(currentAnchor);
            uiCustRange.value = currentAnchor;
            if (range_setup.input) {
                el.getElementsByClassName('custom-input')[0].value = currentAnchor;
            }
        }
    }

    function getPosition(position) {
        var procent = ((position - rangeMin) / (rangeMax - rangeMin)) * 100;
        procent = Math.max(0, Math.min(100, procent));
        return (procent / 100) * widthMax;
    }

    function touchMove(e) {
        var cursorPosition = e.pageX - uiHandle.offsetParent.offsetLeft;
        var regulatorPosition = (cursorPosition / uiHandle.offsetParent.clientWidth) * 100;

        uiHandle.style.left = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        uiRange.style.width = Math.max(0, Math.min(regulatorPosition, 100)) + "%";
        previousPosition = cursorPosition;

        var procent = Math.max(0, Math.min(regulatorPosition, 100));
        var position = rangeMin + (rangeMax - rangeMin) * procent / 100;

        if (position != scalePosition) {
            uiCustRange.value = Math.round(position).toString();
            if (range_setup.input) {
                el.getElementsByClassName('custom-input')[0].value = Math.round(position).toString();
            }
        }

        scalePosition = position;

        if (Object.keys(range_setup.anchors).length) {
            var currentAnchor = range_setup.anchors[Object.keys(range_setup.anchors)[0]];
            var currentMin = Math.abs(position - range_setup.anchors[Object.keys(range_setup.anchors)[0]]);
            for (var x in range_setup.anchors) {
                if (Math.abs(position - range_setup.anchors[x]) < currentMin) {
                    currentAnchor = range_setup.anchors[x];
                    currentMin = Math.abs(position - range_setup.anchors[x]);
                }
            }
            uiHandle.style.left = getPosition(currentAnchor) / widthMax * 100 + "%";
            uiRange.style.width = getPosition(currentAnchor) / widthMax * 100 + "%";
            range_setup.hook(currentAnchor);
            uiCustRange.value = currentAnchor;
            if (range_setup.input) {
                el.getElementsByClassName('custom-input')[0].value = currentAnchor;
            }
        }
    }

    initiate();

    uiHandle.addEventListener("mousedown", mouseDown, false);
    uiHandle.addEventListener("touchmove", touchMove, false);
    if (range_setup.input) {
        el.getElementsByClassName('custom-input')[0].onblur = keyUp;
    }

    uiSlider.addEventListener("mouseup", sliderClick, false);
}
