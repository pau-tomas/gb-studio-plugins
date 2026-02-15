import express from "express";
import path from "path";
import { statSync, createReadStream } from "fs";

const __dirname = import.meta.dirname;

const app = express();
const PORT = process.env.PORT ?? 9999;
const DELAY = process.env.DELAY ? parseInt(process.env.DELAY, 10) : 0;
const folderPath = path.join(__dirname, "dist");

const waitFor = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

app.get("*", async (req, res) => {
  const decodedPath = decodeURIComponent(req.path);
  const filePath = path.join(folderPath, decodedPath);
  try {
    const stats = statSync(filePath);

    if (stats.isFile()) {
      if (DELAY) {
        // Simulated latency
        await waitFor(DELAY);
      }
      const fileStream = createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).send("File not found");
    }
  } catch (error) {
    res.status(404).send("File not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
