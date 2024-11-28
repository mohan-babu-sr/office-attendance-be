const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Attendance = require('./models/Attendance');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.log('MongoDB connection error:', error));

app.get('/api/getCatelogs', async (req, res) => {
    try {
        const { modelName } = req.query;
        if (!modelName) {
            return res.status(400).json({ error: 'modelName is required' });
        }
        const Model = require(`./models/${modelName}`); // Assuming models are in the 'models' folder

        if (!Model) {
            return res.status(404).json({ error: 'Model not found' });
        }
        const sort = { 'name': 1 };
        const data = await Model.find({}).sort(sort);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
})

// Common GET API to fetch all documents
app.get('/api/getData', async (req, res) => {
    try {
        // Extract query parameters from the request
        const { MonthYear, Place, sortBy } = req.query;

        // Validate the MonthYear parameter
        if (!MonthYear) {
            return res.status(400).json({ error: 'MonthYear is required' });
        }

        // Build the query object dynamically
        const query = { MonthYear };

        // If Place is provided and is not 'null', add it to the query
        if (Place && Place !== 'null') {
            query.Place = Place; // Assuming Place contains the _id of a place
        }

        // Build the sort object dynamically
        let sort = {};
        if (sortBy) {
            const sortParams = sortBy.split(':'); // Expected format: "field:order" (e.g., "Date:asc")
            const field = sortParams[0];
            const order = sortParams[1]?.toLowerCase() === 'desc' ? -1 : 1;
            sort[field] = order;
        }

        // Query the database with the constructed query and sort options
        // Optionally populate the Place field if needed
        const data = await Attendance.find(query)
            .sort(sort)
            .populate('Place'); // Populate Place field with reference data if required

        // Respond with the fetched data
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
});


// POST route to create a new place
app.post('/api/postData', async (req, res) => {
    try {
        const data = req.body;  // Get the data from the request body

        // let date = new Date(data.Date);
        // data.Date = date;

        const newData = new Attendance(data); // Create a new instance of your Mongoose model

        // Save the new data to the database
        const savedData = await newData.save();

        // Send a success response
        res.status(201).json({
            message: 'Data created successfully',
            _id: savedData._id,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error creating data',
            error: error.message,
        });
    }
});

app.delete('/api/deleteData/:id', async (req, res) => {
    try {
        const id = req.params.id; // Get the id from the route parameters

        // Check if the id is provided
        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        // Attempt to delete the document by id
        const result = await Attendance.findByIdAndDelete(id);

        // Check if the document was found and deleted
        if (!result) {
            return res.status(404).json({ message: 'Data not found' });
        }

        // Respond with success
        res.status(200).json({ message: 'Data deleted successfully', data: result });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ message: 'Error deleting data', error: error.message });
    }
});



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
