const express = require(`express`);
const app = express();
const mongoose = require(`mongoose`);
const dotenv = require(`dotenv`).config()


mongoose
  .connect(process.env.db)
  .then(() => {
    console.log(`Connection to DB is established`);
  })
  .catch((err) => {
    console.log(`Unable to establish connection because ${err}`);
  });

const port = process.env.port
const date = new Date();
app.use(express.json());

//create a schema
const userModel = new mongoose.Schema(
  {
    Name: { type: String, required: [true, "Kindly provide your name."] },
    Email: {type: String, unique: true, required: [true, "Kindly provide your email."],},
    Stack: { type: String, set: (entry) => {
      const capitalize =
      entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        return capitalize;}, required: [true, "Kindly provide your stack."] },
    YOB: {type: Number, required: [true, "Kindly provide your year of birth."],},
    Age: { type: Number },
    Sex: {type: String,
      set: (entry) => {
      const capitalize =
      entry.charAt(0).toUpperCase() + entry.slice(1).toLowerCase();
        return capitalize;},
      enum: ["Male", "Female"],
      required: true,
    },},
  { timestamps: true }
);
const myModel = mongoose.model("First Class", userModel);

//create first user
app.post(`/createuser`, async (req, res) => {
  try {
    const { Name, Email, Stack, YOB, Sex } = req.body;
    let naming = Name.split(" ");
    let removedSpace = naming.filter((space) => space !== "");
    let firstLetter = removedSpace[0].slice(0, 1).toUpperCase();
    let remainder = removedSpace[0].slice(1).toLowerCase();
    let tot1 = firstLetter + remainder;
    let firstLetter2 = removedSpace[1].slice(0, 1).toUpperCase();
    let remainder2 = removedSpace[1].slice(1).toLowerCase();
    let tot2 = firstLetter2 + remainder2;

    const data = {
      Name: tot1 + " " + tot2,
      Email: Email.toLowerCase(),
      Stack,
      YOB,
      Age: date.getFullYear() - YOB,
      Sex,
    };
    const createUser = await myModel.create(data);
    res.status(201).json({ message: "New user created successfully.", createUser });
  } catch (e) {
    res.status(400).json(e.message);
  }
});

//Push edited code
//get all students
// app.get(`/getallstudents`, async (req, res) => {
//   try {
//     const allstudents = await myModel.find();
//     allstudents.sort((a,b)=>{
//       if(a.Name < b.Name) return -1;
//     })
//     res.status(200).json({
//       message: `Kindly find below the ${allstudents.length} registered students;`,
//       data: allstudents,
//     });
//   } catch (e) {
//     res.status(500).json(e.message);
//   }
// });

// get one student by ID
app.get(`/getone/:id`, async (req, res) => {
  try {
    let ID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return res.status(400).json({ message: 'Invalid ID format.' });
    }
    const getOne = await myModel.findById(ID);
    if (!getOne) {
      return res.status(400).json(`User with ${ID} not found.`);
    } else {
      res.status(200).json({
        message: `Kindly find the user with id: ${ID} below.`,
        FoundUser: getOne,
      });
    }
  } catch (e) {
    res.status(500).json(e.message);
  }
});

// get one student by Email
app.get(`/getuser/:Email`, async (req, res) => {
  try {
    let Email = req.params.Email;
    if (!mongoose.Types.ObjectId.isValid(Email)) {
      return res.status(400).json({ message: 'Invalid Email format.'});
    }
    const getUser = await myModel.findOne({ Email });
    if(!getUser){
      res.status(400).json({message: `User with ${Email} not found.`})
    }else{  
    res.status(200).json({
      message: `Kindly find the user with email: ${Email} below;`,
      FoundUser: getUser,
    })}
  } catch (e) {
    res.status(500).json(e.message);
  }
});

// update a user by ID
app.put(`/updateuser/:id`, async (req, res) => {
  try {
    let ID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return res.status(400).json({ message: 'Invalid ID format.' });
    }
    const myUpdate = await myModel.findByIdAndUpdate(ID, req.body, {
      new: true,
    });
    if(!myUpdate){
      res.status(400).json({message: `Invalid User ID: ${ID}, does not exist.`})
    }else{
    res.status(200).json({ message: `User updated successfully.`, myUpdate })}
  } catch (e) {
    res.status(500).json(e.message);
  }
});

// delete a user
app.delete(`/deleteuser/:id`, async (req, res) => {
  try {
    let ID = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return res.status(400).json({ message: 'Invalid ID format.' });
    }
    const deleteUser = await myModel.findByIdAndDelete(ID, req.body);
    if(!deleteUser){
      res.status(400).json({message: `User with ID: ${ID} not found.`})
    }else{
    res.status(200).json({
      message: `User with ID: ${ID} has been successfully deleted.`,
      deleteUser,
    })}
  } catch (e) {
    res.status(500).json(e.message);
  }
});

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
