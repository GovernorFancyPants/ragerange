var elements = document.getElementsByClassName('ragerange');
Array.prototype.forEach.call(elements, function(el) {

    // GET SETTINGS

    range_setup = {
        startPosition: el.children[0].value,
        range: {max:el.children[0].max, min:el.children[0].min},
        labels: [],
        me: null,
        step: el.children[0].step,
        anchors: {},//{"Division": 25, "Konto":50, "Origin":75, "balls":100},
        bounceBack: false,
        hook: function(x){
            console.log(x);
        }
    };

    var uiSliderContainer = document.createElement('div');
    uiSliderContainer.className = 'slider-container with-output';

    var uiSlider = document.createElement('div');
    uiSlider.className = 'slider with-labels';

    var iDivisions = (range_setup.range.max / range_setup.step) - 1;
    var i = 1;
    while (i <= iDivisions) {
        var uiDivisions = document.createElement('span');
        uiDivisions.className = 'divisions';
        uiSlider.appendChild(uiDivisions);
        i++;
    }

    var uiRange = document.createElement('div');
    uiRange.className = 'slider-range';

    var uiHandle = document.createElement('span');
    uiHandle.className = 'slider-handle';

    uiSlider.appendChild(uiHandle);

    uiSlider.appendChild(uiRange);
    uiSliderContainer.appendChild(uiSlider);
    el.appendChild(uiSliderContainer);



    var scrollRegulator = document.getElementsByClassName('slider-handle')[0];
    var uiCustRange = document.getElementsByClassName('custom-range')[0];

    var startPosition = range_setup.startPosition;
    var currentPosition = 0;
    var previousPosition = null;
    var scalePosition = null;
    var rangeMin = parseInt(range_setup.range.min);
    var rangeMax = parseInt(range_setup.range.max);
    var widthMax = scrollRegulator.offsetParent.clientWidth;

    // CREATE SLIDER COMPONENT
    function initiate () {

        // SET UP DEFAULTS

        var uiSlider = document.getElementsByClassName('slider')[0];
        var uiRange = document.getElementsByClassName('slider-range')[0];
        //var uiManualInput = document.getElementsByClassName('manual-input')[0];

        var division = 100 / (range_setup.range.max / range_setup.step);
        var size = 100 / (range_setup.range.max / range_setup.startPosition);

        uiSlider.dataset.valueFirst = range_setup.range.min;
        uiSlider.dataset.valueLast = range_setup.range.max;
        //uiManualInput.value = defaultValue;
        uiRange.style.width = size.toString() + "%";
        uiHandle.style.left = size.toString() + "%";

        var divisions = document.getElementsByClassName('divisions');

        var i = 1;
        Array.prototype.forEach.call(divisions, function(el) {
            el.style.left = i * division.toString() + "%";
            el.dataset.value = i * range_setup.step;
            i++;
        });
    }

    function mouseUp(event) {
        window.removeEventListener('mousemove', divMove, true);
        currentPosition = event.clientX;
        previousPosition = null;

        if(range_setup.bounceBack) {
            scrollRegulator.style.left = getPosition(startPosition);
            range_setup.hook(startPosition);
        }

        if(Object.keys(range_setup.anchors).length)
        {
            var cursorPosition =  event.clientX - currentPosition;
            var regulatorPosition = parseInt(scrollRegulator.offsetLeft.replace(/[^-.0-9]+/, ''));
            regulatorPosition += cursorPosition-previousPosition;
            scrollRegulator.offsetLeft = Math.max(0, Math.min(regulatorPosition, widthMax)) + "%";
            previousPosition = cursorPosition;

            var procent = Math.max(0, Math.min(100, (regulatorPosition/(widthMax))*100));
            var position = rangeMin+(rangeMax-rangeMin)*procent/100;
            var currentAnchor = range_setup.anchors[Object.keys(range_setup.anchors)[0]];
            var currentMin = Math.abs(position-range_setup.anchors[Object.keys(range_setup.anchors)[0]]);

            for(var x in range_setup.anchors) {
                if(Math.abs(position-range_setup.anchors[x]) < currentMin) {
                    currentAnchor = range_setup.anchors[x];
                    currentMin = Math.abs(position-range_setup.anchors[x]);
                }
            }

            scrollRegulator.style.left = getPosition(currentAnchor);
            range_setup.hook(currentAnchor);
        }

    }

    function mouseDown(event) {
        currentPosition = event.clientX - scrollRegulator.offsetLeft;
        window.addEventListener('mousemove', divMove, true);
        return false;
    }

    function divMove(event) {
        var cursorPosition =  event.clientX - currentPosition;
        var regulatorPosition = cursorPosition/scrollRegulator.offsetParent.clientWidth;

        scrollRegulator.style.left = Math.max(0, Math.min(regulatorPosition * 100, 100)) + "%";
        uiRange.style.width = Math.max(0, Math.min(regulatorPosition * 100, 100)) + "%";
        previousPosition = cursorPosition;

        var procent =Math.max(0, Math.min(regulatorPosition * 100, 100));
        var position = rangeMin+(rangeMax-rangeMin)*procent/100;

        if(position != scalePosition) {
            uiCustRange.setAttribute('value', Math.round(position).toString());
        }

        scalePosition = position;
    }

    function getPosition(position) {
        var procent = ((position - rangeMin)/(rangeMax-rangeMin))*100;
        procent = Math.max(0, Math.min(100, procent));
        return (procent/100)*widthMax;
    }

    initiate();

    document.getElementsByClassName('slider-handle')[0].addEventListener("mousedown", mouseDown, false);
    window.addEventListener("mouseup", mouseUp, false);

});