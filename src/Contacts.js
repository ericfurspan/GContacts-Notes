import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import AddNoteIcon from '@material-ui/icons/NoteAddSharp';
import DeleteIcon from '@material-ui/icons/DeleteSharp';
import CommentIcon from '@material-ui/icons/Comment';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = theme => ({
  root: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  demo: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: '4px'
  },
  title: {
    margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
    color: '#fff'
  },
  buttonIcon: {
    marginRight: theme.spacing.unit,
  }
})

export class Contacts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedContact: null,
      noteText: ''
    }
    this.handleSelectContact = this.handleSelectContact.bind(this);
    this.getNotesFromLocalStorage = this.getNotesFromLocalStorage.bind(this);
    this.handleNewNote = this.handleNewNote.bind(this);
  }

  // gets any existing notes for contact from localstorage
  // updates Contact object with notes
  // updates local state
  // opens contact notes notes
  handleSelectContact(contact) {
    // handle closing expansion panel
    if(this.state.selectedContact && this.state.selectedContact.id.$t === contact.id.$t) {
      return this.setState({
        selectedContact: null
      });
    } else {
      let contactNotes = this.getNotesFromLocalStorage(contact.id.$t);

      contact['notes'] = contactNotes;

      this.setState({
        selectedContact: contact,
        noteText: ''
      });
    }
  };

  // gets notes from localstorage for given contactId
  getNotesFromLocalStorage(contactId) {
    return JSON.parse(localStorage.getItem( contactId ) );
  }

  // gets value of new note
  // adds new note to existing notes
  // updates localstorage and state
  handleNewNote() {
    const newNote = this.state.noteText;

    if(newNote.length > 0) {
      let updatedNotes = this.addNoteToLocalStorage(newNote);

      this.setState((prevState) => {
        return {
          selectedContact: {
            ...prevState.selectedContact,
            notes: updatedNotes
          },
          noteText: ''
        };
      });
    }
  }

	// removes note from localstorage and state via note index
	handleRemoveNote = (noteIndex) => {
	  const contactId = this.state.selectedContact.id.$t;
	  let previousNotes = JSON.parse(localStorage.getItem( contactId ) );
	  let updatedNotes = previousNotes.filter(e => e.index !== noteIndex);

	  localStorage.setItem(contactId, JSON.stringify(updatedNotes));

	  this.setState((prevState) => {
	    return {
	      selectedContact: {
	        ...prevState.selectedContact,
	        notes: updatedNotes
	      }
	    };
	  });
	}

	// when creating new note, get any existing notes and append new note
	// then update localstorage with updates notes
	addNoteToLocalStorage = (noteText) => {
	  let updatedNotes = [];

	  const contactId = this.state.selectedContact.id.$t;
	  let previousNotes = JSON.parse(localStorage.getItem( contactId ) );
	  let notesLength = previousNotes ? previousNotes.length : 0;
	  const newNote = { index: notesLength, val: noteText };

	  if(previousNotes) {
	    updatedNotes = [...previousNotes, newNote];
	  } else {
	    updatedNotes.push(newNote);
	  }

	  localStorage.setItem(contactId, JSON.stringify(updatedNotes));
	  return updatedNotes;
	}

	renderSelectedContactNotes = () => {
	  if(this.state.selectedContact && this.state.selectedContact.notes) {
	    return (
	      <List>
	        {this.state.selectedContact.notes.map(note => (
	          <ListItem key={note.index}>
	            <ListItemAvatar>
	              <Avatar>
	                <CommentIcon />
	              </Avatar>
	            </ListItemAvatar>
	            <ListItemText
	              disableTypography
	              secondary={
	                <div>
	                  {note.val.split("\n").map((i, key) => {
	                    return <Typography key={key} color="primary" variant="headline">{i}</Typography>;
	                  })}
	                </div>
	              }
	            />
	            <IconButton onClick={() => this.handleRemoveNote(note.index)}>
	              <DeleteIcon color='secondary' />
	            </IconButton>
	          </ListItem>
	        ))}
	      </List>
	    )
	  }
	}

	render() {
	  const { classes, data, logout } = this.props;
	  const selectedContactId = this.state.selectedContact ? this.state.selectedContact.id.$t : null;

	  return (
	    <Grid container className={classes.root}>
	      <Grid item xs={12} sm={6} >
	        <Typography variant="h6" className={classes.title}>
	          {data.title.$t}
	        </Typography>
	        <Button color='secondary' onClick={logout}>
						Logout
	        </Button>
	        <br/>
	        <div className={classes.demo}>
	          <List>
	            {data.contacts && data.contacts.map(contact => (
	              <ExpansionPanel
	                key={contact.id.$t}
	                expanded={selectedContactId === contact.id.$t}
	                onChange={() => this.handleSelectContact(contact)}
	              >
	                <ExpansionPanelSummary
	                  expandIcon={<ExpandMoreIcon />}
	                  // onClick={() => this.handleSelectContact(contact)}
	                >
	                  <Typography variant="headline">{contact.title.$t}</Typography>
	                </ExpansionPanelSummary>

	                <ExpansionPanelDetails style={{display: 'block'}}>
	                  <Grid item xs={12}>
	                    {this.state.selectedContact ? (
	                      this.renderSelectedContactNotes()
	                    ) : null}
	                  </Grid> <br/>
	                  <Grid item xs={12}>
	                    <TextField
	                      autoFocus
	                      multiline
	                      margin="dense"
	                      id="name"
	                      label="New Note"
	                      type="text"
	                      fullWidth
	                      value={this.state.noteText}
	                      onChange={e => this.setState({noteText: e.target.value})}
	                    />
	                  </Grid><br/>
	                  <Grid item xs={12}>
	                    <Button onClick={this.handleNewNote} color="primary" variant="contained">
	                      <AddNoteIcon className={this.props.classes.buttonIcon}/>
												Create Note
	                    </Button>
	                  </Grid>
	                </ExpansionPanelDetails>
	              </ExpansionPanel>
	            ))}
	          </List>
	        </div>
	      </Grid>
	    </Grid>
	  )
	}
}

Contacts.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Contacts);
