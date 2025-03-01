# Exhibition Curation Platform - Back-End 🚀



Welcome to the back-end of the Virtual Exhibition Platform. This service powers our interactive art exhibition platform by securely integrating multiple museum APIs and handling all data operations with robust error handling and user feedback.

---

## Project Summary

The back-end of the Exhibition Curation Platform connects to at least two museum/university APIs, processes artwork data, and exposes RESTful endpoints for managing user exhibition collections. It features:
- **Secure API Integration:** Connects to multiple APIs with proper key management.
- **Robust Error Handling:** Provides clear error messages and loading indicators.
- **RESTful Endpoints:** Facilitates operations such as creating, updating, and retrieving user collections.
- **Simple Environment Setup:** Easily configured using a straightforward `.env` file.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

## Installation

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/Sultan0013/SE-Exhibiton-BE
   cd SE-Exhibiton-BE
   npm install



## 🔧 Set Up the Environment File

**Step 1:** Create a copy of the sample environment file:

**Step 2:** Open the `.env` file in your favourite editor. It should contain:

```env
PORT=4157
HARVARD_API_KEY=YOUR_HARVARD_API_KEY_HERE
HARVARD_BASE_URL=https://api.harvardartmuseums.org
VNA_BASE_URL=https://api.vam.ac.uk/v2
```

**Important:**  
- Replace `YOUR_HARVARD_API_KEY_HERE` with your own Harvard API key.  
- You can obtain a free API key by signing up at the [Harvard Art Museums API website](https://docs.google.com/forms/d/e/1FAIpQLSfkmEBqH76HLMMiCC-GPPnhcvHC9aJS86E32dOd0Z8MpY2rvQ/viewform).  
- The other environment variables (`PORT`, `HARVARD_BASE_URL`, and `VNA_BASE_URL`) are pre-configured.

----
## 🏃‍♂️ Run the Server Locally

Start the server using:

```bash
node server.js
```

The server should now be running at [http://localhost:4157](http://localhost:4157) (or on the port you have configured).

----
## 🔗 Links

- **Front-end GitHub Repository:** [Exhibition Curation Back-End](https://github.com/Sultan0013/Virtual-Exhibiton)
- **Hosted Back-End:** [Live Back-End](https://se-exhibiton-be-dawn-grass-6783.fly.dev/)

   The back-end provides two primary GET endpoints for accessing artwork data:
   **GET /api/all-artworks**: Retrieves a list of artworks from the Harvard Art Museums API and the V&A API.
   **GET /api/artwork/:id**: Retrieves detailed information for a specific artwork.

- **Hosted Front-End:** [Live Front-End](https://mueseumexhibition.netlify.app/)


