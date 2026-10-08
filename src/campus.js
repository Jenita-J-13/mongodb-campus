const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Open Campus Club application
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/campus.html");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

// Member Schema
const memberSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    clubName: {
        type: String,
        required: true
    },
    yearOfStudy: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    points: {
        type: Number,
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

const Member = mongoose.model("Member", memberSchema);


// 1. Add a new member
app.post("/members", async (req, res) => {
    try {
        const member = new Member(req.body);

        await member.save();

        console.log("Member added successfully:");
        console.log("Member ID:", member.memberId);
        console.log("Name:", member.name);
        console.log("Club Name:", member.clubName);
        console.log("Year of Study:", member.yearOfStudy);
        console.log("Role:", member.role);
        console.log("Points:", member.points);
        console.log("Interests:", member.interests);
        console.log("Status:", member.status);
        console.log("----------------------------");

        res.send("Member added successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 2. Display members of a club with points greater than specified
app.get("/members/filter", async (req, res) => {
    try {
        const clubName = req.query.clubName;
        const points = Number(req.query.points);

        const members = await Member.find({
            clubName: clubName,
            points: { $gt: points }
        });

        res.json(members);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 3. Search member by Member ID
// 4. Display selected member details
// IMPORTANT: details route must come before /:memberId

app.get("/members/:memberId/details", async (req, res) => {
    try {
        const member = await Member.findOne(
            { memberId: req.params.memberId },
            {
                _id: 0,
                name: 1,
                clubName: 1,
                role: 1,
                points: 1
            }
        );

        if (!member) {
            return res.status(404).send("Member not found");
        }

        res.json(member);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get("/members/:memberId", async (req, res) => {
    try {
        const member = await Member.findOne({
            memberId: req.params.memberId
        });

        if (!member) {
            return res.status(404).send("Member not found");
        }

        res.json(member);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 5. Update role and points
app.put("/members/:memberId", async (req, res) => {
    try {
        const member = await Member.findOneAndUpdate(
            { memberId: req.params.memberId },
            {
                role: req.body.role,
                points: req.body.points
            },
            { new: true }
        );

        if (!member) {
            return res.status(404).send("Member not found");
        }

        res.json(member);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 6. Increase points of all members in a club
app.put("/members/club/:clubName/increase", async (req, res) => {
    try {
        const increase = Number(req.body.points);

        const result = await Member.updateMany(
            { clubName: req.params.clubName },
            { $inc: { points: increase } }
        );

        res.json({
            message: "Points increased successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 7. Search members by points range
app.get("/members/range/search", async (req, res) => {
    try {
        const min = Number(req.query.min);
        const max = Number(req.query.max);

        const members = await Member.find({
            points: {
                $gte: min,
                $lte: max
            }
        });

        res.json(members);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 8. Delete member by Member ID
app.delete("/members/:memberId", async (req, res) => {
    try {
        const member = await Member.findOneAndDelete({
            memberId: req.params.memberId
        });

        if (!member) {
            return res.status(404).send("Member not found");
        }

        res.send("Member deleted successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// 9. Display all remaining members in descending order of points
app.get("/members", async (req, res) => {
    try {
        const members = await Member.find().sort({ points: -1 });

        res.json(members);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Start Server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Campus Club server running on port ${PORT}`);
    });
}

module.exports = app;