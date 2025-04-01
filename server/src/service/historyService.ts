import { v1 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// City class with name and id properties
class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  filePath: string;

  constructor() {
    const __fileName = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__fileName);

    this.filePath = path.join(__dirname, "../../db/db.json");
  }
  // Method to read the data from the file
  
  private async read() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return data;
    } catch (error) {
      // If the file doesn't exist or can't be read, return an empty array
      return "[]";
    }
  }

  // Method to write updated cities array back to the file
  private async write(cities: City[]) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), "utf-8");
    } catch (error) {
      console.error("Error writing to file:", error);
    }
  }

  // Method to get all cities from the search history file
  async getCities() {
    const cities = JSON.parse(await this.read());
    return cities.map((cityData: { name: string; id: string }) => new City(cityData.name, cityData.id));
  }

  // Method to add a city to the search history
  async addCity(cityName: string) {
    const newCity = new City(cityName, v1()); // Generate a unique ID
    const cities = await this.getCities();
    cities.push(newCity); // Add the new city to the list
    await this.write(cities); // Write the updated list to the file
  }

  // Method to remove a city from the search history by id
  async removeCity(id: string) {
    const cities = await this.getCities();
    const updatedCities = cities.filter((city: { id: string; }) => city.id !== id); // Filter out the city with the matching id
    await this.write(updatedCities); // Write the updated list to the file
  }
}

export default new HistoryService();
