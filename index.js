const appEl = document.getElementById("color-scheme-generator-app");

const colorSchemeModes = [
  "monochrome",
  "monochrome-dark",
  "monochrome-light",
  "analogic",
  "complement",
  "analogic-complement",
  "triad",
  "quad"
];
function padZero(str, len) {
  len = len || 2;
  var zeros = new Array(len).join("0");
  return (zeros + str).slice(-len);
}
function invertColor(hex, bw = true) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // https://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
}

function capitalizeString(x) {
  return x.charAt(0).toUpperCase() + x.slice(1);
}

function handleClick(e) {
  if (e.target.id === "get-color-scheme-btn") {
    e.preventDefault();
    console.log("click Get color scheme Button");
    renderAppMain();
  } else if (e.target.classList.contains("color-text")) {
    const hexValue = e.target.textContent;
    navigator.clipboard.writeText(hexValue).then(
      () => {
        e.target.textContent = "Copied";
        setTimeout(() => (e.target.textContent = hexValue), 1000);
        /* Resolved - text copied to clipboard successfully */
      },
      () => {
        console.log("Failed to copy " + hexValue);
        /* Rejected - text failed to copy to the clipboard */
      }
    );
  }
}

function renderAppMain() {
  const seedColor = document.getElementById("seed-color-box").value.slice(1);
  const schemeMode = document.getElementById("select-color-scheme").value;
  console.log(`seedColor=${seedColor}, schemeMode=${schemeMode}`);
  const baseURL = "https://www.thecolorapi.com";
  const url = `${baseURL}/scheme?hex=${seedColor}&mode=${schemeMode}&count=5&format=json`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const colorList = data["colors"].map((x) => {
        return {
          value: x["hex"]["value"],
          name: x["name"]["value"],
          url: `${baseURL}${x["_links"]["self"]["href"]}&format=html`
        };
      });
      console.log(colorList);
      const appMainHTML = colorList
        .map((colorObj) => {
          return `
          <div class="color-bar">
            <div class="color-area" 
              style="background: ${colorObj["value"]}; 
                     color: ${invertColor(colorObj["value"])}"
            >
              <a href="${colorObj["url"]}">${colorObj["name"]}</a>
            </div>
            <div class="color-text" title="click to copy">${
              colorObj["value"]
            }</div>
          </div>
        `;
        })
        .join("");
      document.getElementById("app-main").innerHTML = appMainHTML;
    });
}

function renderApp() {
  const optionsHTML = colorSchemeModes
    .map((x) => {
      return `<option value="${x}">${capitalizeString(x)}</option>`;
    })
    .join("");

  let appHTML = `
    <div class="app-header" id="app-header">
      <form>
        <input type="color" 
          value="#F55A5A" 
          class="seed-color-box" 
          id="seed-color-box"
        >
        <select 
          name="select-color-scheme" 
          class="select-color-scheme"
          id="select-color-scheme"
        >
          ${optionsHTML}
        </select>
        <button class="get-color-scheme-btn" 
          id="get-color-scheme-btn">Get color scheme</button>
      </form>
    </div>
    <div class="app-main" id="app-main">
      <h2>App Main Area</h2>
    </div>
  `;
  appEl.innerHTML = appHTML;
}

document.addEventListener("click", handleClick);
renderApp();
renderAppMain();
