const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const port = 5000;

//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n5bpp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.n5bpp.mongodb.net:27017,cluster0-shard-00-01.n5bpp.mongodb.net:27017,cluster0-shard-00-02.n5bpp.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-bnpxi0-shard-0&authSource=admin&retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log("DB Test", err);
    const adminCollection = client.db("creativeAgency").collection("admins");
    const serviceCollection = client.db("creativeAgency").collection("services");
	const orderCollection = client.db("creativeAgency").collection("orders");
	const reviewCollection = client.db("creativeAgency").collection("reviews");
	
	app.post("/addOrder",  (req, res) => {
		const newOrder = req.body;
		
		orderCollection.insertOne(newOrder)
		.then(result => {
			res.send(result.insertedCount > 0);
		})
	})	
	
	app.get('/orders', (req, res) => {
	orderCollection.find({})
		.toArray((err, documents) => {
			res.send(documents);
		})
    })
	
	app.get("/singleOrder", (req, res) => {
		orderCollection.find({email: req.query.email})
		.toArray((err, documents) => {
			res.send(documents);
		})
	})

	app.patch('/updateStatus/:id', (req, res) => {
		orderCollection.updateOne({ _id: ObjectId(req.params.id) },
		  {
			$set: { status: req.body.status }
		  })
		  .then(result => {
			console.log(result)
			res.send(result.modifiedCount > 0)
		  })
	});	

	app.post('/addReview', (req, res) => {
		const newReview = req.body;
		
		reviewCollection.insertOne(newReview)
		.then(result => {
			res.send(result.insertedCount > 0);
		})
	})
	
	app.get('/reviews', (req, res) => {
	reviewCollection.find({})
		.toArray((err, documents) => {
			res.send(documents);
		})
    })
	
	app.post('/addService', (req, res) => {
	const file = req.files.file;
	const title = req.body.title;
	const description = req.body.description;
	const newImg = file.data;
	const encImg = newImg.toString('base64');

	var image = {
		contentType: file.mimetype,
		size: file.size,
		img: Buffer.from(encImg, 'base64')
	};

	serviceCollection.insertOne({ title, description, image })
		.then(result => {
			res.send(result.insertedCount > 0);
		})
    })
	
	app.get('/services', (req, res) => {
	serviceCollection.find({})
		.toArray((err, documents) => {
			res.send(documents);
		})
    })

	app.post('/addAdmin', (req, res) => {
	const email = req.body.email;

	adminCollection.insertOne({ email })
		.then(result => {
			res.send(result.insertedCount > 0);
		})
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })	

});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)     