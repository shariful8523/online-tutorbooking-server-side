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

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db("TutorsDB");
        const TutorCollection = database.collection("Tutors")

        // All tutors
        app.get('/tutors', async (req, res) => {
            const cursor = TutorCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // Add a tutor
        app.post('/tutors', async (req, res) => {
            const tutors = req.body;
            const result = await TutorCollection.insertOne(tutors);
            res.send(result)
        })

        // Get Tutors find filter by  userGmail

        app.get('/tutors', async (req, res) => {
           const {userEmail} = req.query;
           let query = {} ;

           if (userEmail) {
            query.userEmail= userEmail;
           }

           const cursor = TutorCollection.find(query);
           const result = await cursor.toArray();
           res.send(result);
        });

        //  Single tutor by ID
        app.get('/tutor/:id', async (req, res) => {  // Route pattern change
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const tutor = await TutorCollection.findOne(query);
            res.send(tutor)
        })

        // Tutors by language
        app.get('/tutors/language/:language', async (req, res) => {
            const language = req.params.language;
            const query = { language: language };
            const tutors = await TutorCollection.find(query).toArray();
            res.send(tutors);
        });

    } finally {
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
