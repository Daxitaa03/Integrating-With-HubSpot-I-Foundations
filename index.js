

require("dotenv").config();
 
const express = require("express");

const axios = require("axios");

const path = require("path");
 
const app = express();

const PORT = process.env.PORT || 3000;
 
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

const OBJECT_TYPE = process.env.HUBSPOT_OBJECT_TYPE;
 
const HUBSPOT_API = "https://api.hubapi.com";
 
app.set("view engine", "pug");

app.set("views", path.join(__dirname, "views"));
 
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
 
// Shared configuration for HubSpot API requests.

const hubspot = axios.create({

  baseURL: HUBSPOT_API,

  headers: {

    Authorization: `Bearer ${ACCESS_TOKEN}`,

    "Content-Type": "application/json"

  },

  timeout: 15000

});
 
// Required route 1: Homepage.

// Fetch custom object records from HubSpot and render a table.

app.get("/", async (req, res) => {

  try {

    const response = await hubspot.get(

      `/crm/v3/objects/${OBJECT_TYPE}`,

      {

        params: {

          properties: "name,publisher,price",

          limit: 100

        }

      }

    );
 
    const records = response.data.results || [];
 
    res.render("homepage", {

      title: "Video Game Collection",

      records,

      error: null

    });

  } catch (error) {

    console.error(

      "Error fetching HubSpot records:",

      error.response?.data || error.message

    );
 
    res.status(500).render("homepage", {

      title: "Video Game Collection",

      records: [],

      error:

        "Could not retrieve records from HubSpot. Check your API token, object type ID, scopes, and property names."

    });

  }

});
 
// Required route 2: Display the record creation form.

app.get("/update-cobj", (req, res) => {

  res.render("updates", {

    title:

      "Update Custom Object Form | Integrating With HubSpot I Practicum",

    error: null,

    values: {}

  });

});
 
// Required route 3: Create a custom object record.

app.post("/update-cobj", async (req, res) => {

  const { name, publisher, price } = req.body;
 
  // Validate the submitted form data.

  if (

    typeof name !== "string" ||

    !name.trim() ||

    typeof publisher !== "string" ||

    !publisher.trim() ||

    price === undefined ||

    price === "" ||

    !Number.isFinite(Number(price)) ||

    Number(price) < 0

  ) {

    return res.status(400).render("updates", {

      title:

        "Update Custom Object Form | Integrating With HubSpot I Practicum",

      error: "Enter a name, publisher, and a valid non-negative price.",

      values: req.body

    });

  }
 
  try {

    await hubspot.post(

      `/crm/v3/objects/${OBJECT_TYPE}`,

      {

        properties: {

          name: name.trim(),

          publisher: publisher.trim(),

          price: String(Number(price))

        }

      }

    );
 
    // Return to the homepage after successful creation.

    return res.redirect("/");

  } catch (error) {

    console.error(

      "Error creating HubSpot record:",

      error.response?.data || error.message

    );
 
    return res.status(502).render("updates", {

      title:

        "Update Custom Object Form | Integrating With HubSpot I Practicum",

      error:

        "HubSpot could not create the record. Check the object type, property names, token permissions, and API error in your terminal.",

      values: req.body

    });

  }

});
 
// Check required configuration before starting.

if (!ACCESS_TOKEN || !OBJECT_TYPE) {

  console.error(

    "Missing HUBSPOT_ACCESS_TOKEN or HUBSPOT_OBJECT_TYPE in .env"

  );

  process.exit(1);

}
 
app.listen(PORT, () => {

  console.log(`Server running at http://localhost:${PORT}`);

});

  