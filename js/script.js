let currentSong = new Audio();
let songs;
let currfolder;

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format the output as "minutes:seconds" (with leading zeros if necessary)
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {

  currfolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }

  //Show all the songs in the playlist
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="/images/music.svg" alt="">
        <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
          <div>Arpit</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="images/play.svg" alt="">
        </div></li>`;
  }

  //Attach an event listener to each song
  let songList = document.querySelector(".songList").getElementsByTagName("li")
  Array.from(songList).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    })
  })
    return songs;
}

const playMusic = (track, pause = false) => {
  //It will play music on clicking in song name
  currentSong.src = `/${currfolder}/` + track
  if (!pause) {
    currentSong.play()
    play.src = "images/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
  let a = await fetch(`/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-1)[0]
      //Get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`)
      let response = await a.json()
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
        <div class="play">
          <svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="" />
        <h2>${response.title}</h2>
        <p>${response.description}</p>
      </div>`
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])
    })
  })
}

async function main() {

  // Get the list of all the song
  await getSongs("songs/ncs")
  playMusic(songs[0], true)

  // Display all the albums on the page
  displayAlbums();

  //Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "images/pause.svg"
    }
    else {
      currentSong.pause();
      play.src = "images/play.svg"
    }
  })

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {

    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })


  //Add an event listener for hamburger 
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  //Add an event listener for close button 
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })

  //Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause()
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
  })

  //Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

    if (index + 1 < songs.length) {
      playMusic(songs[index + 1])
    }
  })

  // Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
    if(currentSong.volume > 0){
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("images/mute.svg","images/volume.svg")
    }
  })

  // Add eventlistener to mute the track
  document.querySelector(".volume>img").addEventListener("click",e =>{
    if(e.target.src.includes("images/volume.svg")){
      e.target.src = e.target.src.replace("images/volume.svg","images/mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else{
      e.target.src = e.target.src.replace("images/mute.svg","images/volume.svg")
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  })

}
main()
