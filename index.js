const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q7aje.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();

//from mongo
// const pass = "ZzbKQ8QBpDcuzVOQ";
// const databaseName = "creativeAgencyDb";
// mongo

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port =5000;

app.get('/',(req,res)=>{
    res.send('Hello');
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const allServiceCollection = client.db("creativeAgencyDb").collection("allServices");
  const allFeedbackCollection = client.db("creativeAgencyDb").collection("allFeedbacks");
  const customerOrderCollection = client.db("creativeAgencyDb").collection("orders");
  const adminsCollection = client.db("creativeAgencyDb").collection("admins");

  //service
  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const filePath = `${__dirname}/services/${file.name}`;
    console.log(title, description, file);
    file.mv(filePath, err => {
      if (err) {
        console.log(err);
        return res.status(500).send({ msg: 'Failed to upload image' });
      }
      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer(encImg, 'base64')
      };
      allServiceCollection.insertOne({ title, description, image })
          .then(result => {
            fs.remove(filePath, error =>{
                if(error){
                console.log(error)
                return res.status(500).send({ msg: 'Failed to upload image' });
                }
                 res.send(result.insertedCount > 0);
            })
            
          })
      // return res.send({ name: file.name, path: `/${file.name}` })
    })
  })

  app.get('/services',(req,res)=>{
    allServiceCollection.find({})
    .toArray((err, documents)=>{
        return res.send(documents);
    })
  })
  //service 

  //feedback
  app.post('/addFeedbacks',(req,res)=>{
    const name = req.body.name;
    const company = req.body.company;
    const description = req.body.description;
    console.log(name, company, description);
    allFeedbackCollection.insertOne({ name, company, description })
    .then(result=>{
        console.log(result.insertedCount);
        res.send(result.insertedCount)
    })
})

app.get('/feedbacks',(req,res)=>{
    allFeedbackCollection.find({})
    .toArray((err,documents)=>{
        return res.send(documents);
    })
})
//feedback

//orders 
app.post('/addOrders',(req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const title = req.body.title;
    const details = req.body.details;
    const price = req.body.price;
    console.log(name, email, title, details, price);
    customerOrderCollection.insertOne({ name, email, title, details, price })
    .then(result=>{
        console.log(result.insertedCount);
        res.send(result.insertedCount)
    })
})

app.get('/order',(req,res)=>{
    customerOrderCollection.find({email: req.query.email})
    .toArray((err,documents)=>{
        return res.send(documents);
    })
})
//orders 

//make admin
app.post('/makeAdmin',(req,res)=>{
    const email = req.body.email;
    console.log(email);
    adminsCollection.insertOne({email})
    .then(result=>{
        console.log(result.insertedCount);
        res.send(result.insertedCount)
    })
})

app.get('/admins',(req,res)=>{
    adminsCollection.find({})
    .toArray((err,documents)=>{
        return res.send(documents);
    })
})
// make admin

// all orders
app.get('/allOrders',(req,res)=>{
    customerOrderCollection.find({})
    .toArray((err,documents)=>{
        return res.send(documents);
    })
})

});

app.listen(process.env.PORT || port);