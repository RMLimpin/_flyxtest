import React, { Component, useState } from 'react'
import PropTypes from 'prop-types'
import Icon from '@mdi/react'
import airport from 'airport-codes'
import moment from 'moment'
import { mdiAirplane, mdiPlus } from '@mdi/js'
import { Box, Button, IconButton } from '@material-ui/core'
import { Overlay } from '.'
import { grey } from '@material-ui/core/colors'
import { Edit, Favorite, HighlightOffRounded } from '@material-ui/icons'
import DeleteFlight from './DeleteFlight'
import EditFlight from './EditFlight'
import { firebase } from '@firebase/app';
import '@firebase/firestore'

const cardHeight = 300
const cardWidth = 236
const styles = {
  overlay: {
    borderRadius: 10,
    background: 'rgba(0,0,0,0.1)',
    height: '50%',
    marginTop: '55%'
  },
  overlayHidden: {
    transform: `scale(0.8) translateY(-${cardHeight * 1.2}px)`
  },
  overlayShown: {
    transform: `scale(1) translateY(-${cardHeight * -0.1}px)`
  },
  card: {
    borderRadius: 10,
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    padding: 8,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    height: cardHeight,
    width: cardWidth,
    position: 'relative',
  },
  airportCode: {
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Anton',
    fontSize: 32
  },
  airportName: {
    display: 'flex',
    justifyContent: 'center',
    fontSize: 12
  }
}

/**
* @augments {Component<{  item:object>}
*/
class FlightCard extends Component {
  state = {
    hovered: false,
    openEditFlight: false,
    openRemoveFlight: false,
    flights: null,
  }

  render() {
    const { details, id } = this.props
    const { hovered } = this.state
    const { editflights, openEditFlight } = this.state
    const { removeflights, openRemoveFlight } = this.state
    return (
      <div style={styles.container}
        onMouseOver={this.hover.bind(this)}
        onMouseLeave={this.unhover.bind(this)}
      >
        <Box style={styles.card} id={id}>
          {this.renderFlight(details)}
        </Box>
        <Overlay show={hovered} style={styles.overlay} styleShown={styles.overlayShown} styleHidden={styles.overlayHidden} />
        <EditFlight open={openEditFlight} onClose={() => this.setState({ openEditFlight: false })} details={details} id={id}/>
        <DeleteFlight open={openRemoveFlight} onClose={() => this.setState({ openRemoveFlight: false })} details={details} id={id} />
      </div>
    )
  }

  renderFlight(details, id) {
    return (
      <div style={{ height: '97%', width: '97%', borderRadius: 8, backgroundColor: grey[200] }} >
            <div className="tools" style={{ marginTop: '-15px', float: 'right'}}>
              <IconButton variant="contained" color="primary" size="small" 
                className="hidden-button" onClick={() => this.setState({ openEditFlight: true })}> <Edit />
              </IconButton>  {' '}
              <IconButton variant="contained" color="secondary" size="small" 
                className="hidden-button" onClick={() => this.setState({ openRemoveFlight: true })} > <HighlightOffRounded />
              </IconButton>
            </div>
            
              
            <div style={{ height: '50%', width: '100%', fontFamily: 'Open Sans Condensed', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            fontSize: 120 }} onClick={() => this.updateVote(id)}>
              {details.current}{id}
            </div>
            
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
              <Icon style={{ flex: 1 }} path={mdiAirplane}
                rotate={90} size={2}
              />
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

  formatAirport(airport) {
    return airport.replace(/\b(\w*Intl\w*)\b/g, "")
      .replace(/\b(\w*Airport\w*)\b/g, "")

  }

  hover() {
    this.setState({ hovered: true })
    this.setState({ showbtns: true })
  }

  unhover() {
    this.setState({ hovered: false })
    this.setState({ showbtns: false })
  }

  async updateVote(id) {
    this.setState({ loading: true })
    console.log(id)
    // await firebase.firestore().collection("flights").doc(id).update({
    //   current:  firebase.firestore.FieldValue.increment(1)
    // })

    this.setState({ loading: false, success: true })
}
}

FlightCard.propTypes = {
  item: PropTypes.object
}

export default FlightCard