# Exhibition Curation Platform - Back-End 🚀

Hello Sultan! 👑

Welcome to the back-end of the Exhibition Curation Platform. This service powers our interactive art exhibition platform by securely integrating multiple museum APIs and handling all data operations with robust error handling and user feedback.

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
```markdown
----
## 🚀 Install Dependencies

**Bash Command:**
```bash
npm install
```

----
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
- You can obtain a free API key by signing up at the [Harvard Art Museums API website](https://www.harvardartmuseums.org/collections/api).  
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

- **Back-End GitHub Repository:** Exhibition Curation Back-End
- **Hosted Back-End:** Live Back-End


