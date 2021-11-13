const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


/* ------------------ MiddleWare ------------------ */
app.use(cors());
app.use(express.json());


/* ------------ Connection to Database ------------ */

const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jboz5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('Connected to Database...');
        
        const database = client.db('xPressBoat');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('review');
        
        /* Save New Registered Users */
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        
        /* Save New Google Users */
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updatedDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.json(result);
        });
        
        /* Add a New Admin */
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updatedDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updatedDoc);
            console.log(result);
            res.json(result);
        });
        
        /* Check If User is Admin */
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        
        /* Get All Products */
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        
        /* Get Single Product */
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });
        
        /* Add New Product */
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });
        
        /* Delete a Product */
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });
        
        /* Get All Orders */
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });
        
        /* Post New Order */
        app.post('/orders', async (req, res) => {
            const orderDetails = req.body;
            const result = await ordersCollection.insertOne(orderDetails)
            res.json(result);
        });
        
        /* Filter My Orders */
        app.post('/myOrders', async (req, res) => {
            const author = req.body?.author;
            const query = { author: author };
            const myOrders = await ordersCollection.find(query).toArray();
            res.send(myOrders);
        });
        
        /* Delete an Order */
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });
        
        /* Approve Order */
        app.put('/orders/status/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateStatus = { $set: { status: "Shipped" } };
            const result = await ordersCollection.updateOne(query, updateStatus, options);
            res.json(result);
        });
        
        /* Add Review */
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });
        
        /* Get All Review */
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);



/* --------- Checking If Server is Running --------- */

app.get('/', (req, res) => {
    res.send('Running Backend Server....!!!');
});


/* --------------- Listening to Port --------------- */

app.listen(port, () => {
    console.log("Listening to Port", port, "$");
});