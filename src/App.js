import React, { useEffect, useReducer } from 'react';
import io from "socket.io-client";
import { Grid, Link, IconButton, Button, CircularProgress } from '@material-ui/core';
import { CloseOutlined } from '@material-ui/icons';
import { createUseStyles } from 'react-jss';

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

let socket;

const App = () => {
  const c = useStyles();
  const [{ generatingPdfs, pdfs }, dispatch] = useReducer(reducer, initialState);

  socket = io('http://localhost:8080');

  useEffect(() => {
    socket.emit('GET_PDFS');
  }, []);

  socket.on('DATA', action => dispatch(action));

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
              <IconButton onClick={e => socket.emit('DELETE_PDF', { id })}>
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
        <Button variant="contained" color="primary" onClick={e => socket.emit('CREATE_PDF', {})}>Generate PDF</Button>
      </Grid>
    </Grid>
  );
};

export default App;
