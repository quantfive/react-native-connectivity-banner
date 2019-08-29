import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { injectIntl } from 'react-intl';
import NetInfo from '@react-native-community/netinfo';

const { height, width } = Dimensions.get('window');
const DEFAULT_INTERVAL = 1000

class ConnectivityBanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: false,
      connectionInfo: {
        type: '',
        effectiveType: ''
      },
      lowConnectivity: false,
      intervalPing: null
    }
  }



  componentDidMount = async () => {
    NetInfo.addEventListener('connectionChange', this.updateConnectionState);
    await this.checkConnectivity();
    let intervalPing = setInterval(this.checkConnectivity, this.props.interval ? this.props.interval : DEFAULT_INTERVAL)
    this.setState({ intervalPing });
  }
  
  componentWillUnmount() {
    NetInfo.removeEventListener('connectionChange', this.updateConnectionState);
    clearInterval(this.state.intervalPing);
  }

  checkConnectivity = () => {
    return NetInfo.isConnected.fetch().then(async isConnected => {
      if (isConnected !== this.state.isConnected) {
        await this.setState({ isConnected })
      }
      NetInfo.getConnectionInfo().then(connectionInfo => {
        this.updateConnectionState(connectionInfo)
      })
    })
  }

  updateConnectionState = (connectionState) => {
    let { effectiveType, type } = connectionState;
    let lowConnectivity = false;
    let isConnected = true;
    if (effectiveType === '2g' || effectiveType === '3g') {
      lowConnectivity = true
    }
    if (type === 'none') {
      isConnected = false
    }
    this.setState({ 
      isConnected,
      connectionInfo: {
        type,
        effectiveType
      },
      lowConnectivity
    })
  }

  statusMessage = () => {
    let { intl } = this.props;
    let { isConnected, lowConnectivity } = this.state;
    if (!isConnected) {
      return intl.formatMessage({ 
        id: 'no_internet_connection',
        defaultMessage: 'No Internet Connection'
      })
    }
    if (lowConnectivity) {
      return intl.formatMessage({
        id: 'low_connectivity',
        defaultMessage: 'Low Connectivity'
      })
    }
  }

  render() {
    let { isConnected, lowConnectivity } = this.state;
    let status = this.statusMessage();
    return (
      <View style={[
        styles.bannerContainer, 
        lowConnectivity && styles.orangeBackground, 
        this.props.styleOverride && this.props.styleOverride, 
        isConnected ? lowConnectivity ? null : styles.hide : styles.hide,
      ]}>
        <Text style={styles.bannerText}>
          {status}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor :'rgba(181, 36, 36, 1)',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    position: 'absolute',
    top: height > 811 ? 30 : 0,
  },
  orangeBackground: {
    backgroundColor: 'orange'
  },
  bannerText: {
    color: '#fff'
  },
  hide: {
    display: 'none'
  }
})

export default injectIntl(ConnectivityBanner);