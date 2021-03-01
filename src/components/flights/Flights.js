import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withAuthorization } from '../../session'
import { withFirebase } from '../../firebase'
import { firebase } from '@firebase/app';
import '@firebase/firestore'
import { withRouter } from 'react-router-dom'
import { compose } from 'redux'
import { Icon } from '@mdi/react'
import { mdiEmailEdit, mdiPlus } from '@mdi/js'
import { Main } from '../'
import { FlightCard, AddFlight, EditFlight } from '.'

class Flights extends Component {

  actions = [
    {
      icon: <Icon path={mdiPlus} size={1} />,
      onClick: () => this.setState({ openFlight: true })
    }
  ]

  state = {
    loading: false,
    flights: null,
    openFlight: false
  }
  
  componentDidMount() {
    this.setState({ loading: true })
    const flightsRef = this.props.firebase.flights().orderBy("current", "desc")
    flightsRef.onSnapshot(snapshot => this.setState({ flights: snapshot.docs, loading: false }))
  }

  render() {
    const { flights, openFlight } = this.state
    return (
      <Main actions={this.actions}>
        {this.renderFlightCards(flights)}
        <AddFlight open={openFlight} onClose={() => this.setState({ openFlight: false })} />
      </Main>
    )
  }

  renderFlightCards(flights) {
    if (flights) {
      return flights.map((flight) => {
        return <FlightCard details={flight.data()} id={flight.id} />
      })
    }
  }
}

const condition = authUser => !!authUser;

export default connect()(
  compose(
    withRouter,
    withFirebase,
    withAuthorization(condition),
  )(Flights))