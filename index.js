import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import jwt from "jsonwebtoken"
import stripe from "stripe"

const stripeInstance = stripe("sk_test_51OExdgCibCkEW5UbRTUs19hjOQxYIP6MSx29lYz3ovUp47qZPuDoUh6hHYyePJDbISBJsOn6rHyAcU5ZisU8T99F00aj1fI4Qi")

const port = process.env.PORT || 4500;

const app = express();

// Middleware
app.use(express.json()); // Parses incoming json requests
app.use(cors()); // Allows server to handle incoming requests
dotenv.config(); // Loads .env file contents into process.env by default

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrf14mf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("restaurant-db0");
const menus = db.collection("menus");
const admins = db.collection("admins");
const reservations = db.collection("reservations")

app.get("/", (req, res) => {
  res.send("RUNNING");
});

async function run() {
  try {

    // JWT api
    app.post("/jwt", async(req, res) => {
      const user = req.body
        const token = jwt.sign(user, process.env.TOKEN_KEY, {
          expiresIn: "5h"
        })
        res.send({ token: token })
    })

    // Services api

    app.get("/menus", async (req, res) => {
      const id = req.query.id;
      const type = req.query.type;
      const category = req.query.category;
      let query = {};
      if (type && category) {
        query = { type: type, category: category };
      } else if (type) {
        query = { type: type };
      } else if(id){
        query = { _id: new ObjectId(id) }
      }
      const result = await menus.find(query).toArray();
      res.send(result);
    });

    app.get("/admins", async(req, res) => {
      const result = await admins.find().toArray()
      res.send(result)
    })

    app.post("/admins", async(req, res) => {
      const body = req.body
      const query = { email: body.email }
      const existingUser = await admins.findOne(query)
      if(existingUser){
        return res.send({ message: "User registered already" })
      }
      const result = await admins.insertOne(body)
      res.send(result)
    })

    app.patch("/admins/:id", async(req, res) => {
      const id = req.params.id
      const body = { _id: new ObjectId(id) }
      const updateBody = {
        $set: {

        }
      }
    })

    app.post("/payments", async(req, res) => {

    })

    app.get("/reservations", async (req, res) => {
      let query = {}
      const date = req.query.date
      if(date){
        query = { date: date }
      }
      const result = await reservations.find(query).toArray()
      res.send(result)
    })

    app.post("/reservations", async(req, res) => {
      const body = req.body
      const result = await reservations.insertOne(body)
      res.send(result)
    })

    // Payment intent

    app.post("/payment-intent", async(req, res) => {
      const { price } = req.body
      const amount = parseInt(price*100)

      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"]
      })
    res.send({
      client_secret: paymentIntent.client_secret
    })
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.log(err);
  }
}

app.listen(port, () => {
  console.log("Successfully running port", port);
});

run().catch(console.dir);
