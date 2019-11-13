const app = require('express')();
const path = require('path');
const fs = require('fs');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const cors = require('cors');
const randomWords = require('random-words');
const { createPdf } = require('./pdf');

const publicPath = path.join(__dirname, 'public');
server.listen(8080);
app.use(cors());

let socket = null;

app.get('/data/pdf', (req, res) => {
  const fullPath = path.join(publicPath, 'pdf');
  fs.readdir(fullPath, (err, files) => {
    const files2 = files.map(filePath => {
      const { name } = path.parse(filePath);
      return {
        id: name,
        path: `/pdf/${filePath}`
      }
    });
    socket.emit('PDFS_GENERATED', files2);
    return res.json({})
  });
});

app.delete('/data/pdf/:id', (req, res) => {
  const id = req.params.id;
  let filePath = `/pdf/${id}.pdf`;
  let fullPath = path.join(publicPath, filePath);
  fs.unlinkSync(fullPath);
  return res.json({ msg: 'success', err: null })
});

app.post('/data/pdf/', (req, res) => {
  const id = randomWords(2).join('-');
  let filePath = `/pdf/${id}.pdf`;
  let fullPath = path.join(publicPath, filePath);
  for (let i = 0; i < 10; i++) {
    if (!fs.existsSync(fullPath)) break;
    filePath = `/pdf/${id}-${i}.pdf`;
    fullPath = path.join(publicPath, filePath);
  }
  createPdf(fullPath).then(() => {
    socket.emit('PDFS_GENERATED', [{ id, path: filePath }]);
  });
  return res.json({ id });
});

io.on('connection', s => {
  socket = s;
  socket.on('disconnect', () => { });
});