require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDb = require("./database/mongoose");

const app = express();
app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    if (req.method === 'GET') {
      req.body = {};
      return next();
    }
    return res.status(400).json({ message: "Invalid JSON format provided. Please check your request body." });
  }
  next();
});
app.use(express.urlencoded({extended: true}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./Routes/authRoutes');
const customerRoutes = require('./Routes/customerRoutes');
const policyRoutes = require('./Routes/policyRoutes');
const claimRoutes = require('./Routes/claimRoutes');
const premiumRoutes = require('./Routes/premiumRoutes');
const documentRoutes = require('./Routes/documentRoutes');
const reportRoutes = require('./Routes/reportRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);

const port = process.env.PORT || 3000;
connectDb();

app.get("/", (req, res)=> {
  res.send("Server Working");
})

app.listen(port, (req, res)=> {
  console.log(`Server is listening on Port: ${port}`);
})