//functions:
//function for quran
function readQuran(Sura)
{
  var path = "../audio/";
  var abs_path = "http://localhost:3000/audio/"
  var audio = document.getElementById("audio");
  var num = localStorage.getItem("currentSura");
  console.log(" before: "+num);


  if(Sura == "next")
  {
    if(num == '4')//f l7a9i9a 114
    {
      num = 1
    }
    else
      num++;
  }
  else if(Sura == "previous")
  {
    if(num == '1')
    {
      num = 4;//f l7a9i9a 114
    }
    else
      num--;
  }
  else{
    num = Sura;
  }
  localStorage.setItem("currentSura", num)
  console.log("after: "+num);
  path = path+num+".mp3";
  abs_path = abs_path+num+".mp3";
  audio.src = path;
  audio.load();
  audio.play();

  var jsmediatags = window.jsmediatags;
  new jsmediatags.Reader(abs_path)
  .setTagsToRead(["title", "artist"])
  .read({
    onSuccess: function(tag) {
      console.log(tag.tags.title);
      document.getElementById("Sura").innerHTML =  tag.tags.title;
      document.getElementById("Reader").innerHTML =  tag.tags.artist;
    },
    onError: function(error) {
      console.log(':(', error.type, error.info);
    }
  });
}





//function to check the difference between now and next salat time
function checkNextSalat(){
  var now = new Date();
  var nextSalat_time = new Date();
  var time = localStorage.getItem("nextSalat_time").split(":");
  nextSalat_time.setDate(localStorage.getItem("nextSalat_day"));
  nextSalat_time.setMonth(localStorage.getItem("nextSalat_month"));
  nextSalat_time.setHours(time[0]);
  nextSalat_time.setMinutes(time[1]);

  if(nextSalat_time.getTime() <=  now.getTime())
  {
    updateNextSalat();

    //play audio
    var audio = new Audio('../audio/adan.mp3');
    setTimeout(function(){ console.log("H atdir !"); }, 3000);
    audio.play()

  }
}

//function to set next salat
function updateNextSalat(position = null){
  var lat = 0;
  var lng = 0;
  if(position !=null)
  {
    lat = position.coords.latitude;
    lng = position.coords.longitude;
  }
  else{
    lat = parseFloat(localStorage.getItem("lat"));
    lng = parseFloat(localStorage.getItem("lng"));
  }
  var offset = 0;
  var date = new Date()
  var timestamp = date.getTime()/1000 + date.getTimezoneOffset() * 60 

  var apikey = 'AIzaSyCamf7O6w1JE09lGbeTJQZ1KA4EyVErxOE'
  var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + lat+", "+lng + '&timestamp=' + timestamp + '&key=' + apikey
  var xhr = new XMLHttpRequest() 
  xhr.open('GET', apicall)
  xhr.onload = function(){
    if (xhr.status === 200){ 
      var timezone = JSON.parse(xhr.responseText) 
      if (timezone.status == 'OK'){
        offset = (timezone.dstOffset  + timezone.rawOffset)/3600;
        var times = prayTimes.getTimes(date, [lat, lng], offset);
        var list = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];
        var nextSalat_name = "";
        var i=0;
        while (i < list.length)
        {
          var time_tab =times[list[i].toLowerCase()].split(":");
          date.setHours(time_tab[0]);
          date.setMinutes(time_tab[1]);
          if (Date.now() < date){
            nextSalat_name = list[i];
            break;
          }
          i= i+1;
        }
        if(i == list.length){
          date.setDate(date.getDate()+1);
          console.log("day: "+ date.getDate());
          if(date.getDate()==1){
            date.setMonth(date.getMonth()+1);
          }
          console.log("day: "+ date.getMonth());
          times = prayTimes.getTimes(date, [lat, lng], offset);
          var time_tab =times[list[0].toLowerCase()].split(":");
          date.setHours(time_tab[0]);
          date.setMinutes(time_tab[1]);

          nextSalat_name = list[0];
        }
        if (typeof(Storage) !== "undefined"){
          localStorage.setItem("nextSalat_name", nextSalat_name);
          localStorage.setItem("nextSalat_time", times[nextSalat_name.toLowerCase()]);
          localStorage.setItem("nextSalat_day", date.getDate());
          localStorage.setItem("nextSalat_month", date.getMonth());
          localStorage.setItem("lat", lat);
          localStorage.setItem("lng", lng);
        }
        else {
          document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
        }
        try{

          setNextSalat();
        }
        catch(e){
            console.log("7na mashi tema!");
        }
      }
    }
    else{
      console.log('Request failed.  Returned status of ' + xhr.status)
    }
  }

  xhr.send()  
}

// function to set salawat and other information (location name and date)
function setSalawat(position){
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  var offset = 0;
  var date = new Date()
  var timestamp = date.getTime()/1000 + date.getTimezoneOffset() * 60 

  var apikey = 'AIzaSyCamf7O6w1JE09lGbeTJQZ1KA4EyVErxOE'
  var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + lat+", "+lng + '&timestamp=' + timestamp + '&key=' + apikey
  var xhr = new XMLHttpRequest() 
  xhr.open('GET', apicall)
  xhr.onload = function(){
    if (xhr.status === 200){ 
      var timezone = JSON.parse(xhr.responseText) 
      if (timezone.status == 'OK'){

        offset = (timezone.dstOffset  + timezone.rawOffset)/3600;
        var place = timezone.timeZoneId;

  //Lists
  var times = prayTimes.getTimes(date, [lat, lng], offset);
  var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
  var list = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Midnight'];

  //set in HTML
  var html = '<table  class="table table-striped">';
  html += '<tr class="header bg-success text-white"><th>Prayer times in '+ place+'</th> <th class="thd">'+ weekday[date.getDay()]+'<br>'+date.getDate()+' '+weekday[date.getMonth()]+ '</th></tr>';
  for(var i in list)  {
    html += '<tr><td>'+ list[i]+ '</td>';
    html += '<td class="thd">'+ times[list[i].toLowerCase()]+ '</td></tr>';
  }
  html += '</table>';
  document.getElementById('table').innerHTML = html;
}
}
else{
  console.log('Request failed.  Returned status of ' + xhr.status)
}
}

xhr.send()


}
