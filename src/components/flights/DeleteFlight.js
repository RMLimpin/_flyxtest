import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withFirebase } from '../../firebase'
import { firebase } from '@firebase/app';
import '@firebase/firestore'
import { createMuiTheme, Dialog, Box, Divider, Button, CircularProgress, DialogTitle, DialogContent, DialogContentText } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles';
import moment from 'moment'
import { COLORS } from '../../constants'

const customPostTheme = createMuiTheme({
  palette: {
    primary: {
      main: COLORS.secondary
    },
    secondary: {
      main: COLORS.secondary
    },
  },
})

const styles = {
  container: {
    height: 310,
    width: 400,
    padding: 10,
  },
  collapsedContainer: {
    height: 470,
    width: 700,
    padding: 20,
  },
  selectCountry: {
    width: '100%',
    transition: 'width .35s ease-in-out'
  },
  selectAirport: {
    width: 240,
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
}

const initialState = {
  loading: false,
  success: false,
  destCountry: null,
  destAirport: null,
  orgCountry: null,
  orgAirport: null,
  date: new Date(),
  filteredFlights: null
}

class DeleteFlight extends Component {
    state = {
        loading: false,
        flights: null
      }
      
  componentDidMount() {
    this.setState({ loading: true })
    const flightsRef = firebase.firestore().collection("flights")
    flightsRef.onSnapshot(snapshot => this.setState({ flights: snapshot.docs, loading: false }))
  }

  render(details) {
    const { open } = this.props
    const { flights, openFlight } = this.state
    const { loading, success, countries, destCountry, destAirport, orgCountry, orgAirport, date } = this.state

    return (
      <Dialog
        open={open}
        onClose={this.handleClose.bind(this)}
        maxWidth={false}
      >
        <Box
          style={styles.container}
        >
          <div>
            <DialogTitle id="form-dialog-title">REMOVE FLIGHT DATA</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <p>Are you sure you want to remove this flight from records?</p>
                </DialogContentText>
            </DialogContent>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '20px 0px' }}>
            <ThemeProvider theme={customPostTheme}>
              <Button
                variant={success ? "outlined" : "contained"}
                color={success ? "secondary" : "secondary"}
                disabled={loading}
                onClick={() => this.removeFlight(orgAirport, destAirport, date)}
              >
                {success ? 'REMOVED' : 'REMOVE'}
                {loading && <CircularProgress size={24} style={styles.buttonProgress} />}
              </Button>
            </ThemeProvider>
          </div>
        </Box>
      </Dialog>
    )
  }

  async removeFlight(origin, destination, date) {
    if (!this.state.success) {
        this.setState({ loading: true })
        const flightsRef = this.props.firebase.flights()
        const flightRef = await flightsRef.doc()
        const userRef = await this.props.firebase.user(this.props.userId)

        await this.props.firebase.removePost(this.props.userId, flightRef)

        this.setState({ loading: false, success: true })
    }
  }

  handleClose() {
    this.setState({ ...initialState })
    this.props.onClose()
  }
}

const mapStateToProps = (state) => ({
  userId: state.auth.user.uid
})

export default connect(
  mapStateToProps
)(withFirebase(DeleteFlight))