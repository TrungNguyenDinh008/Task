const fs = require("fs");
const cP = require("child_process");
const { log } = require("console");
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
  createDir(`${exercicePath}/first/JS`); // fr/exercice/<lessonPath>/first/JS
  createDir(videosPath); // fr/exercices/<levelPath>/<lessonPath>/video
  createDir(videoAndTranscriptionPath); // fr/exercices/<levelPath>/<lessonPath>/video-and-transcription/<lessonPath>
  //get lesson page
  axios
    .get(link)
    .then((respond) => {
      let html = respond.data;
      const $ = cheerio.load(html);
      //get the lesson list
      let lessonListData = [];
      $("ul.list-unstyled.wrapper-list-exo")
        .children()
        .each((i, item) => {
          lessonListData.push(
            `"${item.children[0].children[1].children[0].children[0].data}"`
          );
        });
      // get the publish day
      let p = $(
        ".field--name-dynamic-token-fieldnode-published-changed-dates"
      ).text();
      //get first exercice link and ID
      const firstExerciceLink = domain + $("a.btn").attr("href");
      const exerciceId = firstExerciceLink.slice(
        43,
        firstExerciceLink.indexOf("?")
      );
      let lessonH1 = lessonPath.replaceAll("-", " ");
      let levelH1 = levelPath.replaceAll("-", " ");
      let lessonImg =
        "https://www.tv5monde.com/cms/template/arche/images/tv5monde_og.jpg";
      $("html").empty().html("<head></head><body></body>").html();
      $("body").append(`
      <style>
      body{
        background-color: #F2F9FE;
        color: #21254F;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 1.2em;
      }
      .header{
        text-align: left
      }
      .gridDiv{
        text-align: center;
        display: grid;
        grid-template-columns: 70% 30%;
        grid-template-rows: auto;
        width: 100%
      }
      .rightDiv{
        text-align: left;
        border-left-style: solid;
      }
      .button{
        white-space: nowrap;
        border: none;
        padding: 12px 55px;
        border-radius: 8px;
        color: rgb(255, 255, 255);
        font-weight: bold;
        background: linear-gradient(224.47deg, rgb(0, 186, 216) 0%, rgb(1, 139, 241) 99.09%);
        cursor: pointer;
      }
      .button > a{
        color: white;
        text-decoration: none;
      }
      .bigButton{
        white-space: nowrap;
        border: none;
        padding: 20px 60px;
        border-radius: 8px;
        color: rgb(255, 255, 255);
        font-weight: bold;
        background: linear-gradient(224.47deg, rgb(0, 186, 216) 0%, rgb(1, 139, 241) 99.09%);
        position: relative;
        cursor: pointer;
      }
      .bigButton > a{
        color: white;
        text-decoration: none;
        font-size: 20px;
      }
      .responsiveImage{
        border-radius: 8px;
        max-height: 39.2%;
        max-width: 61.8%
      }
      .lessonListItem{
        list-style-type: none;
        text-align: left
      }
      .lessonListIndex{
        display: inline-block;
        color: #FFF;
        font-weight: bold;
        background-color: #8498C3;
        border-radius: 100%;
        text-align: center;
        width: 32px;
        height: 32px;
        line-height: 32px;
        margin: 20px auto;
    }
    .lessonListLink{
      color: #00132E;
      display: block;
      text-decoration: none;
      width: 100%;
      padding: 15px 50px 15px 30px;
      background: #FFFFFF;
      box-shadow: 0px 7px 24px rgba(0,58,102,0.0970901);
      border-radius: 8px;
      margin-bottom: 15px;
      cursor: pointer;
    }
    @media screen and (max-width:768px) {
  body{
    text-align: center;
    font-size: 1.5em
  }
  .bigButton{
    display: block
  }
    }
    @media screen and (max-width:414px) {
      body{
        text-align: center
      }
      .lessonListIndex{
        width: 48px;
        height: 48px;
        line-height: 48px;
        font-size: 1.5em

    }
    .lessonListLink{
      width: 100%;
      padding: 30px 100px 30px 100px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
        }
      
      </style>
      <div class="header">
      <button class= "button"><a href="../" class>${
        "Back to " + levelH1.slice(0, 2).toUpperCase()
      }</a></button>
      </div>
      
      <div class= "flexDiv">
      <div class= "leftDiv">
      <h1 class= "lessonHeader" >${
        lessonH1[0].toUpperCase() + lessonH1.slice(1)
      } - ${levelH1[0].toUpperCase() + levelH1.slice(1)}</h1>
            <p>${p}</p>
      <img src=${lessonImg} class="responsiveImage">
      </div>
      <div class= "rightDiv">
       <ol class="lessonList">
      </ol>
      </div>
      </div>
      <button class= "bigButton"><a href="../../../../${exercicePath}/first/">Go to "1.${lessonListData[0].replaceAll(
        '"',
        ""
      )}"</a></button>
      <button class= "bigButton"><a href="../../../../../${videoAndTranscriptionPath}">Watch video with transcription</a></button>
      
      <script>
      let lessonListElm = document.querySelector(".lessonList")
      lessonListData = [${lessonListData}]
      lessonListData.map((value, index)=>{
        let listItem = document.createElement("li")
        let listIndex = document.createElement("span")
        let listLink = document.createElement("a")
        listItem.classList.add("lessonListItem")
        listIndex.classList.add("lessonListIndex")
        listIndex.innerText = index + 1
        listLink.classList.add("lessonListLink")
        listLink.innerText = value
        if(index == 0){
          listLink.setAttribute("href", "../../../../${exercicePath}/first/")
        } else{
          listLink.addEventListener("click", () =>{
            alert("In progress...")
          })
        }
        listItem.appendChild(listIndex)
        listItem.appendChild(listLink)
        lessonListElm.appendChild(listItem)
      })
      </script>

      `);
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
          <source src="../../../../${videosPath}/${lessonPath}-ex1.mp4" type="video/mp4"">
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
              $("div.exercice-header-inner").replaceWith("")
              $("a.visually-hidden.focusable.skip-link").replaceWith("")
              $("footer.exercice-footer").replaceWith("");
              $("div.group-right").replaceWith("");
              $("div.consigne-default").replaceWith("")
              $("div.field field--name-dynamic-token-fieldnode-titre-exercice field--type-ds field--label-hidden field--item").replaceWith("")
              $("span.first-parent").replaceWith("")
              $("span.title-exo-num").replaceWith("")
              $("div.media").replaceWith("")
              const exerciceHtml = $.html();
              //get exrcice items
              axios
                .get(`https://apprendre.tv5monde.com/fr/exercice/${exerciceId}`)
                .then((respond) => {
                  let html = respond.data
                    .replaceAll("[–]", "")
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

                  fs.writeFileSync(
                    `${exercicePath}/first/JS/main.js`,
                    ` 
var windowInnerWidth  = document.documentElement.clientWidth;
setInterval(()=>{
windowInnerWidth  = document.documentElement.clientWidth;
if(windowInnerWidth < 414){
  instrucBtnHTML.innerHTML = "?"
} else {
  instrucBtnHTML.innerHTML = "Comment faire l'exercice ?"
}
},5000)                    
var helpBtn = document.querySelector(".btn-exo-help")
var helpImgsDiv = document.querySelector(".galerie-image")
helpImgsDiv.classList.toggle("hide")

helpBtn.addEventListener("click",()=>{
  helpImgsDiv.classList.toggle("hide")
})                   
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
const instrucBtnHTML = document.querySelector(".btn-exo-help");
const validerBtnHTML = document.querySelector(".btn-exo-validate");
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
                    `${exercicePath}/first/index.html`,
                    `
                <style>
                html, .page-exercice{
                  background-color: #F2F9FE;
                }
                body{
                  background-color: #F2F9FE;
                  color: #21254F;
                  font-family: Arial, Helvetica, sans-serif;
                  font-size: 1.2em;
                  text-align: center
                }
                video{
                  width: 100%
                }
                .pageHeader{
                  font-size: 3em;
                  margin: 30px auto;
                  text-align: center;
                  color: #21254F;
                }
                .header{
                  font-size: 2em;
                  margin: 30px auto;
                  text-align: center;
                  color: #21254F;
                }
                .button{
                  white-space: nowrap;
                  border: none;
                  padding: 12px 55px;
                  border-radius: 8px;
                  color: rgb(255, 255, 255);
                  font-weight: bold;
                  background: linear-gradient(224.47deg, rgb(0, 186, 216) 0%, rgb(1, 139, 241) 99.09%);
                  cursor: pointer;
                }
                .button > a{
                  color: white;
                  text-decoration: none;
                }
                .dialog-off-canvas-main-canvas{
                  margin: 20px auto
                }
                .media{
                  display: block
                }
                .videoButton{
                  margin: 35px 50%;
                  transform: translateX(-50%);
                  
                }
                .field--name-field-exercice-zac{
                  color: #21254F;
                  border: 1px solid black;
                  padding: 20px 50px;
                  margin: 35px auto
                }
                .img-responsive{
                  display: inline-block
                }
                .hide{
                  display: none
                }
                .field--name-field-exercice-zac > div > div > *{
                  margin: auto 10px
                }
                .exo-actions{
                  display: flex; 
                  justify-content: space-between
                }
                .btn-exo-validate{
                  white-space : nowrap;
                  border : none;
                  padding : 12px 55px;
                  border-radius : 8px;
                  color : #fff;
                  font-weight : bold;
                  background :
                    linear-gradient(224.47deg,#00BAD8 0%,#018BF1 99.09%);
                /*  validerBtnHTML.style.position : relative; */
                  cursor : pointer;
                }
                .btn-exo-help{
                  white-space : nowrap;
                  border : none;
                  padding : 12px 48px;
                  border-radius : 8px;
                  color : #002152;
                  font-weight : bold;
                  cursor: pointer;
                }
                @media screen and(max-width: 768px){
                  .dialog-off-canvas-main-canvas{
                    margin: 30px auto
                  }
                  .exo-actions > *{
                    flex-basis: 100%
                  }
                }
                  @media screen and(max-width: 600px){
                    button{
                      padding: 12px 30px;
                    }
                    .videoButton{
                      padding: 12px 30px;
                    }
                }
                </style>
                <button class="button"><a href="../../../../${folderPath}">Back</a></button>
                <h1 class="pageHeader">${lessonListData[0]}</h1>
                ${exerciceHtml}
                <button class="button videoButton"><a style:"text-decoration:none;" href='../../../../${videoAndTranscriptionPath}/index.html'>Watch the video with transcription</a></button>
                <script src="./JS/main.js" defer></script>
                <h1 class="header">Exercice:</h1>
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
                      $("show")
                        .children()
                        .map((i, item) => {
                          let e = i + 1;
                          if (item.name === "div") {
                            let sentence = {
                              type: "sentence",
                              tagName: item.name,
                              words: [],
                              numberOfWord: $(
                                `show > :nth-child(${e})`
                              ).children().length,
                            };
                            data.videoTranscription.push(sentence);
                          } else if (
                            item.name === "strong" ||
                            item.name === "em" ||
                            item.name === "span"
                          ) {
                            let word = {
                              type: "word",
                              tagName: item.name,
                              text: item.children[0].data,
                            };
                            data.videoTranscription.push(word);
                          } else {
                            console.log("error...");
                          }
                        });
                      var accumulator = [];
                      $("show > *")
                        .children()
                        .map((i, item) => {
                          if (item.name == "span") {
                            accumulator.push({
                              type: "word",
                              tagName: item.name,
                              text: item.children[0].data,
                              start: item.attribs.start,
                              end: item.attribs.end,
                            });
                          } else {
                            if(item.data === undefined){
                              accumulator.push({
                                type: "word",
                                tagName: item.name,
                                text: item.children[0].data,
                              });
                            } else {
                              accumulator.push({
                              type: "word",
                              tagName: item.name,
                              text: item.data,
                            });
                            }
                          }
                        });
                      for (var sentence of data.videoTranscription) {
                        if (sentence.numberOfWord) {
                          sentence.words = accumulator.splice(
                            0,
                            sentence.numberOfWord
                          );
                        } else {
                        }
                      }
                      fs.writeFile(
                        `${folderPath}/data.json`,
                        JSON.stringify(data),
                        (error) => console.log(error || "")
                      );
                      fs.writeFile(
                        `${videoAndTranscriptionPath}/index.html`,
                        `
                        <style>
                        body{
                          text-align: center;
                          background-color: #F2F9FE;
                          color: #21254F;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 1.2em;
                        }
                        video{
                          border-radius: 8px
                        }
                        .flexBox{
                          display: flex;
                        }
                        .flexBox > div{
                          border-radius: 8px;
                          margin: 20px;
                          background-color: #FFFFFF;
                        }
                        .videoDiv{
                          height: fit-content;
                          block-size: fit-content;
                        }
                        #transcriptionContent{
                          text-align: left;
                          width: 100%;
                          height: 480px;
                          overflow-y: scroll;
                        }
                        #transcriptionContent > b{
                          display: block
                        }
                        #transcriptionContent > em{
                          display: inline-block
                        }
                        .button{
                          white-space: nowrap;
                          border: none;
                          padding: 12px 55px;
                          border-radius: 8px;
                          color: rgb(255, 255, 255);
                          font-weight: bold;
                          background: linear-gradient(224.47deg, rgb(0, 186, 216) 0%, rgb(1, 139, 241) 99.09%);
                          cursor: pointer;
                  
                        }
                        .button > a{
                          color: white;
                          text-decoration: none;
                          font-size: 20px;
                        }
                        @media screen and (max-width:1024px) {
                          .flexBox{
                            flex-direction: column
                          }
                          .flexBox > div{
                            margin: 20px auto
                          }
                          #transcriptionContent{
                            height: 600px;
                          }
                          .video{
                           flex-basis: 100%
                          }
                          @media screen and (max-width:600px) {
                            #transcriptionContent{
                              height: 100%;
                            }

                            }

                        </style>
                        <div class="flexBox">
                        <div class="videoDiv">
                        <video controls class="video">
          <source src="../videos/${lessonPath}-ex1.mp4" type="video/mp4"">
          </video>
                        </div>
            
          <div id="transcriptionContent">
          <h1>Transcription:</h1>

          </div>
                        </div>
                        <button class="button"><a href="../../../../.${folderPath}">Back</a></button>
                        
            <script src="./main.js"></script>
            <script src="../../../../../videoANDsub.js" defer></script>
            `,
                        (error) => console.log(error || "")
                      );
                      fs.readFile(
                        `${folderPath}/data.json`,
                        "utf-8",
                        (err, data) => {
                          if (err) {
                            console.log(err);
                          } else {
                            let newData = JSON.parse(data);
                            let transcriptionData = newData.videoTranscription;
                            transcriptionData =
                              JSON.stringify(transcriptionData);
                            fs.writeFile(
                              `${videoAndTranscriptionPath}/main.js`,
                              `
                              function Func() {
                                fetch(
                                  "../data.json"
                                )
                                  .then((res) => {
                                    return res.json();
                                  })
                                  .then((resData) => {
                                    let data = resData.videoTranscription
                                    let contentContainer = document.getElementById("transcriptionContent");
                                    data.map((value) => {
                                      let htmlElm = document.createElement(value.tagName);
                                      htmlElm.classList.add(value.type);
                                      if (value.type === "sentence") {
                                        value.words.map((value) => {
                                          let childElm = document.createElement(value.tagName);
                                          childElm.classList.add(value.type);
                                          if (value.tagName === "span") {
                                            childElm.setAttribute("start", value.start);
                                            childElm.setAttribute("end", value.end);
                                          } else {
                                            // do nothing
                                          }
                                          childElm.innerText = value.text;
                                          htmlElm.appendChild(childElm);
                                        });
                                      } else {
                                        if (value.tagName === "strong" || value.tagName === "em") {
                                        } else {
                                          htmlElm.setAttribute("start", value.startTime);
                                          htmlElm.setAttribute("end", value.endTime);
                                        }
                                        htmlElm.innerText = value.text;
                                      }
                                      contentContainer.appendChild(htmlElm);
                                    });
                                  });
                              }
                              
                              Func();
                        `,
                              (err) => console.log(err || "")
                            );
                          }
                        }
                      );
                      fs.writeFile(
                        `./videoANDsub.js`,
                        `
                        setTimeout(() => {
                          const videoHtml = document.querySelector("video");
                          const transcription = document.querySelectorAll(".sentence > span.word");
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
                        }, 2000);
                        
            `,
                        (error) => console.log(error || "")
                      );
                    })
                    .catch((error) => console.log(error));
                });
            })
            .catch((error) => console.log(error || ""));
        })
        //If it doesn't have the solution page, run the code below:
        .catch((error) => {
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
          <source src="../../../../${videosPath}/${lessonPath}-ex1.mp4" type="video/mp4"">
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
                `<button><a style:"text-decoration:none;" href='../../../../${videoAndTranscriptionPath}/index.html'>Watch the video with transcription</a></button>`
              );
              $("footer.exercice-footer").replaceWith("");
              $("div.group-right").replaceWith("");
              $("div.exercice-header-inner").replaceWith("")
              $("a.visually-hidden.focusable.skip-link").replaceWith("")
              $("footer.exercice-footer").replaceWith("");
              $("div.group-right").replaceWith("");
              $("div.consigne-default").replaceWith("")
              $("div.field field--name-dynamic-token-fieldnode-titre-exercice field--type-ds field--label-hidden field--item").replaceWith("")
              $("span.first-parent").replaceWith("")
              $("span.title-exo-num").replaceWith("")
              $("div.media").replaceWith("")
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

                  fs.writeFile(
                    `${exercicePath}/first/index.html`,
                    `
                    <style>
                    html, .page-exercice{
                      background-color: #F2F9FE;
                    }
                    body{
                      background-color: #F2F9FE;
                      color: #21254F;
                      font-family: Arial, Helvetica, sans-serif;
                      font-size: 1.2em;
                      text-align: center
                    }
                    video{
                      width: 100%
                    }
                    .pageHeader{
                      font-size: 3em;
                      margin: 30px auto;
                      text-align: center;
                      color: #21254F;
                    }
                    .header{
                      font-size: 2em;
                      margin: 30px auto;
                      text-align: center;
                      color: #21254F;
                    }
                    .button{
                      white-space: nowrap;
                      border: none;
                      padding: 12px 55px;
                      border-radius: 8px;
                      color: rgb(255, 255, 255);
                      font-weight: bold;
                      background: linear-gradient(224.47deg, rgb(0, 186, 216) 0%, rgb(1, 139, 241) 99.09%);
                      cursor: pointer;
                    }
                    .button > a{
                      color: white;
                      text-decoration: none;
                    }
                    .dialog-off-canvas-main-canvas{
                      margin: 20px auto
                    }
                    .media{
                      display: block
                    }
                    .videoButton{
                      margin: 35px 50%;
                      transform: translateX(-50%);
                      
                    }
                    .field--name-field-exercice-zac{
                      color: #21254F;
                      border: 1px solid black;
                      padding: 20px 50px;
                      margin: 35px auto
                    }
                    .img-responsive{
                      display: inline-block
                    }
                    .hide{
                      display: none
                    }
                    .field--name-field-exercice-zac > div > div > *{
                      margin: auto 10px
                    }
                    .exo-actions{
                      display: flex; 
                      justify-content: space-between
                    }
                    .btn-exo-validate{
                      white-space : nowrap;
                      border : none;
                      padding : 12px 55px;
                      border-radius : 8px;
                      color : #fff;
                      font-weight : bold;
                      background :
                        linear-gradient(224.47deg,#00BAD8 0%,#018BF1 99.09%);
                    /*  validerBtnHTML.style.position : relative; */
                      cursor : pointer;
                    }
                    .btn-exo-help{
                      white-space : nowrap;
                      border : none;
                      padding : 12px 48px;
                      border-radius : 8px;
                      color : #002152;
                      font-weight : bold;
                      cursor: pointer;
                    }
                    @media screen and(max-width: 768px){
                      .dialog-off-canvas-main-canvas{
                        margin: 30px auto
                      }
                      .exo-actions > *{
                        flex-basis: 100%
                      }
                    }
                      @media screen and(max-width: 600px){
                        button{
                          padding: 12px 30px;
                        }
                        .videoButton{
                          padding: 12px 30px;
                        }
                    }
                    </style>
                    <button class="button"><a href="../../../../${folderPath}">Back</a></button>
                    <h1 class="pageHeader">${lessonListData[0]}</h1>
                    ${exerciceHtml}
                    <button class="button videoButton"><a style:"text-decoration:none;" href='../../../../${videoAndTranscriptionPath}/index.html'>Watch the video with transcription</a></button>
                    <script src="./JS/main.js" defer></script>
                    <h1 class="header">Exercice:</h1>
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
                      $("show")
                        .children()
                        .map((i, item) => {
                          let e = i + 1;
                          if (item.name === "div") {
                            let sentence = {
                              type: "sentence",
                              tagName: item.name,
                              words: [],
                              numberOfWord: $(
                                `show > :nth-child(${e})`
                              ).children().length,
                            };
                            data.videoTranscription.push(sentence);
                          } else if (
                            item.name === "strong" ||
                            item.name === "em" ||
                            item.name === "span"
                          ) {
                            let word = {
                              type: "word",
                              tagName: item.name,
                              text: item.children[0].data,
                            };
                            data.videoTranscription.push(word);
                          } else {
                            console.log("error...");
                          }
                        });
                      var accumulator = [];
                      $("show > *")
                        .children()
                        .map((i, item) => {
                          if (item.name == "span") {
                            accumulator.push({
                              type: "word",
                              tagName: item.name,
                              text: item.children[0].data,
                              start: item.attribs.start,
                              end: item.attribs.end,
                            });
                          } else {
                            if(item.data === undefined){
                              accumulator.push({
                                type: "word",
                                tagName: item.name,
                                text: item.children[0].data,
                              });
                            } else {
                              accumulator.push({
                              type: "word",
                              tagName: item.name,
                              text: item.data,
                            });
                            }
                          }
                        });
                      for (var sentence of data.videoTranscription) {
                        if (sentence.numberOfWord) {
                          sentence.words = accumulator.splice(
                            0,
                            sentence.numberOfWord
                          );
                        } else {
                        }
                      }
                      fs.writeFile(
                        `${folderPath}/data.json`,
                        JSON.stringify(data),
                        (error) => console.log(error || "")
                      );
                      fs.writeFile(
                        `${videoAndTranscriptionPath}/index.html`,
                        `
                        <style>
                        body{
                          text-align: center;
                          background-color: #F2F9FE;
                          color: #21254F;
                          font-family: Arial, Helvetica, sans-serif;
                          font-size: 1.2em;
                        }
                        video{
                          border-radius: 8px
                        }
                        .flexBox{
                          display: flex;
                        }
                        .flexBox > div{
                          border-radius: 8px;
                          margin: 20px;
                          background-color: #FFFFFF;
                        }
                        .videoDiv{
                          height: fit-content;
                          block-size: fit-content;
                        }
                        #transcriptionContent{
                          text-align: left;
                          width: 100%;
                          height: 480px;
                          overflow-y: scroll;
                        }
                        #transcriptionContent > b{
                          display: block
                        }
                        #transcriptionContent > em{
                          display: inline-block
                        }
                        .button{
                          white-space: nowrap;
                          border: none;
                          padding: 12px 55px;
                          border-radius: 8px;
                          color: rgb(255, 255, 255);
                          font-weight: bold;
                          background: linear-gradient(224.47deg, rgb(0, 186, 216) 0%, rgb(1, 139, 241) 99.09%);
                          cursor: pointer;
                  
                        }
                        .button > a{
                          color: white;
                          text-decoration: none;
                          font-size: 20px;
                        }
                        @media screen and (max-width:1024px) {
                          .flexBox{
                            flex-direction: column
                          }
                          .flexBox > div{
                            margin: 20px auto
                          }
                          #transcriptionContent{
                            height: 600px;
                          }
                          .video{
                           flex-basis: 100%
                          }
                          @media screen and (max-width:600px) {
                            #transcriptionContent{
                              height: 100%;
                            }

                            }

                        </style>
                        <div class="flexBox">
                        <div class="videoDiv">
                        <video controls class="video">
          <source src="../videos/${lessonPath}-ex1.mp4" type="video/mp4"">
          </video>
                        </div>
            
          <div id="transcriptionContent">
          <h1>Transcription:</h1>

          </div>
                        </div>
                        <button class="button"><a href="../../../../.${folderPath}">Back</a></button>
                        
            <script src="./main.js"></script>
            <script src="../../../../../videoANDsub.js" defer></script>
            `,
                        (error) => console.log(error || "")
                      );
                      fs.readFile(
                        `${folderPath}/data.json`,
                        "utf-8",
                        (err, data) => {
                          if (err) {
                            console.log(err);
                          } else {
                            let newData = JSON.parse(data);
                            let transcriptionData = newData.videoTranscription;
                            transcriptionData =
                              JSON.stringify(transcriptionData);
                            fs.writeFile(
                              `${videoAndTranscriptionPath}/main.js`,
                              `
                              function Func() {
                                fetch(
                                  "../data.json"
                                )
                                  .then((res) => {
                                    return res.json();
                                  })
                                  .then((resData) => {
                                    let data = resData.videoTranscription
                                    let contentContainer = document.getElementById("transcriptionContent");
                                    data.map((value) => {
                                      let htmlElm = document.createElement(value.tagName);
                                      htmlElm.classList.add(value.type);
                                      if (value.type === "sentence") {
                                        value.words.map((value) => {
                                          let childElm = document.createElement(value.tagName);
                                          childElm.classList.add(value.type);
                                          if (value.tagName === "span") {
                                            childElm.setAttribute("start", value.start);
                                            childElm.setAttribute("end", value.end);
                                          } else {
                                            // do nothing
                                          }
                                          childElm.innerText = value.text;
                                          htmlElm.appendChild(childElm);
                                        });
                                      } else {
                                        if (value.tagName === "strong" || value.tagName === "em") {
                                        } else {
                                          htmlElm.setAttribute("start", value.startTime);
                                          htmlElm.setAttribute("end", value.endTime);
                                        }
                                        htmlElm.innerText = value.text;
                                      }
                                      contentContainer.appendChild(htmlElm);
                                    });
                                  });
                              }
                              
                              Func();
                        `,
                              (err) => console.log(err || "")
                            );
                          }
                        }
                      );
                      fs.writeFile(
                        `./videoANDsub.js`,
                        `
                        setTimeout(() => {
                          const videoHtml = document.querySelector("video");
                          const transcription = document.querySelectorAll(".sentence > span.word");
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
                        }, 2000);
                                    `,
                        (error) => console.log(error || "")
                      );
                    })
                    .catch((error) => console.log(error));
                });
            })
            .catch((error) => console.log(error || ""));
        });
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
