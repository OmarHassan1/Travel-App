// VARIABLES
const result = document.querySelector("#result");
const planner = document.querySelector("#planner");
const addTripButton = document.querySelector(".link");
const printButton = document.querySelector("#save");
const deleteButton = document.querySelector("#delete");
const form = document.querySelector("#form");
const leavingFrom = document.querySelector('input[name="from"]');
const goingTo = document.querySelector('input[name="to"]');
const depDate = document.querySelector('input[name="date"]');
const geoNamesURL = "http://api.geonames.org/searchJSON?q=";
const username = "TravelApp";
const timestampNow = Date.now() / 1000;
const darkAPIURL =
  "https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/";
const pixabayAPIURL = "https://pixabay.com/api/?key=";

const darkAPIkey = "b8081c9a61f3196a6816a2e00eac593a";
const pixabayAPIkey = "15544529-0e3bfb388eacac3e717681a56";

window.addEventListener("scroll", (event) => {
  let navigationLinks = document.querySelectorAll("nav ul li a");
  let fromTop = window.scrollY;

  navigationLinks.forEach((link) => {
    let section = document.querySelector(link.hash);

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
});

const scroll = document.getElementById("scroll");

window.onscroll = function scrollFunction() {
  if (document.documentElement.scrollTop > 80) {
    scroll.classList.add("sticky");
  } else {
    scroll.classList.remove("sticky");
  }
};

const addTripEvList = addTripButton.addEventListener("click", function (e) {
  e.preventDefault();
  planner.scrollIntoView({ behavior: "smooth" });
});

form.addEventListener("submit", addTrip);

printButton.addEventListener("click", function (e) {
  window.print();
  location.reload();
});
deleteButton.addEventListener("click", function (e) {
  form.reset();
  result.classList.add("invisible");
  location.reload();
});

export const getCityInfo = async (geoNamesURL, goingToText, username) => {
  const res = await fetch(
    geoNamesURL + goingToText + "&maxRows=10&" + "username=" + username
  );
  try {
    const cityData = await res.json();
    return cityData;
  } catch (error) {
    console.log("error", error);
  }
};

export const getWeather = async (cityLat, cityLong, country, timestamp) => {
  const req = await fetch(
    darkAPIURL +
      "/" +
      darkAPIkey +
      "/" +
      cityLat +
      "," +
      cityLong +
      "," +
      timestamp +
      "?exclude=minutely,hourly,daily,flags"
  );
  try {
    const weatherData = await req.json();
    return weatherData;
  } catch (error) {
    console.log("error", error);
  }
};

// Function called when form is submitted
export function addTrip(e) {
  e.preventDefault();
  const leavingFromText = leavingFrom.value;
  const goingToText = goingTo.value;
  const depDateText = depDate.value;
  const timestamp = new Date(depDateText).getTime() / 1000;

  Client.checkInput(leavingFromText, goingToText);

  getCityInfo(geoNamesURL, goingToText, username)
    .then((cityData) => {
      const cityLat = cityData.geonames[0].lat;
      const cityLong = cityData.geonames[0].lng;
      const country = cityData.geonames[0].countryName;
      const weatherData = getWeather(cityLat, cityLong, country, timestamp);
      return weatherData;
    })
    .then((weatherData) => {
      const daysLeft = Math.round((timestamp - timestampNow) / 86400);
      const userData = postData("http://localhost:5500/add", {
        leavingFromText,
        goingToText,
        depDateText,
        weather: weatherData.currently.temperature,
        summary: weatherData.currently.summary,
        daysLeft,
      });
      return userData;
    })
    .then((userData) => {
      updateUI(userData);
    });
}

//  postData
export const postData = async (url = "", data = {}) => {
  const req = await fetch(url, {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
      depCity: data.leavingFromText,
      arrCity: data.goingToText,
      depDate: data.depDateText,
      weather: data.weather,
      summary: data.summary,
      daysLeft: data.daysLeft,
    }),
  });
  try {
    const userData = await req.json();
    return userData;
  } catch (error) {
    console.log("error", error);
  }
};

//  update UI

export const updateUI = async (userData) => {
  result.classList.remove("invisible");
  result.scrollIntoView({ behavior: "smooth" });

  const res = await fetch(
    pixabayAPIURL +
      pixabayAPIkey +
      "&q=" +
      userData.arrCity +
      "+city&image_type=photo"
  );

  try {
    const imageLink = await res.json();
    const dateSplit = userData.depDate.split("-").reverse().join(" / ");
    document.querySelector("#city").innerHTML = userData.arrCity;
    document.querySelector("#date").innerHTML = dateSplit;
    document.querySelector("#days").innerHTML = userData.daysLeft;
    document.querySelector("#summary").innerHTML = userData.summary;
    document.querySelector("#temp").innerHTML = userData.weather;
    document
      .querySelector("#fromPixabay")
      .setAttribute("src", imageLink.hits[0].webformatURL);
  } catch (error) {
    console.log("error", error);
  }
};

export { addTripEvList };
