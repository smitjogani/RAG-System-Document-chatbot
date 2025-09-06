import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import documentRoutes from './src/routes/document.routes.js';
import queryRoutes from './src/routes/query.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/document', documentRoutes);
app.use('/api/query', queryRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
