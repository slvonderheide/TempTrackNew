import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import WeatherService from "../../service/weatherService.js";
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import historyService from "../../service/historyService.js";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();


// POST Request with city name to retrieve weather data
router.post("/", async (req: Request, res: Response) => {
  const cityName: string = req.body.cityName;
  console.log (req.body);
  if (!cityName) {
     res.status(400).json({ message: "City name is required" });
     return
  }
  const weatherData = await WeatherService.getWeatherForCity(cityName);
  res.json(weatherData);
});

router.get("/history", (_req: Request, res: Response) => {
  historyService.getCities().then((cities) => {
    res.json(cities);
  });
});
// BONUS: DELETE city from search history
router.delete("/history/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const historyPath = path.join(__dirname, "searchHistory.json");
    const history = JSON.parse(fs.readFileSync(historyPath, "utf8") || "[]");

    // Filter out the city with the given id
    interface HistoryItem {
      city: string;
      id: number;
    }

    const updatedHistory: HistoryItem[] = history.filter(
      (item: HistoryItem) => item.id !== parseInt(id)
    );

    // Save the updated history back to the file
    fs.writeFileSync(historyPath, JSON.stringify(updatedHistory));

    return res
      .status(200)
      .json({ message: "City removed from search history" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error deleting city from search history" });
  }
});

export default router;
