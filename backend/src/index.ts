import express from 'express';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get('/', (_req, res) => {
  res.json({ message: 'DK-FITT API' });
});

app.listen(port, () => {
  console.log(`DK-FITT API escuchando en http://localhost:${port}`);
});
