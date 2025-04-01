import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
    lat: number;
    lon: number;
}

// Define a class for the Weather object
class Weather {
    city: string;
    date: string;
    icon: string;
    iconDescription: string;
    tempF: number;
    windSpeed: number;
    humidity: number;

    constructor(city: string, date: string, icon: string, iconDescription: string, tempF: number, windSpeed: number, humidity: number) {
        this.city = city;
        this.date = date;
        this.icon = icon;
        this.iconDescription = iconDescription;
        this.tempF = tempF;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
    }
}

class WeatherService {
    private baseURL: string;
    private apiKey: string;
    private cityName: string;

    constructor() {
        this.baseURL = process.env.API_BASE_URL || '';
        this.apiKey = process.env.WEATHER_API_KEY || '';
        this.cityName = '';
    }

    // Create fetchLocationData method
    private async fetchLocationData(query: string) {
        const response = await fetch(query);
        const locationData = await response.json();
        return locationData[0];
    }

    // Create destructureLocationData method
    private destructureLocationData(locationData: Coordinates): Coordinates {
        const { lat, lon } = locationData;
        return { lat, lon };
    }

    // Create buildGeocodeQuery method
    private buildGeocodeQuery(): string {
        return `${this.baseURL}/geo/1.0/direct?q=${this.cityName}&appid=${this.apiKey}`;
    }

    // Create buildWeatherQuery method
    private buildWeatherQuery(coordinates: Coordinates): string {
        const { lat, lon } = coordinates;
        return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${this.apiKey}`;
    }
    

    // Create fetchAndDestructureLocationData method
    private async fetchAndDestructureLocationData() {
        const geocodeQuery = this.buildGeocodeQuery();
        const locationData = await this.fetchLocationData(geocodeQuery);
        const coordinates = this.destructureLocationData(locationData);
        return coordinates;
    }

    // Create fetchWeatherData method
    private async fetchWeatherData(coordinates: Coordinates) {
        const weatherQuery = this.buildWeatherQuery(coordinates);
        const response = await fetch(weatherQuery);
        const weatherData = await response.json();
        return weatherData;
    }

    // Build parseCurrentWeather method
    private parseCurrentWeather(response: any) {
        if (!response || !response.list || response.list.length === 0) {
            throw new Error("Invalid weather data received from API");
        }
    
        const city = response.city?.name || "Unknown City"; // Fix city extraction
        const currentWeather = response.list[0];
    
        const {
            dt: date,
            main: { temp, humidity },
            weather,
            wind: { speed: windSpeed }
        } = currentWeather;
    
        const { icon, description } = weather[0] || {};
    
        const formattedDate = new Date(date * 1000).toLocaleDateString();
        return new Weather(city, formattedDate, icon || '', description || '', temp, windSpeed, humidity);
    }
    

    // Build forecast array method
    private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
        return weatherData.map((data: any) => {
            const { dt: date } = data;
            const { icon, description } = data.weather[0];
            const { temp, humidity } = data.main;
            const { speed: windSpeed } = data.wind;
            return new Weather(currentWeather.city, new Date(date * 1000).toLocaleDateString(), icon, description, temp, windSpeed, humidity);
        });
    }

    // Complete getWeatherForCity method

    async getWeatherForCity(city: string) {
        try {
            this.cityName = city;
            const coordinates = await this.fetchAndDestructureLocationData();
            const weatherData = await this.fetchWeatherData(coordinates);
    
            console.log("Weather API Response:", JSON.stringify(weatherData, null, 2)); // Debugging
    
            if (!weatherData || Object.keys(weatherData).length === 0) {
                throw new Error("Empty weather API response");
            }
    
            const currentWeather = this.parseCurrentWeather(weatherData);
            console.log("Parsed Weather Data:", currentWeather); // Log parsed data
    
            const forecastArray = this.buildForecastArray(currentWeather, weatherData.list || []);
            console.log("Final Forecast Data:", forecastArray); // Log what will be sent
    
            return forecastArray;
        } catch (error) {
            console.error("Error in getWeatherForCity:", error);
            return [];
        }
    }
}    
export default new WeatherService();
