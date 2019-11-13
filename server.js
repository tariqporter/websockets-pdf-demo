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

const initSocketEvents = (socket) => {
  socket.on('GET_PDFS', () => {
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
    });
  });

  socket.on('DELETE_PDF', ({ id }) => {
    let filePath = `/pdf/${id}.pdf`;
    let fullPath = path.join(publicPath, filePath);
    fs.unlink(fullPath, () => {
      socket.emit('PDF_DELETED', { id });
    });
  });

  socket.on('CREATE_PDF', () => {
    const id = randomWords(2).join('-');
    let filePath = `/pdf/${id}.pdf`;
    let fullPath = path.join(publicPath, filePath);
    for (let i = 0; i < 10; i++) {
      if (!fs.existsSync(fullPath)) break;
      filePath = `/pdf/${id}-${i}.pdf`;
      fullPath = path.join(publicPath, filePath);
    }
    socket.emit('PDFS_GENERATING', [id]);
    createPdf(fullPath).then(() => {
      socket.emit('PDFS_GENERATED', [{ id, path: filePath }]);
    });
  });
};

io.on('connection', socket => {
  initSocketEvents(socket);
  socket.on('disconnect', () => { });
});