import React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import ContactMail from '@material-ui/icons/ContactMailSharp';
import NoteIcon from '@material-ui/icons/NoteAddOutlined';
import CommentIcon from '@material-ui/icons/Comment';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  demo: {
		backgroundColor: theme.palette.background.paper,
		borderRadius: '4px'
  },
  title: {
		margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
		color: '#fff'
	}
})

export class Contacts extends React.Component {
	constructor(props) {
    super(props);
		this.noteRef = React.createRef();
		this.state = {
			open: false,
			selectedContact: null,
		}
  }
	
	// closes notes dialog
  handleCloseDialog = () => {
    this.setState({ 
			selectedContact: null,
			open: false
		});
  };
	
	// gets any existing notes for contact from localstorage
	// updates Contact object with notes
	// updates local state
	// opens notes dialog
	handleOpenDialog = (contact) => {
		let contactNotes = this.getNotesFromLocalStorage(contact.id.$t);

		contact['notes'] = contactNotes;

    this.setState({
			open: true,
			selectedContact: contact
    });
  };

	// gets notes from localstorage for given contactId
	getNotesFromLocalStorage = (contactId) => {
		return JSON.parse(localStorage.getItem( contactId ) );
	}

	// gets value of new note (from input field ref)
	// adds new note to existing notes
	// updates state
	handleNewNote = () => {
		const newNote = this.noteRef.value;
		if(newNote.length > 0) {
			let updatedNotes = this.addNoteToLocalStorage(newNote);

			this.setState((prevState) => {
				return { 
					selectedContact: {
						...prevState.selectedContact,
						notes: updatedNotes
					}
				};
			});
			this.noteRef.value = '';
		}
	}

	// when creating new note, get any existing notes and append new note
	// then update localstorage with updates notes
	addNoteToLocalStorage = (newNote) => {
		let updatedNotes = [];

		const contactId = this.state.selectedContact.id.$t;

		let previousNotes = JSON.parse(localStorage.getItem( contactId ) );

		if(previousNotes) {
			updatedNotes = [...previousNotes, newNote];
		} else {
			updatedNotes.push(newNote);
		}

		localStorage.setItem(contactId, JSON.stringify(updatedNotes));
		return updatedNotes;
	}

  render() {
		const { classes, data, logout } = this.props;

		// if a contact is selected, render the dialog
		let notesDialog;
		if(this.state.selectedContact) {
			notesDialog = 
				<Dialog 
					onClose={this.handleCloseDialog}
					open={this.state.open}
					fullWidth={true}
					maxWidth='sm'
				>
					<DialogTitle>{`Notes for ${this.state.selectedContact.title.$t}`}</DialogTitle>
					{this.state.selectedContact.notes && this.state.selectedContact.notes.map((note, i) => (							
						<ListItem key={i} >
							<ListItemAvatar>
								<Avatar>
									<CommentIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={note}/>
						</ListItem>
					))}
					<br/><br/>
					<DialogContent>
						<DialogContentText>
							Enter a note for this contact
						</DialogContentText>
						<TextField
							autoFocus
							margin="dense"
							id="name"
							label="Add Note"
							type="text"
							fullWidth
							inputRef={val => this.noteRef = val}
						/>

					</DialogContent>	
					<DialogActions>
						<Button onClick={this.handleCloseDialog}>
							Cancel
						</Button>
						<Button onClick={this.handleNewNote}>
							Create Note
						</Button>
					</DialogActions>											
				</Dialog>
		}
    return (
        <Grid item xs={12}>
					<Typography variant="h6" className={classes.title}>
						{data.title.$t}
					</Typography>
					<Button onClick={() => logout()} color='secondary'>
						Logout
					</Button>
					<br/>
					<div className={classes.demo}>
						<List>
							{data.contacts && data.contacts.map(contact => (
								<ListItem key={contact.id.$t} divider>
									<ListItemAvatar>
											<Avatar>
												<ContactMail />
											</Avatar>
										</ListItemAvatar>
									<ListItemText
										primary={contact.title.$t}
									/>
									<ListItemSecondaryAction>
										<IconButton onClick={() => this.handleOpenDialog(contact)}>
											<NoteIcon />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
							))}
						</List>
						{notesDialog}
					</div>

				</Grid>
    )
  }
}

Contacts.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Contacts);
