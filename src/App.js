import React, { useEffect, useReducer } from 'react';
import * as io from "socket.io-client";
import { Grid, Link, IconButton, Button, CircularProgress } from '@material-ui/core';
import { CloseOutlined } from '@material-ui/icons';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  root: {
    minHeight: '100vh',
    padding: 100
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const initialState = { generatingPdfs: [], pdfs: [] };

const reducer = (state, action) => {
  switch (action.type) {
    case 'PDFS_GENERATING':
      return {
        ...state,
        generatingPdfs: [...state.generatingPdfs, ...action.generatingPdfs]
      };
    case 'PDFS_GENERATED':
      return {
        ...state,
        pdfs: [...state.pdfs, ...action.pdfs],
        generatingPdfs: state.generatingPdfs.filter(x => !action.pdfs.find(newPdf => newPdf.id === x))
      };
    case 'PDF_DELETED':
      return {
        ...state,
        pdfs: state.pdfs.filter(x => x.id !== action.id)
      }
    default:
      return state;
  }
};

const socket = io('http://localhost:8080');

const App = () => {
  const c = useStyles();
  const [{ generatingPdfs, pdfs }, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    socket.on('DATA', dispatch);
    socket.emit('GET_PDFS');
  }, []);

  return (
    <Grid container className={c.root}>
      <Grid item xs={6} className={c.panel} style={{ background: '#dcd0c0' }}>
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
              <IconButton onClick={e => socket.emit('DELETE_PDF', { id })}>
                <CloseOutlined />
              </IconButton>
            </div>

          ))
        }
        {
          generatingPdfs.map((id) => (
            <CircularProgress key={id} style={{ marginBottom: 5 }} />
          ))
        }
      </Grid>
      <Grid item xs={6} className={c.panel} style={{ background: '#373737' }}>
        <Button variant="contained" onClick={e => socket.emit('CREATE_PDF', {})}>Generate PDF</Button>
      </Grid>
    </Grid>
  );
};

export default App;
