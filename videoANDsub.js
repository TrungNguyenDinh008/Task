
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

            