// Hidden file, contains database URL
require('dotenv').config();

const routes = require('./routes/routes');
const express = require('express')
const mongoose = require('mongoose');
const mongoString = process.env.DATABASE_URL
const Model = require('../model/model');

// Connect to database
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
	console.log(error);
});

database.once("connected", () => {
	console.log("Database Connected");
});

const app = express();
const allowedHosts = ["http://localhost:4000", "http://localhost:5173"];
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);

			if (allowedHosts.indexOf(origin) === -1) {
				var msg =
					"The CORS policy for this site does not allow acces from the specified origin";
				return callback(new Error(msg), false);
			}

			return callback(null, true);
		},
	})
);

const port = 4000;

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use('/api', routes)
app.use("/api", routes);
app.use(express.json());
app.get("/", (req, res) => {
	res.send("Hello World!");
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Receives json from client with new data, updates database, then broadcasts to all connected clients
   // Listen for 'newData' event from client
   socket.on('newData', (data) => {
    // create a new document using Mongoose
    const newData = new Model(data);
    // save the new document to the database
    newData.save((err, savedData) => {
      if (err) {
        console.log(err);
      } else {
        // If successful, broadcast update to all connected clients 
        console.log('New data saved:', savedData);
        io.emit('newData', savedData)
      }
    });
  });
  // Listen for disconnect from clients
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`listening on *: ${port}`);
});


