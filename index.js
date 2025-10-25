require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware 
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
     
    if(!token) {
        return res.status(401).send({ message: 'unauthorized access'});
    }

    // verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return res.status(401).send({message: 'unauthorized access'});
        }
      
        next();
    })

    
}





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
        const TutorCollection = database.collection("Tutors");

        // jwt auth relented apis

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            });

            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false
                })
                .send({ success: true })
        })

        app.post('/logout', (req, res) => {
            res 
            .clearCookie('token',{
                httpOnly:true,
                secure: false
            })
            .send({success: true})
        })







        // Book a Tutorials

        const BookingCollection = database.collection("Bookings");

        // Get all tutors or filter by userEmail
        app.get('/tutor',  async (req, res) => {
            const { userEmail } = req.query;
            let query = {};

            if (userEmail) {
                query.userEmail = userEmail;
            }

            const cursor = TutorCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Add a tutor
        app.post('/tutor', async (req, res) => {
            const tutors = req.body;
            const result = await TutorCollection.insertOne(tutors);
            res.send(result);
        });

        // Get single tutor by ID
        app.get('/tutor/:id',  async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await TutorCollection.findOne(query);
            res.send(result);
        });

        // Get tutors by language
        app.get('/tutor/language/:language',  async (req, res) => {
            const language = req.params.language;
            const query = { language: language };
            const tutors = await TutorCollection.find(query).toArray();
            res.send(tutors);
        });

        // Book a Tutorial

        app.post('/booking', async (req, res) => {
            const bookingData = req.body;
            const result = await BookingCollection.insertOne(bookingData);
            res.send(result);
        })

        // Get Book by user email

        app.get('/booking', async (req, res) => {
            const userEmail2 = req.query.email;
            let query = {};

            if (userEmail2) {
                query.userEmail = userEmail2;
            }

            const result = await BookingCollection.find(query).toArray();
            res.send(result);
        });


        // Update tutor by ID
        app.put('/tutor/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            const updatedTutors = {
                $set: {
                    name: updatedData.name,
                    email: updatedData.email,
                    language: updatedData.language,
                    image: updatedData.image,
                    price: updatedData.price,
                    review: updatedData.review,
                    description: updatedData.description
                }
            };
            const result = await TutorCollection.updateOne(filter, updatedTutors, options);
            res.send({
                success: true,
                modified: result.modifiedCount > 0
            });

        });

        // Delete tutor by ID
        app.delete('/tutor/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await TutorCollection.deleteOne(query);
            res.send(result);

        });

    } finally {
        // Ensure to close the connection (optional)
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running');
});

app.listen(port, () => {
    console.log(`server is Running at : ${port}`);
});
