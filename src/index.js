const Intersections = require('./intersections.js');
const { loadCSVData } = require('./csv-loader.js');

// For debugging purposes, all functions are available here...
const Intersection = require('./intersection');
const CameraViews = require('./camera-views');
const Location = require('./location');

// Main:

let csvData = loadCSVData();
if(csvData) {

  String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  };

  const intersections = new Intersections(csvData);
  console.log(intersections);

  initList(intersections);
  let toronto = initMap(intersections);

  //Creates a list intersections in the webpage
  function initList(intersections){
    //Getting street names:
    const streets = intersections.streets();
    console.log(streets);

    //Putting street names in menu
    var list = document.querySelector('#list');
    streets.forEach(street=>{
    var div = document.createElement('div');
    div.innerText = street;
    div.classList.add("menu-item");
    div.title=street;

    list.appendChild(div);
      //Putting a click listener on all street names
      div.addEventListener("click", (e) => {showCamera(e.target.title, toronto);});
    })
  }
  
  //---------------------------------------------------------
  //Map:
  function initMap(intersections){
    let toronto = L.map('mapid').setView([43.6532, -79.3832], 12.2);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11'
    }).addTo(toronto);
  
    //Adding markers for all intersections:
    console.log(intersections.data);
  
    var myFeatureGroup = L.featureGroup().addTo(toronto).on("click", groupClick);
  
    intersections.data.forEach(section => {
      var mark = L.marker(section.location.toArray()).addTo(myFeatureGroup)
      .bindPopup(`${section.mainRoad} / ${section.crossRoad}`);
      mark.id = `${section.id}`;
    })
    return toronto;
  }
  function groupClick(e) {
    showCamera(Number(e.layer.id), toronto);
  }

  function showCamera(cameraName, toronto){
    
    //Empty containers before adding anything new:
    let liveContainer = document.querySelector('#liveImage');
    liveContainer.innerHTML='';
    let mainText = liveContainer.parentElement.firstElementChild;
    mainText.innerHTML = '';
    let intView = document.querySelector('#cameraImages');
    intView.innerHTML='';

    let intsection;
    if(isNaN(cameraName)){
      console.log( 'In the showcamera function\n', cameraName);
      console.log(intersections.searchByStreet(cameraName), cameraName);
  
      //Find the intersection object pertaining to the selected menu item
      [intsection] = intersections.searchByStreet(cameraName);
    }
    else{
      //a camera id is passed to the function:
      console.log( 'In the showcamera number function\n');
      console.log(cameraName)
      console.log(intersections.getById(cameraName), cameraName);
  
      //Find the intersection object pertaining to the selected menu item
      intsection = intersections.getById(cameraName);
    }
    
    console.log(toronto);
    toronto.flyTo(intsection.location.toArray(), 17);
    //Live Traffic image:
    var liveImg = document.createElement('img');
    liveImg.src=intsection.trafficUrl;
    liveContainer.appendChild(liveImg);
    let span = `<span class="liveFeed text-item" style="font-weight: bold; color: red; padding: 2px; margin-right: 5px; border: 2.5px solid rgb(230, 0, 0);">LIVE</span>`;
    mainText.innerHTML = span;
    mainText.appendChild(document.createTextNode(`${intsection.mainRoad} / ${intsection.crossRoad}:`.toProperCase()));
    
    let directions = Object.keys(intsection.cameraViews);
    //Showing different camera views for the intersection
    Object.values(intsection.cameraViews).forEach( (cameraView, i) => {
      var text = document.createElement('div');
      text.className = 'text-item';
      text.innerHTML = `${directions[i]}: `.toProperCase();
      intView.appendChild(text);  
      var img = document.createElement('img');
      img.src=cameraView;
      img.className = 'cameraImage';
      intView.appendChild(img);
    })
  }
}