const fs = require("fs");
const cP = require("child_process");
const readline1 = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});
const link = process.argv[2];
const domain = "https://apprendre.tv5monde.com";
const paths = link.split("/");
const langPath = paths[3]; //fr
const exercicesPath = paths[4]; //exercises
const levelPath = paths[5]; // a2, b1 ....
const lessonPath = paths[6]; // file name
const folderPath = `./${langPath}/${exercicesPath}/${levelPath}/${lessonPath}`; // to make path, create directory
const exercicePath = `${langPath}/exercice/${lessonPath}`; // exercice path (link to first exercices)
const videosPath = `./${folderPath}/videos`; // videos path (add video for each first exercice)
const videoAndTranscriptionPath = `./${folderPath}/video-and-transcription`;
try {
  //if error, start readline1 to download packages
  allHappenInHere();
  readline1.close();
} catch (error) {
  readline1.question(
    `You need to install these modules: Cheerio, Axios\nDo you want to install these modules?\n[Y/n]\n`,
    (respond) => {
      if (respond.toLocaleLowerCase() === "y") {
        cP.execSync("npm install cheerio", { stdio: [0, 1, 2] });
        cP.execSync("npm install axios", { stdio: [0, 1, 2] });
        console.log("Downloaded! You can run the code again!");
      } else {
        console.log("Stopping code...");
      }
      readline1.close();
    }
  );
}

// All happen in here...
function allHappenInHere() {
  const cheerio = require("cheerio");
  const axios = require("axios"); // add packages
  // create folders
  createDir(`${exercicePath}/JS`); // fr/exercice/<lessonPath>/JS
  createDir(videosPath); // fr/exercices/<levelPath>/<lessonPath>/video
  createDir(videoAndTranscriptionPath); // fr/exercices/<levelPath>/<lessonPath>/video-and-transcription/<lessonPath>
  //get lesson page
  axios
    .get(link)
    .then((respond) => {
      let html = respond.data;
      const $ = cheerio.load(html);
      //get first exercice link and ID
      const firstExerciceLink = domain + $("a.btn").attr("href");
      const exerciceId = firstExerciceLink.slice(
        43,
        firstExerciceLink.indexOf("?")
      );
      $("a.btn").attr("href", `../../../../${exercicePath}/index-ex1.html`); // change button link to the exercice page.
      const lessonHtml = $.html();
      fs.writeFile(`${folderPath}/index.html`, lessonHtml, (error) =>
        console.log(error || "")
      );
      //get exercice solution
      axios
        .get(
          `https://apprendre.tv5monde.com/${langPath}/ajax-get-aide/${exerciceId}`
        )
        .then((respond) => {
          let html = respond.data[0].data
            .replaceAll(
              `<div class="field--item">`,
              `<div class="field--item"><p>`
            )
            .replaceAll(`.`, `</p>`);
          html = html.replaceAll(`</p><br />`, `</p><br/><p>`);
          const $ = cheerio.load(html);
          const exerciceSolution =
            (
              $(
                "div.field--name-field-solution-text > div > p:first-child"
              ).text() +
              $("div.field--name-field-solution-text > div > p ~ p").text()
            ).replaceAll("\n", ". ") + '"';
          const exerciceGood = (
            $(
              "div.field--name-field-good-answer-text > div > p:first-child"
            ).text() +
            $("div.field--name-field-good-answer-text > div > p ~ p").text()
          ).replaceAll("\n", ". ");
          const exerciceBad = (
            $(
              "div.field--name-field-bad-answer-text > div > p:first-child"
            ).text() +
            $("div.field--name-field-bad-answer-text > div > p ~ p").text()
          ).replaceAll("\n", ". ");
          // get first exercice page of lesson page
          axios
            .get(firstExerciceLink)
            .then((respond) => {
              let html = respond.data;
              const $ = cheerio.load(html);
              let data = $("div.video_player_loader").attr("data-broadcast"); // string
              let ExerciceVideoQualityOptions = JSON.parse(data); // make array
              let videoLink = ExerciceVideoQualityOptions.find((value) => {
                return value.label === "480p";
              });
              $("div.consigne-default").after(`
          <video width: "800px" controls>
          <source src="../../../${videosPath}/${lessonPath}-ex1.mp4" type="video/mp4"">
          </video>`);
              //get video from URL
              fs.access(`${videosPath}/${lessonPath}-ex1.mp4`, (error) => {
                if (error) {
                  axios({
                    method: "get",
                    url: `${videoLink.url}`,
                    responseType: "stream",
                  })
                    .then(function (response) {
                      response.data.pipe(
                        fs.createWriteStream(
                          `./${videosPath}/${lessonPath}-ex1.mp4`
                        )
                      );
                    })
                    .catch((error) => console.log(error || ""));
                } else {
                  console.log("Video downloaded already");
                }
              });
              let ajaxId = $(
                "div.field--type-entity-reference > div.field--item"
              ).attr("data-media-id");
              $("span.loader_message").replaceWith(
                `<button><a style:"text-decoration:none;" href='../../../../${videoAndTranscriptionPath}/index-videoANDsub.html'>Watch the video with transcription</a></button>`
              );
              $("footer.exercice-footer").replaceWith("");
              $("div.group-right").replaceWith("");
              const exerciceHtml = $.html();
              //get exrcice items
              axios
                .get(`https://apprendre.tv5monde.com/fr/exercice/${exerciceId}`)
                .then((respond) => {
                  let html = respond.data
                    .replaceAll("[–]", "<b>–</b>")
                    .replaceAll("{", "<span>")
                    .replaceAll("}", "</span>")
                    .replaceAll("<script", "<!--<script")
                    .replaceAll("</script>", "-->")
                    .replaceAll("[.]", "");
                  let $ = cheerio.load(html);
                  $(".group-left").replaceWith("");
                  $("a").replaceWith("");
                  const exerciceItem = $.html();

                  const data = {
                    title: `${lessonPath}`,
                    language: `${langPath}`,
                    level: `${levelPath}`,
                    originUrl: link,
                    videoLink: videoLink.url,
                    exercice: [
                      {
                        name: "firstExercice",
                        type: "Choose the correct answer block",
                        options: [],
                      },
                    ],
                  };

                  for (let i = 0; i < $(".field-item > span").length; i++) {
                    data.exercice[0].options.push({
                      text: $(".field-item > span")[i].children[0].data,
                      isCorrect: false,
                    });
                  }
                  for (let i = 0; i < $(".field-item > span").length; i++) {
                    data.exercice[0].options.push({
                      text: $(".field-item > u")[i].children[0].data,
                      isCorrect: true,
                    });
                  }

                  fs.writeFile(
                    `${exercicePath}/JS/main-ex1.js`,
                    ` 
              var exerciceSolution = "${exerciceSolution}
              var exerciceGood = "${exerciceGood}"
              var exerciceBad = "${exerciceBad}"
var selectorSpanHTMLs = document.querySelectorAll(".field-item > span");
selectorSpanHTMLs.forEach((value) => {
  value.classList.add("selector");
});
var selectorUHTMLs = document.querySelectorAll(".field-item > u");
selectorUHTMLs.forEach((value) => {
  value.classList.add("selector");
});
document.querySelectorAll(".selector").forEach((value) => {
  value.style.border = "2px solid #8498C3";
  value.style.borderRadius = "4px";
  value.style.padding = "5px 8px 8px 8px";
  value.style.display = "inline-block";
  value.style.marginBottom = "10px";
  value.style.cursor = "pointer";
  value.style.textDecoration = "none";
  value.addEventListener("click", () => {
    value.classList.toggle("selected");
    if (value.classList.contains("selected")) {
      value.style.textDecoration = "none";
      value.style.background = "#002152";
      value.style.borderColor = "#002152";
      value.style.color = "#FFF";
    } else {
      value.style.textDecoration = "none";
      value.style.background = "white";
      value.style.borderColor = "#8498C3";
      value.style.color = "black";
    }
    if (value.classList.contains("good")) {
      value.classList.remove("good");
    } else if (value.classList.contains("bad")) {
      value.classList.remove("bad");
    } else {
    }
  });
});
document.querySelector(".exo-actions").style.display = "flex";
document.querySelector(".exo-actions").style.justifyContent = "space-between";
const instrucBtnHTML = document.querySelector(".btn-exo-help");
const validerBtnHTML = document.querySelector(".btn-exo-validate");
validerBtnHTML.style.whiteSpace = "nowrap";
validerBtnHTML.style.border = "none";
validerBtnHTML.style.padding = "12px 55px";
validerBtnHTML.style.borderRadius = "8px";
validerBtnHTML.style.color = "#fff";
validerBtnHTML.style.fontWeight = "bold";
validerBtnHTML.style.background =
  "linear-gradient(224.47deg,#00BAD8 0%,#018BF1 99.09%)";
validerBtnHTML.style.position = "relative";
validerBtnHTML.style.cursor = "pointer";
instrucBtnHTML.style.whiteSpace = "nowrap";
instrucBtnHTML.style.border = "none";
instrucBtnHTML.style.padding = "12px 48px";
instrucBtnHTML.style.borderRadius = "8px";
instrucBtnHTML.style.color = "#002152";
instrucBtnHTML.style.fontWeight = "bold";
const exerciceContainerHTML = document.querySelector(".field-items");
const resultContainerHTML = document.createElement("div");
const resultTitleHTML = document.createElement("div");
const resultClueHTML = document.createElement("div");
const resultTextHTML = document.createElement("div");
const resultSolutionBtnHTML = document.createElement("div");
const resultSolutionHTML = document.createElement("div");
resultContainerHTML.appendChild(resultTitleHTML);
resultContainerHTML.appendChild(resultClueHTML);
resultContainerHTML.appendChild(resultTextHTML);
resultContainerHTML.appendChild(resultSolutionBtnHTML);
resultContainerHTML.appendChild(resultSolutionHTML);
exerciceContainerHTML.appendChild(resultContainerHTML);
validerBtnHTML.addEventListener("click", () => {
  let isBravo =
    document.querySelectorAll("u.selected").length === selectorUHTMLs.length &&
    document.querySelectorAll("span.selected").length === 0;
  resultContainerHTML.style.border = "1px solid black";
  resultContainerHTML.style.textAlign = "center";
  resultContainerHTML.style.marginBottom = "50px";
  resultContainerHTML.style.borderRadius = "8px";
  resultTitleHTML.innerHTML = isBravo
    ? "<h3 style='color: white;'>Bravo</h3>"
    : "<h3 style='color: white;'>Attention</h3>";
  resultTitleHTML.style.backgroundColor = isBravo ? "#6FBFA1" : "#FB7171";
  resultClueHTML.innerHTML = \`<p> \${
    document.querySelectorAll("u.selected").length
  } ÉLÉMENTS CORRECTEMENT SÉLECTIONNÉS</p><p>\${
    document.querySelectorAll("span.selected").length
  } ÉLÉMENTS SÉLECTIONNÉS EN TROP</p><p>\${
    selectorUHTMLs.length - document.querySelectorAll("u.selected").length
  } ÉLÉMENTS RESTANTS À SÉLECTIONNER</p>\`;
  resultClueHTML.style.color = isBravo ? "#6FBFA1" : "#FB7171";
  resultTextHTML.innerText =
    resultTitleHTML.innerText === "Bravo" ? exerciceGood : exerciceBad;
  resultSolutionBtnHTML.innerHTML = "";
  resultSolutionHTML.innerHTML = "";
  document.querySelectorAll("u.selected").forEach((value) => {
    value.classList.add("good");
    value.style.background = "rgba(111,191,161,0.2)";
    value.style.border = "2px solid #6FBFA1";
    value.style.color = "black";
  });
  document.querySelectorAll("span.selected").forEach((value) => {
    value.classList.add("bad");
    value.style.textDecoration = "line-through";
    value.style.background = "rgba(251,113,113,0.2)";
    value.style.border = "2px solid #FB7171";
    value.style.color = "black";
  });
  if (isBravo) {
  } else {
    resultSolutionBtnHTML.innerHTML = \`<b>Afficher les solutions</b> <button id="solutionBtn" style="display:inline-block; height: 20px; width: 50px; border-radius:5px; border: 1px solid black"></button> <span id="patern"  style="display:none;background: rgba(111,191,161,0.2); border: 2px dashed #6FBFA1; color: #002152; padding: 5px 8px 8px">Les solutions sont en pointillés.</span>\`;
    resultSolutionHTML.innerHTML = \`<p style="display: none; background-color: #6FBFA1; color:white" class="result">Cette activité vous permet de comprendre le contexte de la vidéo : où ça se passe et quels objets font partie du marché du troc. Lisez la solution et faites l’activité suivante pour comprendre le fonctionnement de ce marché.  "</p>\`;
    document
      .querySelector("#solutionBtn")
      .addEventListener("click", function () {
        if (this.style.backgroundColor === "rgb(111, 191, 161)") {
          this.style.backgroundColor = "#FFF";
          document.querySelector(".result").style.display = "none";
          document.querySelector("#patern").style.display = "none";
          selectorUHTMLs.forEach((value) => {
            if (value.classList.contains("good")) {
            } else {
              value.style.background = "#FFF";
              value.style.border = "2px solid #8498C3";
            }
          });
        } else {
          this.style.backgroundColor = "#6FBFA1";
          document.querySelector(".result").style.display = "block";
          document.querySelector("#patern").style.display = "inline-block";
          selectorUHTMLs.forEach((value) => {
            if (value.classList.contains("good")) {
            } else {
              value.style.background = "rgba(111,191,161,0.2)";
              value.style.border = "2px dashed #6FBFA1";
            }
          });
        }
        console.log(this.style.backgroundColor);
      });
  }
});
let InstructImage = document.querySelectorAll(".galerie-image > img");
let numberOfInstructImage = document.querySelectorAll(
  ".galerie-image > img"
).length;
let a = 1;
for (let i = 0; i < numberOfInstructImage; i++) {
  InstructImage[i].setAttribute(
    "src",
    "https://apprendre.tv5monde.com/sites/apprendre.tv5monde.com/files/images/zones-a-cliquer-" +
      a +
      "_0.png"
  );
  a++;
}

             
             `,
                    (error) => console.log(error || "")
                  );
                  fs.writeFile(
                    `${exercicePath}/index-ex1.html`,
                    `
                
                ${exerciceHtml}
                <script src="./JS/main-ex1.js" defer></script>
                ${exerciceItem}
                `,
                    (error) => console.log(error || "")
                  );
                  //  get transcription from URL
                  axios
                    .get(
                      `https://apprendre.tv5monde.com/fr/ajax-get-transcription/${ajaxId}`
                    )
                    .then((respond) => {
                      let html = respond.data[0].data;
                      let $ = cheerio.load(html);
                      data.videoTranscription = [];
                      let numberOfSpan = $("span").length;
                      for (let i = 0; i < numberOfSpan; i++) {
                        data.videoTranscription.push({
                          type: $("span")[i].attribs.class,
                          text: $("span")[i].children[0].data,
                          startTime: Number($("span")[i].attribs.start),
                          endTime: Number($("span")[i].attribs.end),
                        });
                      }
                      fs.writeFile(
                        `${folderPath}/index-data.json`,
                        JSON.stringify(data),
                        (error) => console.log(error || "")
                      );
                      fs.writeFile(
                        `${videoAndTranscriptionPath}/index-videoANDsub.html`,
                        `
            <video width: "100%" controls>
          <source src="../videos/${lessonPath}-ex1.mp4" type="video/mp4"">
          </video>
          <div>
          ${data.videoTranscription.map((value) =>{
              return `<span class="${value.type}" start="${value.startTime}" end="${value.endTime}">${value.text}</span>`
            }).join("")}
          </div>
            <script src="../../../../../videoANDsub.js"></script>
            `,
                        (error) => console.log(error || "")
                      );
                      fs.writeFile(
                        `./videoANDsub.js`,
                        `
            const videoHtml = document.querySelector("video");
const transcription = document.querySelectorAll(".word");
const numberOfSpan = transcription.length;
for (let i = 0; i < numberOfSpan; i++) {
  transcription[i].addEventListener("click", function () {
    videoHtml.currentTime = transcription[i].attributes["start"].value;
  });
}

setInterval(() => {
  videoHtml.ontimeupdate();
}, 10);

videoHtml.ontimeupdate = function () {
  let videoCurrentTime = videoHtml.currentTime;
  transcription.forEach(function (element) {
    if (
      videoCurrentTime >= parseFloat(element.attributes["start"].value) &&
      videoCurrentTime < parseFloat(element.attributes["end"].value)
    ) {
      element.style =
        "background: linear-gradient(180deg,rgba(255,255,255,0) 25%, #a4dae8 25%);";
    } else {
      element.style = "";
    }
  });
};

            `,
                        (error) => console.log(error || "")
                      );
                    })
                    .catch((error) => console.log(error));
                });
            })
            .catch((error) => console.log(error || ""));
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
}
function createDir(path) {
  fs.access(path, (error) => {
    if (error) {
      fs.mkdir(path, { recursive: true }, (error) => {
        console.log(error || `Created new folders at ${path}`);
      });
    } else {
      console.log("The folders already exist");
    }
  });
}
