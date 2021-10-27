const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
// have to install with npm i dotnet
require('dotenv').config();
const app = express();
const port = 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jodbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
      await client.connect();
    //   console.log('connect to db')
      const database = client.db("carMechanic");
      const servicesCollection = database.collection("services");
    //   get api
    app.get('/services', async (req, res) => {
        console.log(req.query);
        const cursor = servicesCollection.find({});
        const page = req.query.page;
        const size = parseInt(req.query.size);
        let services;
        const count = await cursor.count();
        if(page){
          services = await cursor.skip(page*size).limit(size).toArray();
        }
        else{
          const services = await cursor.toArray();
        }
      
        
        res.send(
         { count,
          services
        })
    });



    // get single service
    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const service = await servicesCollection.findOne(query);
        res.json(service);
    });
    // post api
    app.post('/services', async (req, res) => {
            const service = req.body;
        
           console.log('hitted api ', service)
              const result = await servicesCollection.insertOne(service);
              console.log(`A document was inserted with the _id: ${result.insertedId}`);
            res.send(result);
        });

        // delete api
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await servicesCollection.deleteOne(query);
            res.send(result)
        })
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Genius Server');
});
app.listen(port, () => {
    console.log('Running Genius Server on port', port);
});
