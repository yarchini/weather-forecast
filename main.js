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

function resetForm() {
    // Clear the input field
    document.getElementById("cityInput").value = "";

    // Clear the city name display
    document.getElementById("cityNameDisplay").textContent = "";

    // Clear weather output
    document.getElementById("weatherOutput").innerHTML = "";

    // Clear the chart if it exists
    if (weatherChart) {
        weatherChart.destroy();
        weatherChart = null;
    }
}
