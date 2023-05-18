const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5300;
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.et32bhj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db("dollToysDB").collection("toys");

    app.get("/toys", async (req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toy = req.body;
      console.log(toy);
      const result = await toysCollection.insertOne(toy);
      res.send(result);
    });

    const indexKeys = { title: 1, category: 1 };
    const indexOptions = { name: "titleCategory" };
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/getToyBySearch/:text", async (req, res) => {
      const searchText = req.params.text;
      const query = searchText
        ? { name: { $regex: searchText, $options: "i" } }
        : {};
      const result = await toysCollection.find(query).limit(20).toArray();
      res.send(result);
    });

    app.get("/allToys", async (req, res) => {
      const result = await toysCollection.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/myToys/:email", async (req, res) => {
      const query = { seller_email: req.params.email };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("DollDroid Demo server is running");
});
app.listen(port, () => {
  console.log(`DollDroid server is running on port ${port}`);
});
