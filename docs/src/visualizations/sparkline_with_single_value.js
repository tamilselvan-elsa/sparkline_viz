import sparkline from "@fnando/sparkline";

function findClosest(target, tagName) {

  if (target.tagName === tagName) {
    return target;
  }

  while ((target = target.parentNode)) {
    if (target.tagName === tagName) {
      return target;
    }
  }

  return target;
}

let sparkline_options = {
  onmousemove(event, datapoint) {
    var svg = findClosest(event.target, "svg");

    var tooltip = svg.nextElementSibling;
    var date = (new Date(datapoint.date)).toLocaleString('en')
    // .toUTCString().replace(/^.*?, (.*?) \\d{2}:\\d{2}:\\d{2}.*?$/, "$1")
   
    var container = document.querySelector(".sparkline");

    tooltip.hidden = false;
    tooltip.textContent = `${date}: ${datapoint.html}`;


    // tooltip.style.top = `${event.offsetY + 35}px`;
    // tooltip.style.left = `${event.offsetX - 20}px`;
    tooltip.style.top = `${container.clientHeight + 35}px`;
    tooltip.style.left = `20px`;

    // tooltip.textContent = JSON.stringify(document.querySelector(".sparkline").clientHeight)
  },

  onmouseout() {
    var svg = findClosest(event.target, "svg");
    var tooltip = svg.nextElementSibling;
    tooltip.hidden = true;
  }
};


export const viz = looker.plugins.visualizations.add({
  options: {
    stroke: {
      section: "Sparkline",
      type: "array",
      label: "Stroke color",
      display: "color",
      default: ["#353b49"]
    },
    strokeWidth: {
      label: "Stroke width",
      section: "Sparkline",
      type: "number",
      default: 3
    },
    fill: {
      section: "Sparkline",
      type: "array",
      label: "Fill color",
      display: "color"
    },
    top_label: {
      section: "Header",
      type: "string",
      label: "Label (for top)",
      placeholder: "My Great Chart"
    },
    last: {
      section: "Header",
      type: "boolean",
      label: "Use the last value?"
    },
    headerFontSize: {
      section: "Header",
      type: "number",
      label: "Header Font Size",
      default: 32
    },
    comparisonFontSize: {
      section: "Header",
      type: "number",
      label: "Comparison Font Size",
      default: 18
    },
    precision: {
      section: "Header",
      type: "number",
      label: "Decimal Precision",
      default: 2
    },
    units: {
      section: "Header",
      type: "string",
      label: "Units",
      default: ""
    },
    useHTML: {
      section: "Header",
      type: "boolean",
      label: "Use the formatted HTML?"
    },
  },
  create: function (element, config) {
    element.innerHTML = `<svg class="sparkline" width="${element.offsetWidth}" height="${element.offsetHeight - 37}" stroke-width="3"></svg>`;
  },
  updateAsync: function (data, element, config, queryResponse, details, doneRendering) {

    let values = queryResponse.fields.measure_like.map((field) => {
      let key = field.label
      let value = field.name
      return { [key]: value }
    })
    let firstDimension = queryResponse.fields.dimensions[0].name;
    let options = this.options;
    options["sparklineData"] =
    {
      section: "Sparkline",
      type: "string",
      label: "Measure for Sparkline",
      display: "select",
      values: values
    }
    options["headerData"] =
    {
      section: "Header",
      type: "string",
      label: "Measure for Header",
      display: "select",
      values: values,
    }
    options["comparisonData"] =
    {
      section: "Header",
      type: "string",
      label: "Measure for Comparison",
      display: "select",
      values: values,
    }


    // if (config.sparklineData == null) {
      this.trigger('registerOptions', options) // register options with parent page to update visConfig
    // }


    // Grab the header cell
    var headerRow = config.last ? data[data.length - 1] : data[0];
    var headerCell = headerRow[config.headerData];
    
    var header = rounder(LookerCharts.Utils.textForCell(headerCell), config.precision || 0);
    if(isNaN(header)){
      header = LookerCharts.Utils.textForCell(headerCell)
    }

    if(LookerCharts.Utils.htmlForCell(headerCell) && config.useHTML){
      header = LookerCharts.Utils.htmlForCell(headerCell)
    }

    // Grab the comparison cell
    var comparisonRow = config.last ? data[data.length - 1] : data[0];
    var comparisonCell = comparisonRow[config.comparisonData];
    var comparison = rounder(LookerCharts.Utils.textForCell(comparisonCell), config.precision || 0);
    var comparisonColor = 'black'
    if(isNaN(comparison)){
        comparison = LookerCharts.Utils.textForCell(comparisonCell)
    } else {
      comparisonColor = comparison >= 0 ? 'green' : 'red';
      comparison = comparison > 0 ? '+' + comparison : comparison;
    }
    if(LookerCharts.Utils.htmlForCell(comparisonCell) && config.useHTML){
      comparison = LookerCharts.Utils.htmlForCell(comparisonCell)
    }

    var dataArray = [];
    for (var row of data) {
      var measureCell = row[config.sparklineData];
      var dateCell = row[firstDimension];
      dataArray.push({
        "name": config.top_label,
        "value": parseFloat(LookerCharts.Utils.textForCell(measureCell).replace('[^0-9.]/g,','')),
        "date": LookerCharts.Utils.textForCell(dateCell),
        "html": LookerCharts.Utils.textForCell(measureCell)
      });
    }

    //  Montserrat:
    //  https://fonts.gstatic.com/s/montserrat/v14/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2);}\'+

    var styleEl = document.createElement('style');
    styleEl.setAttribute('type', "text/css")
    styleEl.innerHTML = '@font-face ' +
      '{font-family: Open Sans;' +
      'src: url( https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0b.woff2 );}' +
      'div {font-family: Open Sans;};'


    document.head.appendChild(styleEl);
  
    var onClick = () => window.alert('Popup Modal placeholder')


// Constants
const topLabelHeight = 38; // px, observed height of the top label

// Function to estimate header height based on font size
function estimateHeaderHeight(headerFontSize) {
  // These observed values are based on the Montserrat font
  const observedHeaderFontSize = 48; // px
  const observedHeaderHeight = 65.71; // px
  return (headerFontSize / observedHeaderFontSize) * observedHeaderHeight;
}

// Calculate dynamic SVG height
function calculateSvgHeight(element, headerFontSize) {
  const headerHeightEstimate = estimateHeaderHeight(headerFontSize);
  const totalHeightAdjustment = headerHeightEstimate + topLabelHeight ;
  return element.offsetHeight - totalHeightAdjustment;
}

// Example usage
const svgHeight = calculateSvgHeight(element, config.headerFontSize);

    element.innerHTML = `
         
         <div class="headerdiv" style=" font-style: normal; font-weight: 300; font-size: 16px;" onclick="${onClick()}"=>
         ${config.top_label}
         <div style="display: flex; align-items: center; gap: 15px;">
          <div style="font-size: ${config.headerFontSize}px; font-weight: bolder;">${header} ${config.units || ''}</div>
          <div style="font-size: ${config.comparisonFontSize}px; font-weight: bolder; color:${comparisonColor};">${comparison}%</div>
         </div>
          <svg class="sparkline" width="${element.offsetWidth}" height="${svgHeight}" stroke-width="${config.strokeWidth}"
          stroke="${config.stroke}"  fill="${config.fill}">
            
    </svg>
          <span class="tooltip" style="position: absolute; 
            background: rgba(0, 0, 0, .7);
            color: #fff;
            padding: 2px 5px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 9999;
          }" hidden="true"></span>`;

    sparkline(document.querySelector(".sparkline"), dataArray, sparkline_options);
    
    // Apply the gradient fill to the sparkline after it has been rendered
    setTimeout(() => {
        const sparklineSvg = document.querySelector(".sparkline");
        let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `<linearGradient id="gradientFill" x1="20%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${config.fill}" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />`
        sparklineSvg.appendChild(defs)
        const fillPath = sparklineSvg.querySelector('.sparkline--fill');
        fillPath.setAttribute('fill', 'url(#gradientFill)');
        
    }, 10); // Adjust the timeout as necessary

    doneRendering()
  }
});

const rounder = (float, digits) => {
  let rounded = Math.round(float * 10 ** digits) / 10 ** digits;
  return rounded;
};

