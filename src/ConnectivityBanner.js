import React from 'react';
import { Animated, View, Text, Dimensions, StyleSheet } from 'react-native';

const { height, width } = Dimensions.get('window');
const DEFAULT_INTERVAL = 3000;
const PING_URL = 'https://clients3.google.com/generate_204';

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
    let intervalPing = setInterval(this.checkConnectivity, this.props.interval ? this.props.interval : DEFAULT_INTERVAL)
    this.setState({ intervalPing });
  }
  
  componentWillUnmount() {
    clearInterval(this.state.intervalPing);
  }

  checkConnectivity = async () => {
    let isConnected = false;
    setTimeout(() => {
      if (!isConnected) {
        this.setState({ 
          show: true,
          isConnected,
        })
      }
    }, 2000);
    let start = Date.now();
    fetch(PING_URL)
    .then(async res => {
      let end = Date.now();
      isConnected = true;
      this.updateConnectionState(start, end)
    })
    .catch(err => {
      this.setState({ 
        show: true,
        isConnected: false,
      })
    })
  }

  updateConnectionState = (start, end) => {
    let time = end - start;
    let lowConnectivity = false;
    let show = false;
    if (time >= 1000) {
      lowConnectivity = true;
      show = true;
    }
    this.setState({
      isConnected: true,
      lowConnectivity,
      show,
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
        toValue: height > 811 ? 40 : 50,
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
    let { isConnected, lowConnectivity, show, fadeAnim } = this.state;
    let status = this.statusMessage();
    show ? this.showAnimation() : this.hideAnimation();

    return (
      <Animated.View 
        style={[
          { height: fadeAnim },
          styles.bannerContainer, 
          (isConnected && lowConnectivity) && styles.orangeBackground, 
          !show && styles.hide,
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
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width,
    marginTop: height > 811 ? 33 : 0,
    paddingTop: height > 811 ? 0 : 10
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
    display: 'none',
    marginTop: 0
  }
})

export default ConnectivityBanner;