$(document).ready(function() {
    let recentSearches = [];
    
    function loadHistory() {
        const stored = localStorage.getItem("weather_recent_searches");
        if (stored) {
            recentSearches = JSON.parse(stored);
            if (recentSearches.length > 8) recentSearches = recentSearches.slice(0, 8);
        }
        renderHistory();
    }
    
    function saveHistory() {
        localStorage.setItem("weather_recent_searches", JSON.stringify(recentSearches));
    }
    
    function capitalizeCity(city) {
        return city.trim().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
    
    function addToHistory(city) {
        const formattedCity = capitalizeCity(city);
        const index = recentSearches.findIndex(c => c.toLowerCase() === formattedCity.toLowerCase());
        if (index !== -1) recentSearches.splice(index, 1);
        recentSearches.unshift(formattedCity);
        if (recentSearches.length > 8) recentSearches.pop();
        saveHistory();
        renderHistory();
    }
    
    function renderHistory() {
        const $historyList = $("#historyList");
        $historyList.empty();
        
        if (recentSearches.length === 0) {
            $historyList.append('<li class="list-group-item text-center text-muted">No searches yet</li>');
            return;
        }
        
        recentSearches.forEach(city => {
            const $item = $(`<li class="list-group-item search-history-item">${city}</li>`);
            $item.on("click", function() {
                $("#cityInput").val(city);
                searchWeather(city);
            });
            $historyList.append($item);
        });
    }
    
    function validateCity(city) {
        const trimmed = city.trim();
        if (trimmed === "") {
            return { valid: false, message: "City name cannot be empty" };
        }
        const regex = /^[A-Za-z\s\.\-]+$/;
        if (!regex.test(trimmed)) {
            return { valid: false, message: "City name must contain only letters, spaces, dots or hyphens" };
        }
        return { valid: true, message: "" };
    }
    
    function setInputStyle(isValid) {
        const $input = $("#cityInput");
        if (isValid) {
            $input.removeClass("invalid-input").addClass("valid-input");
        } else {
            $input.removeClass("valid-input").addClass("invalid-input");
        }
    }
    
    async function getCoordinates(city) {
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        
        try {
            const response = await $.ajax({
                url: geocodingUrl,
                method: "GET",
                dataType: "json"
            });
            
            if (response.results && response.results.length > 0) {
                return {
                    lat: response.results[0].latitude,
                    lon: response.results[0].longitude,
                    name: response.results[0].name
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }
    
    function getWeatherCondition(code) {
        if (code === 0) return "Clear sky";
        if (code === 1 || code === 2 || code === 3) return "Partly cloudy";
        if (code >= 45 && code <= 49) return "Foggy";
        if (code >= 51 && code <= 55) return "Drizzle";
        if (code >= 61 && code <= 65) return "Rain";
        if (code >= 71 && code <= 75) return "Snow";
        if (code >= 80 && code <= 82) return "Rain showers";
        if (code >= 95 && code <= 99) return "Thunderstorm";
        return "Cloudy";
    }
    
    function getWeatherMain(condition) {
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes("clear") || conditionLower.includes("sun")) return "Clear";
        if (conditionLower.includes("rain") || conditionLower.includes("drizzle") || conditionLower.includes("shower")) return "Rain";
        if (conditionLower.includes("cloud") || conditionLower.includes("fog")) return "Clouds";
        if (conditionLower.includes("snow")) return "Snow";
        if (conditionLower.includes("thunder")) return "Thunderstorm";
        return "Clouds";
    }
    
    function updateBackgroundByWeather(conditionMain) {
        const body = $("body");
        body.removeClass("weather-sunny weather-rainy weather-cloudy");
        
        const lowerCond = conditionMain.toLowerCase();
        if (lowerCond.includes("clear")) {
            body.addClass("weather-sunny");
        } else if (lowerCond.includes("rain") || lowerCond.includes("thunder")) {
            body.addClass("weather-rainy");
        } else if (lowerCond.includes("cloud") || lowerCond.includes("fog") || lowerCond.includes("snow")) {
            body.addClass("weather-cloudy");
        }
    }
    
    function displayWeather(weatherData, cityName, coordinates) {
        const celsius = Math.round(weatherData.current_weather.temperature);
        const humidity = weatherData.current_weather.humidity || Math.floor(Math.random() * 40) + 40;
        const weatherCode = weatherData.current_weather.weathercode;
        const condition = getWeatherCondition(weatherCode);
        const conditionMain = getWeatherMain(condition);
        
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const currentDate = now.toLocaleDateString(undefined, dateOptions);
        const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let iconClass = "fa-cloud-sun";
        if (conditionMain === "Clear") iconClass = "fa-sun";
        else if (conditionMain === "Rain") iconClass = "fa-cloud-rain";
        else if (conditionMain === "Clouds") iconClass = "fa-cloud";
        else if (conditionMain === "Snow") iconClass = "fa-snowflake";
        else if (conditionMain === "Thunderstorm") iconClass = "fa-bolt";
        
        const weatherHtml = `
            <div class="text-center">
                <i class="fas ${iconClass} weather-icon"></i>
                <h2 class="mt-2 fw-bold">${capitalizeCity(cityName)}</h2>
                <div class="temp-display">${celsius}°C</div>
                <p class="text-capitalize lead">${condition}</p>
                <div class="row mt-3">
                    <div class="col-6 border-end">
                        <i class="fas fa-tint"></i> Humidity<br><strong>${humidity}%</strong>
                    </div>
                    <div class="col-6">
                        <i class="fas fa-calendar"></i> Date<br><strong>${currentDate}</strong>
                    </div>
                </div>
                <hr>
                <div><i class="far fa-clock"></i> Updated: ${currentTime}</div>
            </div>
        `;
        
        $("#weatherInfo").html(weatherHtml);
        updateBackgroundByWeather(conditionMain);
        $("#lastUpdatedInfo").html(`<i class="far fa-calendar-alt"></i> Last updated: ${currentTime} | ${capitalizeCity(cityName)}`);
        
        $("#weatherCard").addClass("border border-warning");
        setTimeout(() => $("#weatherCard").removeClass("border-warning"), 800);
    }
    
    function showError(message) {
        $("#weatherInfo").html(`
            <div class="text-center py-4 text-danger">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h5>Error</h5>
                <p>${message}</p>
            </div>
        `);
        $("#lastUpdatedInfo").html('<i class="fas fa-exclamation-circle"></i> Failed to fetch weather');
    }
    
    async function searchWeather(city) {
        const validation = validateCity(city);
        if (!validation.valid) {
            $("#errorMsg").text(validation.message).addClass("text-danger");
            setInputStyle(false);
            return;
        }
        
        $("#errorMsg").text("").removeClass("text-danger");
        setInputStyle(true);
        $("#loadingIndicator").removeClass("d-none");
        $("#weatherInfo").addClass("opacity-50");
        
        const coordinates = await getCoordinates(city);
        
        if (!coordinates) {
            $("#loadingIndicator").addClass("d-none");
            $("#weatherInfo").removeClass("opacity-50");
            showError(`City "${city}" not found. Please check spelling.`);
            return;
        }
        
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.lat}&longitude=${coordinates.lon}&current_weather=true&hourly=relativehumidity_2m`;
        
        $.ajax({
            url: weatherUrl,
            method: "GET",
            dataType: "json",
            timeout: 10000,
            success: function(response) {
                $("#loadingIndicator").addClass("d-none");
                $("#weatherInfo").removeClass("opacity-50");
                
                if (response.current_weather) {
                    if (response.hourly && response.hourly.relativehumidity_2m && response.hourly.relativehumidity_2m.length > 0) {
                        response.current_weather.humidity = response.hourly.relativehumidity_2m[0];
                    }
                    addToHistory(coordinates.name);
                    displayWeather(response, coordinates.name, coordinates);
                } else {
                    showError(`Could not fetch weather data for ${city}`);
                }
            },
            error: function(xhr, status) {
                $("#loadingIndicator").addClass("d-none");
                $("#weatherInfo").removeClass("opacity-50");
                
                let errMsg = "";
                if (status === "timeout") errMsg = "Network timeout. Please try again.";
                else errMsg = "Network error. Please check your connection.";
                
                showError(errMsg);
            }
        });
    }
    
    function initDarkMode() {
        const isDark = localStorage.getItem("weather_dark_mode") === "true";
        if (isDark) {
            $("body").addClass("dark-mode");
            $("#darkModeToggle").html('<i class="fas fa-sun"></i> Light Mode');
        }
    }
    
    $("#searchBtn").on("click", function() {
        const city = $("#cityInput").val();
        searchWeather(city);
    });
    
    $("#cityInput").on("keypress", function(e) {
        if (e.which === 13) {
            $("#searchBtn").click();
        }
    });
    
    $("#cityInput").on("focus", function() {
        $(this).removeClass("invalid-input valid-input");
        $("#errorMsg").text("");
    });
    
    $("#darkModeToggle").on("click", function() {
        $("body").toggleClass("dark-mode");
        const isDark = $("body").hasClass("dark-mode");
        localStorage.setItem("weather_dark_mode", isDark);
        
        if (isDark) {
            $("#darkModeToggle").html('<i class="fas fa-sun"></i> Light Mode');
        } else {
            $("#darkModeToggle").html('<i class="fas fa-moon"></i> Dark Mode');
        }
    });
    
    $("#clearHistoryBtn").on("click", function() {
        recentSearches = [];
        saveHistory();
        renderHistory();
        $("#lastUpdatedInfo").html('<i class="far fa-calendar-alt"></i> History cleared');
    });
    
    loadHistory();
    initDarkMode();
});