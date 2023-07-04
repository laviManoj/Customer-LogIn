// server.js (inside the backend directory)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const port = 5000; // Change this to your desired port number

app.use(cors());
app.use(bodyParser.json());

// Connect to the database (replace 'your-database-url' with your actual database URL)
mongoose.connect('your-database-url', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const CustomerDetailsSchema = new mongoose.Schema({
  mobileNumber: String,
  password: String,
  customerName: String,
});

const CustomerDetails = mongoose.model('CustomerDetails', CustomerDetailsSchema);

// Login route
app.post('/login', async (req, res) => {
  const { mobileNumber, password } = req.body;
  try {
    const customer = await CustomerDetails.findOne({ mobileNumber });
    if (!customer) {
      return res.status(404).json({ error: 'Mobile Number does not exist' });
    }

    const encryptedPassword = encryptPassword(password, mobileNumber);
    if (encryptedPassword !== customer.password) {
      return res.status(401).json({ error: 'Invalid Customer' });
    }

    const customerName = customer.customerName;
    return res.status(200).json({ message: `Welcome ${customerName}` });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to encrypt the password using AES algorithm
function encryptPassword(password, secretKey) {
  const cipher = crypto.createCipher('aes-256-cbc', secretKey);
  let encryptedPassword = cipher.update(password, 'utf8', 'hex');
  encryptedPassword += cipher.final('hex');
  return encryptedPassword;
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
