import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withFirebase } from '../../firebase'
import { firebase } from '@firebase/app';
import '@firebase/firestore'
import { createMuiTheme, Dialog, Box, Divider, Button, CircularProgress, DialogTitle, Icon } from '@material-ui/core'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'
import { ThemeProvider } from '@material-ui/styles';
import { OutlinedSelect } from '../common'
import MomentUtils from "@date-io/moment"
import airport from 'airport-codes'
import moment from 'moment'
import { COLORS } from '../../constants'
import { mdiAirplane } from '@mdi/js'

const customPostTheme = createMuiTheme({
  palette: {
    primary: {
      main: COLORS.primary
    },
    secondary: {
      main: COLORS.green
    },
  },
})

const styles = {
  container: {
    height: 370,
    width: 500,
    padding: 20,
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
  success: false
}

class EditFlight extends Component {


  componentWillMount() {
    let countries = airport.toJSON().map((model) => model.country)
    const uniqueCountries = new Set(countries)
    countries = [...uniqueCountries]
    countries.sort()
    this.setState({
      countries
    })
  }

  render() {
    const { details, open, id } = this.props
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
          <DialogTitle id="form-dialog-title">EDIT FLIGHT DATA</DialogTitle>
          Changing records of flight <b>{details.origin} - {details.destination}</b>
          {this.renderOrigin(countries, orgCountry, orgAirport)}
          {this.renderDestination(countries, destCountry, destAirport)}
          <div style={{ display: 'flex' }}>
            <div style={{ marginRight: 10, transform: 'translate(0px, 15px)' }}>
              Date
            </div>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <DatePicker
                style={{ margin: "10px 0px" }}
                format='LL'
                value={moment(details.date).format("LL")}
                onChange={(value) => this.setState({ date: value })}
              />
            </MuiPickersUtilsProvider>
          </div>
          <Divider />
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', margin: '20px 0px' }}>
            <ThemeProvider theme={customPostTheme}>
              <Button
                variant={success ? "outlined" : "contained"}
                color={success ? "secondary" : "primary"}
                disabled={loading}
                onClick={() => this.updateFlight(orgAirport, destAirport, date, id)}
              >
                {success ? 'UPDATED' : 'UPDATE'}
                {loading && <CircularProgress size={24} style={styles.buttonProgress} />}
              </Button>
            </ThemeProvider>
          </div>
        </Box>
      </Dialog>
    )
  }

  renderFlight(details) {
    return (
      <div>
            <div style={{ height: '10%', display: 'flex', justifyContent: 'center' }}>
              {moment(details.date).format("LL")}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ flex: 2 }}>
                <div style={styles.airportCode}>
                  {details.origin}
                </div>
                <div style={styles.airportName}>
                  {this.formatAirport(airport.findWhere({ iata: details.origin }).get('name'))}
                </div>
              </div>
              <div style={{ flex: 2 }}>
                <div style={styles.airportCode}>
                  {details.destination}
                </div>
                <div style={styles.airportName}>{
                  this.formatAirport(airport.findWhere({ iata: details.destination }).get('name'))}
                </div>
              </div>
            </div>
            

      </div>
    )
  }

  async updateFlight(origin, destination, date, id) {
      this.setState({ loading: true })
      // const flightsRef = this.props.firebase.flights()
      // const flightRef = await flightsRef.doc()
      // const userRef = await this.props.firebase.user(this.props.userId)

      await firebase.firestore().collection("flights").doc(id).update({
        origin: this.getIata(origin),
        destination: this.getIata(destination),
        date: moment(date).startOf('day').toDate().toString()
      })

      this.setState({ loading: false, success: true })
  }

  rendercountries(countries) {
    if (countries) {
      return (countries.map((country) => {
        return <option value={country}>{country}</option>
      }))
    }
  }

  renderAirports(country) {
    if (country) {
      const airportModelsCountry = airport.filter((model) => model.get('country') == country)
      const airports = airportModelsCountry.map((city) => city.get('name'))
      return (airports.map((airport) => {
        return <option value={airport}>{airport}</option>
      }))
    }
  }

  getIata(name) {
    return airport.findWhere({ name: name }).get('iata')
  }

  // renderFlights(origin, destination, date) {
  //   const flightsRef = this.props.firebase.flights()
  //   const filteredFlights = flightsRef
  //     .where('origin', '==', this.getIata(origin))
  //     .where('destination', '==', this.getIata(destination))
  //     .where('date', '==', moment(date).startOf('day').toDate().toString())
  //     .get()
  //     .then((snapshot) => console.log(snapshot.docs))
  // }

  renderOrigin(countries, country, airport, details) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0px' }}>
        <OutlinedSelect
          style={!!country ? { ...styles.selectCountry, width: 240 } : styles.selectCountry}
          label="Departure Country"
          labelWidth={135}
          value={country}
          onChange={(event) => this.setState({ orgCountry: event.target.value })}
        >
          <option />
          {this.rendercountries(countries)}
        </OutlinedSelect>
        {
          !!country ? <OutlinedSelect
            style={styles.selectAirport}
            label="Airport"
            labelWidth={47}
            value={airport}
            onChange={(event) => this.setState({ orgAirport: event.target.value })}
          >
            <option />
            {this.renderAirports(country)}
          </OutlinedSelect> : null
        }
      </div>
    )
  }

  renderDestination(countries, country, airport) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0px' }}>
        <OutlinedSelect
          style={!!country ? { ...styles.selectCountry, width: 240 } : styles.selectCountry}
          label="Arrival Country"
          labelWidth={110}
          value={country}
          onChange={(event) => this.setState({ destCountry: event.target.value })}
        >
          <option />
          {this.rendercountries(countries)}
        </OutlinedSelect>
        {
          !!country ? <OutlinedSelect
            style={styles.selectAirport}
            label="Airport"
            labelWidth={47}
            value={airport}
            onChange={(event) => this.setState({ destAirport: event.target.value })}
          >
            <option />
            {this.renderAirports(country)}
          </OutlinedSelect> : null
        }
      </div>
    )
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
)(withFirebase(EditFlight))
