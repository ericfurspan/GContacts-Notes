import React, { Component } from 'react';
import Contacts from './Contacts';
import logo from './gmail.svg';
import Button from '@material-ui/core/Button';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: null,
      author: null,
      title: null,
      loading: false
    }
  }
  componentDidMount() {
    this.handleRedirect();
  }

  // handles google auth redirect by pulling URI params and adding to localstorage
  handleRedirect = () => {
    let paramString = window.location.hash.substring(1);
    const urlParams = new URLSearchParams(paramString);

    let params = {};
    for(let pair of urlParams.entries()) {
      params[pair[0]] = pair[1];
    }

    if (Object.keys(params).length > 0) {
      localStorage.setItem('googleOAuth2', JSON.stringify(params) );
      if (params['state'] && params['state'] === 'try_sample_request') {
        this.getContacts();
      }
    }
  }

  logout = () => {
    localStorage.clear();
    window.location.assign('/');
  }

  getContacts = () => {
    this.setState({loading: true})

    // If there's an access token, try an API request.
    // Otherwise, start OAuth 2.0 flow.
      let params = JSON.parse(localStorage.getItem('googleOAuth2'));
      if (params && params['access_token']) {
        const authUrl = `https://www.google.com/m8/feeds/contacts/default/full?access_token=${params['access_token']}&max-results=10000&alt=json`
        fetch(authUrl)
        .then(res => res.json())
        .then(json => {
          // clean data, remove any contact entries without title.$t
          if(json && json.feed) {
            const contacts = json.feed.entry.filter(entry => entry.title.$t.length > 0);
            const author = json.feed.author;
            const title = json.feed.title;
            this.setState({contacts, author, title, loading: false})
          }
        })
        .catch(e => {
          // @TODO: if unauthorized 401, handle properly
          console.error(e);
          this.oAuthSignIn();
        })
      } else {
        this.oAuthSignIn();
      }
  }

  oAuthSignIn = () => {
    // see https://developers.google.com/identity/protocols/OAuth2UserAgent#redirecting

    // Google's OAuth 2.0 endpoint for requesting an access token
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const redirectUri = window.location.href;
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const scope = 'https://www.googleapis.com/auth/contacts.readonly';

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    let form = document.createElement('form');
    
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    const params = {'client_id': clientId,
                  'redirect_uri': redirectUri,
                  'scope': scope,
                  'response_type': 'token',
                  'include_granted_scopes': 'true',
                  'state': 'try_sample_request'};

    // Add form parameters as hidden input values.
    for (let p in params) {
      let input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }

  render() {
    if(this.state.loading) {
      return (
        <div className="App App-wrapper">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
      )
    }
    return (
      <div className="App App-wrapper">
        {this.state.contacts ? (
          <Contacts 
            data={this.state}
            logout={this.logout}
          />
        ) : 
          <div>
            <img src={logo} className="App-logo" alt="logo" /><br/><br/>
            <h5>Welcome to GContact Notes</h5>
            <p className="App-subtitle">Connect with your Google Account and save notes to Contacts</p>
            <Button onClick={() => this.getContacts()} color='primary' variant='contained' size='large'>
              Get Started
            </Button>
          </div>
        }
      </div>
    );
  }
}

export default App;
