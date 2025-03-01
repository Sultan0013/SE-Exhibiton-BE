require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4157;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Welcome to the Exhibition Curation Platform API! 👑🚀");
});

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
    let hasNextPage = true;

    while (artworks.length < minResults && hasNextPage) {
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
        vnaParams.order_by = sortOpt.vna;
      }

      const [harvardResponse, vnaResponse] = await Promise.all([
        axios
          .get(`${process.env.HARVARD_BASE_URL}/object`, {
            params: harvardParams,
          })
          .catch((error) => {
            if (error.response) {
              if (error.response.status === 401) {
                return {
                  data: { records: [] },
                  status: 401,
                  error: "Unauthorized: Invalid Harvard API key",
                };
              }
              if (error.response.status === 404) {
                return {
                  data: { records: [] },
                  status: 404,
                  error: "Not Found: Harvard API resource not found",
                };
              }
            }
            return { data: { records: [] } };
          }),
        axios
          .get(`${process.env.VNA_BASE_URL}/objects/search`, {
            params: vnaParams,
          })
          .catch((error) => {
            if (error.response) {
              if (error.response.status === 401) {
                return {
                  data: { records: [] },
                  status: 401,
                  error: "Unauthorized: Invalid V&A API key",
                };
              }
              if (error.response.status === 404) {
                return {
                  data: { records: [] },
                  status: 404,
                  error: "Not Found: V&A API resource not found",
                };
              }
            }
            return { data: { records: [] } };
          }),
      ]);

      // If one of the APIs returned an unauthorized error, propagate that.
      if (harvardResponse.status === 401 || vnaResponse.status === 401) {
        return res.status(401).json({
          error: "One or more APIs returned Unauthorized. Check API keys.",
        });
      }

      // We no longer throw an error if both return 404; an empty result is valid.
      const harvardRecords =
        harvardResponse.data.records?.filter(
          (art) => art.images && art.images.length > 0
        ) || [];
      const vnaRecords = vnaResponse.data.records || [];
      const newResults = [...harvardRecords, ...vnaRecords];

      if (newResults.length === 0) {
        hasNextPage = false;
        break;
      }

      artworks = artworks.concat(newResults);
      currentPage++;
    }

    // Always return a valid response—even if no artworks are found.
    res.json({ artworks: artworks.slice(0, minResults), hasNextPage });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Failed to fetch artworks from both APIs",
    });
  }
});
app.get("/api/artwork/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let artworkDetails = null;

    if (id.startsWith("O") || id.startsWith("o")) {
      // V&A API handling
      const response = await axios
        .get(`${process.env.VNA_BASE_URL}/object/${id}`)
        .catch((error) => {
          if (error.response) {
            if (error.response.status === 401) {
              throw {
                status: 401,
                message: "Unauthorized: Invalid V&A API key",
              };
            }
            if (error.response.status === 404) {
              // Return empty object for valid "no data" case.
              return { data: {} };
            }
          }
          throw error;
        });
      if (!response.data.record) {
        return res.json({}); // No artwork found.
      }
      const { data } = response;
      const record = data.record;
      const meta = data.meta;
      artworkDetails = {
        id: record.systemNumber,
        image:
          meta.images?._iiif_image + "full/full/0/default.jpg" ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMZG9cIFLAsgK_y9kGQ_HBZZ5ADp1GQq4OYQ&s",
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
      // Harvard API handling
      const response = await axios
        .get(`${process.env.HARVARD_BASE_URL}/object/${id}`, {
          params: { apikey: process.env.HARVARD_API_KEY },
        })
        .catch((error) => {
          if (error.response) {
            if (error.response.status === 401) {
              throw {
                status: 401,
                message: "Unauthorized: Invalid Harvard API key",
              };
            }
            if (error.response.status === 404) {
              return { data: {} };
            }
          }
          throw error;
        });
      if (!response.data.title && !response.data.objectid) {
        return res.json({});
      }
      const { data } = response;
      artworkDetails = {
        id: data.objectid || data.id,
        image:
          data.primaryimageurl ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMZG9cIFLAsgK_y9kGQ_HBZZ5ADp1GQq4OYQ&s",
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
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch artwork details" });
    }
  }
});

app.listen(PORT, () => {
  console.log("listening on port " + { PORT });
});
