import React, { useEffect, useState, useReducer } from 'react';
import io from "socket.io-client";
import { Grid, Link, IconButton, Button, CircularProgress } from '@material-ui/core';
import { CloseOutlined } from '@material-ui/icons';
import { createUseStyles } from 'react-jss';

let socket;

const useStyles = createUseStyles({
  root: {
    minHeight: '100vh',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const App = () => {
  const c = useStyles();

  const [generatingPdfs, setGeneratingPdfs] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  // const [{ generatingPdfs, pdfs }, dispatch] = useReducer({ generatingPdfs: [], pdfs: [] })

  socket = io('http://localhost:8080');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.emit('GET_PDFS', {});
  }, []);

  socket.on('PDFS_GENERATING', (newPdfs) => {
    setGeneratingPdfs(p => [...p, ...newPdfs]);
  });

  socket.on('PDFS_GENERATED', (newPdfs) => {
    setPdfs(p => [...p, ...newPdfs]);
    setGeneratingPdfs(p => p.filter(x => !newPdfs.find(newPdf => newPdf.id === x)));
  });

  socket.on('PDF_DELETED', ({ id }) => {
    setPdfs(p => p.filter(x => x.id !== id));
  });

  const generatePdf = (e) => {
    socket.emit('CREATE_PDF', {});
  };

  const deletePdf = (e, id) => {
    socket.emit('DELETE_PDF', { id });
  };

  return (
    <Grid container className={c.root}>
      <Grid item xs={6} className={c.panel}>
        {
          pdfs.map(({ id, path }) => (
            <div
              key={id}
            >
              <Link
                href={path}
                onClick={e => { e.target.download = `test-${id}.pdf`; }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {id}
              </Link>
              <IconButton onClick={e => deletePdf(e, id)}>
                <CloseOutlined />
              </IconButton>
            </div>

          ))
        }
        {
          generatingPdfs.map((id) => (
            <CircularProgress key={id} />
          ))
        }
      </Grid>
      <Grid item xs={6} className={c.panel}>
        <Button variant="contained" color="primary" onClick={generatePdf}>Generate PDF</Button>
      </Grid>
    </Grid>
  );
};

export default App;
