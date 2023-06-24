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
const folderPath = `./${langPath}/${exercicesPath}/${levelPath}`; // to make path, create directory
const exercicePath = `${langPath}/exercice/`; // exercice path (link to first exercices)
const videosPath = `${langPath}/videos`; // videos path (add video for each first exercice)
try{ //if error, start readline1 to download packages
 allHappenInHere();
 readline1.close();
}
catch(error){
  readline1.question(
  `You need to install these modules: Cheerio, Axios\nDo you want to install these modules?\n[Y/n]\n`,
  (respond) => {
    if (respond.toLocaleLowerCase() === "y") {
      cP.execSync("npm install cheerio", { stdio: [0, 1, 2] });
      cP.execSync("npm install axios", { stdio: [0, 1, 2] });
      console.log("Downloaded! You can run the code again!");
    } else {
      console.log("Stopping code...")
    }
    readline1.close();
  }
);
}

// All happen in here...
function allHappenInHere() {
  const cheerio = require("cheerio");
  const axios = require("axios");     // add packages
// create folders
  createDir(folderPath);
  createDir(exercicePath);
  createDir(videosPath);
  //get lesson page
  axios.get(link)
    .then((respond) => {
      let html = respond.data;
      const $ = cheerio.load(html);
      const firstExerciceLink = domain + $("a.btn").attr("href");
      $("a.btn").attr("href", `../../../${exercicePath}${lessonPath}-ex1.html`); // get first exercice link from the button.
      const newHtml = $.html();
      fs.writeFile(
        `./${langPath}/${exercicesPath}/${levelPath}/${lessonPath}.html`,
        newHtml,
        (error) => console.log(error || "")
      );
      // get first exercice page of lesson page
      axios.get(firstExerciceLink)
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
          <source src="../../${videosPath}/${lessonPath}-ex1.mp4" type="video/mp4"">
          </video>`)
          //get video from URL
          axios({
            method: "get",
            url: `${videoLink.url}`,
            responseType: "stream",
          }).then(function (response) {
            response.data.pipe(
              fs.createWriteStream(`./${videosPath}/${lessonPath}-ex1.mp4`)
            );
          });
          const newHtml = $.html();
          fs.writeFile(
            `${exercicePath}${lessonPath}-ex1.html`,
            newHtml,
            (error) => console.log(error || "")
          );
          //get caption from URL
          let captionLink = JSON.parse($("div.video_player_loader").attr("data-captions")).files[0].file
        //  get transcription from URL
        //  https://apprendre.tv5monde.com/fr/ajax-get-transcription/${data_id}
          axios.get("https://apprendre.tv5monde.com/fr/ajax-get-transcription/97053")
           .then(respond =>{
            let html = respond.data[0].data
            fs.writeFile(`sub.html`,`
            <video width: "800px" controls>
          <source src="../../${videosPath}/${lessonPath}-ex1.mp4" type="video/mp4"">
          </video>
            ${html}`,error => console.log(error || ""))
           })
           .catch(error => console.log(error || "")) 
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
    
}
function createDir(path){
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
