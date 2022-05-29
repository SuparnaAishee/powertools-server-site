const { MongoClient, ServerApiVersion , ObjectId} = require('mongodb');
const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;
const path = require('path')
require('dotenv').config();


//middle ware 
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.otvqo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        await client.connect();
        // console.log('database connected');
        const toolsCollection = client.db('manufacturing-website').collection('tools');
        const ordersCollection = client.db('manufacturing-website').collection('orderDetails');
        const reviewCollection = client.db('manufacturing-website').collection('review');
        const userCollection = client.db('manufacturing-website').collection('users');




        /* get method for all tools data loading in UI  */
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query)
            const tools = await cursor.toArray();
            res.send(tools);

        })

        //  single data finding for showing 
        app.get('/tool/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await toolsCollection.findOne(query);
            res.send(product);
        });

        /* post method for orders details */
        app.post('/orderDetails', async(req, res) =>{
            const orders= req.body;
            console.log(orders);
            const newOrder = await ordersCollection.insertOne(orders);
            console.log(newOrder);
            res.send(newOrder);
        })

        /* Get order details for dashboard  */
        app.get('/orderDetails', async(req, res) =>{
            const query = {};
            const cursor = ordersCollection.find(query)
            const allOrder = await cursor.toArray();
            res.send(allOrder);
        })

        /* post method for adding new tool */
        app.post('/tools', async(req, res) =>{
            const newTool = req.body;
            const result = await toolsCollection.insertOne(newTool);
            res.send(result);
        })


        // deleting data for dashboard my orders page 
        app.delete('/orderDetails/:id', async(req, res) =>{
            const id = req.params.id;
            // console.log(id);
            const query = {_id: ObjectId(id)};
            // console.log(query);
            const deleteProduct = await ordersCollection.deleteOne(query);
            // console.log(deleteProduct);
            res.send(deleteProduct);
        })


        /* post method for add review in database */
        app.post('/review', async(req, res) =>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        /* Get method for review showing ui */
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray();
            res.send(review);

        })
    


         /* user information put process (update data) */
    app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await userCollection.updateOne(filter, updateDoc, options);
        res.send(result);
      })


      /* Get method for all user data load and  showing ui */
      app.get('/users', async (req, res) => {
        const query = {};
        const cursor = userCollection.find(query)
        const users = await cursor.toArray();
        res.send(users);

    })



    /* Make a admin from user  */
    app.put('/user/admin/:email', async (req, res) => {
        const email = req.params.email;
        // const requester = req.decoded.email;
        // const requesterAccount = await userCollection.findOne({ email: requester });
        // if (requesterAccount.role === 'admin') {
          const filter = { email: email };
          const updateDoc = { $set: { role: 'admin' } };
          const result = await userCollection.updateOne(filter, updateDoc);
          res.send( result );
        }
      )


/* get method for admin call */
      app.get('/admin/:email', async(req, res) =>{
        const email = req.params.email;
        const user = await userCollection.findOne({email: email});
        const isAdmin = user.role  === 'admin';
        res.send({admin: isAdmin});
      })



       // Deleting manage product  data 
    app.delete('/tools/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const manageData = await toolsCollection.deleteOne(query);
        res.send(manageData);
    });

  
    }
    finally {

    }

}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('welcome manufacture website');
})

app.listen(port, () => {
    console.log(`manufacture website listening on port ${port}`)
})