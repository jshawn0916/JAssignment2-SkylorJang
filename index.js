const express = require("express");
const path = require("path");
const app = express();
var axios = require('axios');
var querystring = require('querystring');

const dotenv = require("dotenv");

dotenv.config();
const port = process.env.PORT || "8000";

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"))); //set up a path for static files
app.set("view engine", "ejs");


app.get("/", async (req, res) => {
    try {
        // 위치 정보 가져오기
        var response = await fetch(`https://ipgeolocation.abstractapi.com/v1?api_key=${process.env.LOCATION_API_KEY}`);
        var locationData = await response.json();
        var location = {
            city: locationData.city,
            region: locationData.region_iso_code,
            country: locationData.country,
            lon: locationData.longitude,
            lat: locationData.latitude,
        };
        // console.log(location);

        

        // 날씨 정보 가져오기
        var weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${process.env.WEATHER_API_KEY}`);
        var weatherData = await weatherResponse.json();
        var weather = weatherData.weather[0].main;
        // console.log(weather);

        let url = `https://api.trakt.tv/search/movie?query=${weather}&page={page}&limit=9`;

        // 영화 검색 요청
        let movieResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-version': '2',
                "X-Pagination-Page":1,
                "X-Pagination-Limit":9,
                'trakt-api-key': process.env.MOVIE_API_KEY
            }
        });

        let movieData = await movieResponse.json();
        // movieData.forEach(element => {
        //     console.log(element.movie.title)
        // });
    let movies = Object.values(movieData)
    // console.log(aa[0].movie.ids)
        res.render("index", { title: "Home", location: location, movies: movies, weather: weather });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port);

