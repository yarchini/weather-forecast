let forecastData = [];
let weatherChart = null;

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a location!");
        return;
    }

    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=6cd6a70861da468f08217dacb3fd20a9`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.cod !== "200") {
            throw new Error(data.message || "City not found");
        }

        document.getElementById("cityNameDisplay").innerHTML = city;

        forecastData = data.list.slice(0, 8).map(item => ({
            dateTime: item.dt_txt,
            temperature: (item.main.temp - 273.15).toFixed(2),
            weatherDescription: item.weather[0].description,
            icon: item.weather[0].icon,
        }));

        const tableRows = forecastData.map(item => `
                  <tr>
                    <td>${item.dateTime}</td>
                    <td>${item.temperature} °C</td>
                    <td>
                      ${item.weatherDescription} <br>
                      <img src="http://openweathermap.org/img/wn/${item.icon}@2x.png" alt="${item.weatherDescription}">
                    </td>
                  </tr>
                `).join("");

        document.getElementById("weatherOutput").innerHTML = `
                  <table>
                    <tr>
                      <th>Date-Time</th>
                      <th>Temperature (°C)</th>
                      <th>Weather Description</th>
                    </tr>
                    ${tableRows}
                  </table>
                `;

        if (weatherChart) {
            weatherChart.destroy();
            weatherChart = null;
        }
    } catch (error) {
        document.getElementById("weatherOutput").innerHTML = `
                  <div class="error">Error: ${error.message}</div>
                `;
    }
}

function displayChart() {
    if (!forecastData.length) {
        alert("Please fetch weather data first!");
        return;
    }

    // Show the temperature trend container
    document.getElementById("temperatureTrendContainer").style.display = "block";

    const ctx = document.getElementById("weatherChart").getContext("2d");
    const labels = forecastData.map(item => {
        const [date, time] = item.dateTime.split(" ");
        return `${date} ${time}`;
    });
    const temperatures = forecastData.map(item => item.temperature);

    if (weatherChart) {
        weatherChart.destroy();
    }

    weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Temperature (°C)",
                    data: temperatures,
                    borderColor: "#6c5ce7",
                    backgroundColor: "rgba(108, 92, 231, 0.2)",
                    borderWidth: 2,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const { index } = elements[0]; // Get the index of the clicked point
                    showWeatherDetails(index);
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Date-Time",
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Temperature (°C)",
                    },
                },
            },
        },
    });
}

function showWeatherDetails(index) {
    const weatherList = document.getElementById("weatherList");
    weatherList.innerHTML = ""; // Clear existing list

    const selectedData = forecastData[index];
    if (selectedData) {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.innerHTML = `
        <strong>${selectedData.dateTime}</strong><br>
        Temperature: ${selectedData.temperature} °C<br>
        Weather: ${selectedData.weatherDescription}<br>
        <img src="http://openweathermap.org/img/wn/${selectedData.icon}@2x.png" alt="${selectedData.weatherDescription}">
      `;
        weatherList.appendChild(listItem);
    }
}

function resetForm() {
    // Clear the input field
    document.getElementById("cityInput").value = "";

    // Clear the city name display
    document.getElementById("cityNameDisplay").textContent = "";

    // Clear weather output
    document.getElementById("weatherOutput").innerHTML = "";

    // Clear the weather list
    document.getElementById("weatherList").innerHTML = "";

    // Hide the temperature trend container
    document.getElementById("temperatureTrendContainer").style.display = "none";

    // Clear the chart if it exists
    if (weatherChart) {
        weatherChart.destroy();
        weatherChart = null;
    }
}
