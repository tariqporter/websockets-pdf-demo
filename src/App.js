import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  socket = io('http://localhost:8080');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected');
    });

    axios.get('/data/pdf');
  }, []);

  useEffect(() => {
    socket.on('PDFS_GENERATED', (newPdfs) => {
      setPdfs([...pdfs, ...newPdfs]);
      const generatingPdfs2 = generatingPdfs.filter(x => !newPdfs.find(newPdf => newPdf.id === x));
      setGeneratingPdfs(generatingPdfs2);
    });
  }, [pdfs, generatingPdfs]);

  const generatePdf = (e) => {
    axios.post('/data/pdf').then(({ data: { id } }) => {
      setGeneratingPdfs([...generatingPdfs, id]);
    });
  };

  const deletePdf = (e, id) => {
    axios.delete(`/data/pdf/${id}`).then(() => {
      const pdfs2 = pdfs.filter(x => x.id !== id);
      setPdfs(pdfs2);
    });
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
