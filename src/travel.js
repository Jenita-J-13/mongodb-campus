const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Open Travel Buddy application
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/travel.html");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

// Travel Buddy Schema
const travelBuddySchema = new mongoose.Schema({
    buddyId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    tripDuration: {
        type: String,
        required: true
    },
    interests: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

const TravelBuddy = mongoose.model("TravelBuddy", travelBuddySchema);


// 1. Add a new travel buddy
app.post("/travel-buddies", async (req, res) => {
    try {
        const buddy = new TravelBuddy(req.body);

        await buddy.save();

        console.log("Travel buddy added successfully:");
        console.log("Buddy ID:", buddy.buddyId);
        console.log("Name:", buddy.name);
        console.log("Destination:", buddy.destination);
        console.log("Age:", buddy.age);
        console.log("Budget:", buddy.budget);
        console.log("Trip Duration:", buddy.tripDuration);
        console.log("Interests:", buddy.interests);
        console.log("Status:", buddy.status);
        console.log("----------------------------");

        res.send("Travel buddy added successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 2. Display people travelling to a destination
// whose budget is greater than the specified amount
app.get("/travel-buddies/filter", async (req, res) => {
    try {
        const destination = req.query.destination;
        const budget = Number(req.query.budget);

        const buddies = await TravelBuddy.find({
            destination: destination,
            budget: { $gt: budget }
        });

        res.json(buddies);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 3. Display selected buddy details
// IMPORTANT: details route must come before /:buddyId

app.get("/travel-buddies/:buddyId/details", async (req, res) => {
    try {
        const buddy = await TravelBuddy.findOne(
            { buddyId: req.params.buddyId },
            {
                _id: 0,
                name: 1,
                destination: 1,
                budget: 1,
                tripDuration: 1
            }
        );

        if (!buddy) {
            return res.status(404).send("Travel buddy not found");
        }

        res.json(buddy);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 4. Search travel buddy by Buddy ID
app.get("/travel-buddies/:buddyId", async (req, res) => {
    try {
        const buddy = await TravelBuddy.findOne({
            buddyId: req.params.buddyId
        });

        if (!buddy) {
            return res.status(404).send("Travel buddy not found");
        }

        res.json(buddy);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 5. Update destination and budget
app.put("/travel-buddies/:buddyId", async (req, res) => {
    try {
        const buddy = await TravelBuddy.findOneAndUpdate(
            { buddyId: req.params.buddyId },
            {
                destination: req.body.destination,
                budget: req.body.budget
            },
            { new: true }
        );

        if (!buddy) {
            return res.status(404).send("Travel buddy not found");
        }

        res.json(buddy);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 6. Increase budget of all people travelling
// to a particular destination
app.put(
    "/travel-buddies/destination/:destination/increase",
    async (req, res) => {
        try {
            const increase = Number(req.body.budget);

            const result = await TravelBuddy.updateMany(
                { destination: req.params.destination },
                { $inc: { budget: increase } }
            );

            res.json({
                message: "Budget increased successfully",
                modifiedCount: result.modifiedCount
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }
);


// 7. Find travel buddies within a budget range
app.get("/travel-buddies/range/search", async (req, res) => {
    try {
        const min = Number(req.query.min);
        const max = Number(req.query.max);

        const buddies = await TravelBuddy.find({
            budget: {
                $gte: min,
                $lte: max
            }
        });

        res.json(buddies);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 8. Delete travel buddy by Buddy ID
app.delete("/travel-buddies/:buddyId", async (req, res) => {
    try {
        const buddy = await TravelBuddy.findOneAndDelete({
            buddyId: req.params.buddyId
        });

        if (!buddy) {
            return res.status(404).send("Travel buddy not found");
        }

        res.send("Travel buddy deleted successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 9. Display all remaining travel buddies
// in descending order of budget
app.get("/travel-buddies", async (req, res) => {
    try {
        const buddies = await TravelBuddy.find().sort({ budget: -1 });

        res.json(buddies);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Travel Buddy server running on port ${PORT}`);
});
