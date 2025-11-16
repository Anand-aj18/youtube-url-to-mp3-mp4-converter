import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "fly-yt-backend" });
});

app.get("/info", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "url missing" });
    const info = await ytdl.getBasicInfo(url);
    res.json({
      title: info.videoDetails.title,
      author: info.videoDetails.author.name,
      thumbnails: info.videoDetails.thumbnails
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch info" });
  }
});

app.get("/download", async (req, res) => {
  try {
    const { url, format, quality } = req.query;
    if (!url) return res.status(400).json({ error: "url missing" });

    const fileName = "youtube." + (format === "audio" ? "mp3" : "mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    const filter = format === "audio" ? "audioonly" : "audioandvideo";

    ytdl(url, {
      filter,
      quality: quality === "high" ? "highest" : "lowest"
    }).pipe(res);
  } catch (e) {
    res.status(500).json({ error: "Download failed" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Backend running on port", port));