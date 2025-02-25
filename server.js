require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { log } = require("console");

const app = express();
const PORT = process.env.PORT || 4157;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/all-artworks", async (req, res) => {
  try {
    const {
      q,
      page = 1,
      classification,
      technique,
      sortOpt,
      sortOrder,
      minResults = 20,
    } = req.query;

    let artworks = [];
    let currentPage = parseInt(page, 10);

    while (artworks.length < minResults) {
      let harvardParams = {
        q,
        page: currentPage,
        size: 10,
        sort: sortOpt?.harvard || "accessionyear",
        sortorder: sortOrder || "asc",
        apikey: process.env.HARVARD_API_KEY,
      };

      if (classification && classification !== "any") {
        harvardParams.classification = classification.harvardId;
      }
      if (technique && technique !== "any") {
        harvardParams.technique = technique.harvardId;
      }

      let vnaParams = {
        q,
        page: currentPage,
        size: 10,
        images_exist: true,
        order_sort: sortOrder || "asc",
      };

      if (classification && classification !== "any") {
        vnaParams.id_category = classification.vnaID;
      }
      if (technique && technique !== "any") {
        vnaParams.id_technique = technique.vnaID;
      }
      if (sortOpt && sortOpt !== "any") {
        vnaParams.order_by = sortOpt;
      }
      const [harvardResponse, vnaResponse] = await Promise.all([
        axios
          .get(`${process.env.HARVARD_BASE_URL}/object`, {
            params: harvardParams,
          })
          .catch(() => ({ data: { records: [] } })),
        axios
          .get(`${process.env.VNA_BASE_URL}/objects/search`, {
            params: vnaParams,
          })
          .catch(() => ({ data: { records: [] } })),
      ]);

      const harvardRecords =
        harvardResponse.data.records?.filter(
          (art) => art.images && art.images.length > 0
        ) || [];
      const vnaRecords = vnaResponse.data.records || [];
      const newResults = [...harvardRecords, ...vnaRecords];

      if (newResults.length === 0) break;
      artworks = artworks.concat(newResults);
      currentPage++;
    }

    res.json(artworks.slice(0, minResults));
  } catch (error) {
    console.error("All Artworks API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch artworks from both APIs" });
  }
});

app.get("/api/artwork/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let artworkDetails = null;
    if (id.startsWith("O") || id.startsWith("o")) {
      const { data } = await axios.get(
        `${process.env.VNA_BASE_URL}/object/${id}`
      );
      const record = data.record;
      const meta = data.meta;
      artworkDetails = {
        id: record.systemNumber,
        image:
          meta.images?._iiif_image + "full/full/0/default.jpg" ||
          "https://via.placeholder.com/400",
        title: record.titles?.[0]?.title || "No Title Available",
        date: record.productionDates?.[0]?.date?.text || "Unknown",
        medium: record.materialsAndTechniques || "Not specified",
        dimensions: record.dimensions
          ? record.dimensions
              .map(
                (dim) =>
                  `${dim.dimension}: ${dim.value} ${dim.unit}${
                    dim.qualifier ? ` (${dim.qualifier})` : ""
                  }`
              )
              .join(", ")
          : "Not provided",
        description: record.summaryDescription || "No description available.",
        provenance: record.objectHistory || "Not available",
        location:
          record.galleryLocations?.[0]?.current?.text || "No specific location",
        creditLine: record.creditLine || "No credit line",
      };
    } else {
      const { data } = await axios.get(
        `${process.env.HARVARD_BASE_URL}/object/${id}`,
        {
          params: { apikey: process.env.HARVARD_API_KEY },
        }
      );
      artworkDetails = {
        id: data.objectid || data.id,
        image: data.primaryimageurl || "https://via.placeholder.com/400",
        title: data.title || data.titles?.[0]?.title || "No Title Available",
        date: data.dated || "Unknown",
        medium: data.medium || "Not specified",
        dimensions: data.dimensions || "Not provided",
        description: data.description || "No description available.",
        provenance: data.provenance || "Not available",
        location:
          (data.gallery && data.gallery.name) ||
          data.places?.[0]?.displayname ||
          "No specific location",
        creditLine: data.creditline || "No credit line",
      };
    }
    res.json(artworkDetails);
  } catch (error) {
    console.error("Error fetching artwork by ID:", error.message);
    res.status(500).json({ error: "Failed to fetch artwork details" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
