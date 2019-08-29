import React from 'react';
import { Animated, View, Text, Dimensions, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const { height, width } = Dimensions.get('window');
const DEFAULT_INTERVAL = 2000

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
      intervalPing: null,
      fadeAnim: new Animated.Value(0),
      show: false
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
    let { lowConnectivity, isConnected } = this.state;
    let { effectiveType, type } = connectionState;
    if (effectiveType === '2g' || effectiveType === '3g') {
      lowConnectivity = true
    }
    this.setState({ 
      isConnected: type === 'none' ? false : isConnected,
      connectionInfo: {
        type,
        effectiveType
      },
      lowConnectivity,
      show: !isConnected ? true : lowConnectivity ? true : false
    })
  }

  statusMessage = () => {
    let { intl } = this.props;
    let { isConnected, lowConnectivity } = this.state;
    if (!isConnected) {
      return (this.props.messages && this.props.messages.notConnected) || 'No Internet Connection';
    }
    if (lowConnectivity) {
      return (this.props.messages && this.props.messages.lowConnectivity) || 'Low Connectivity';
    }
  }

  showAnimation = () => {
    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 40,
        duration: 300
      }
    ).start();
  }

  hideAnimation = () => {
    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 0,
        duration: 300
      }
    ).start()
  }

  render() {
    let { lowConnectivity, show, fadeAnim } = this.state;
    let status = this.statusMessage();
    show ? this.showAnimation() : this.hideAnimation();

    return (
      <Animated.View 
        style={[
          { height: fadeAnim },
          styles.bannerContainer, 
          lowConnectivity && styles.orangeBackground, 
          this.props.styleOverride ? this.props.styleOverride : styles.absolute,
        ]}
      >
        <Text style={styles.bannerText}>
          {status}
        </Text>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor :'rgba(181, 36, 36, 1)',
    // height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
  },
  styles: {
    position: 'absolute',
    top: height >= 812 ? 30 : 0,
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

export default ConnectivityBanner;