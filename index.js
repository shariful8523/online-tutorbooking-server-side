require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;



// middle ware 

app.use(cors({
    origin: '*',
}));
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.wfpeu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db("TutorsDB");
        const TutorCollection = database.collection("Tutors")

        // Tutors related apis 

        app.get('/tutors', async (req, res) => {
            const cursor = TutorCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/tutors', async (req, res) => {
            const tutors = req.body;
            const result = await TutorCollection.insertOne(tutors);
            res.send(result)
        })


        // Single language tutors route
        app.get('/tutors/:language', async (req, res) => {
            const language = req.params.language;
            const query = { language: language };  
            const tutors = await TutorCollection.find(query).toArray();  
            res.send(tutors);
        });
        
        





    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is Running at : ${port}`)
})